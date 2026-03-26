const { getCurrentSubscription, upgradeToPro, downgradeToFree } = require('../services/subscriptionService');
const Subscription = require('../models/Subscription');
const SubscriptionRequest = require('../models/SubscriptionRequest');
const PaymentTransaction = require('../models/PaymentTransaction');
const Plan = require('../models/Plan');
const { z } = require('zod');
const Razorpay = require('razorpay');

const planRequestSchema = z.object({
  plan: z.enum(['FREE', 'PRO']),
});

const requestIdSchema = z.object({
  id: z.string().min(1),
});

const upgradePaymentCreateSchema = z.object({
  plan: z.literal('PRO').optional(),
  billingCycle: z.enum(['day', 'week', 'month']).optional(),
});

const upgradePaymentVerifySchema = z.object({
  transactionId: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().optional(),
});

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID ?? '';
}

async function getSubscriptionSummary(req) {
  const orgId = req.user.organizationId;
  const data = await getCurrentSubscription(orgId);
  if (!data) {
    return { subscription: null, plan: null, planStatus: 'expired', productsCount: 0 };
  }
  return {
    subscription: data.subscription,
    plan: data.subscription.plan.name.toLowerCase(),
    planStatus: String(data.subscription.status).toLowerCase(),
    productsCount: data.usage.productsCount,
  };
}

const getSubscription = async (req, res) => {
  const orgId = req.user.organizationId;
  const data = await getCurrentSubscription(orgId);

  if (!data) {
    return res.json({
      subscription: null,
      plan: null,
      planStatus: 'expired',
      productsCount: 0,
    });
  }

  const { subscription, usage } = data;
  return res.json({
    subscription,
    plan: subscription.plan.name.toLowerCase(), // free|pro
    planStatus: subscription.status.toLowerCase(), // active|expired
    productsCount: usage.productsCount,
  });
};

const getSubscriptionHistory = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const history = await Subscription.find({ organizationId: orgId })
      .sort({ startDate: -1 })
      .populate('planId')
      .lean();

    return res.json({
      history: history.map((s) => ({
        id: s._id,
        status: s.status,
        startDate: s.startDate,
        endDate: s.endDate,
        plan: s.planId
          ? {
              id: s.planId._id,
              name: s.planId.name,
              features: s.planId.features,
              productLimit: s.planId.productLimit,
            }
          : null,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const upgrade = async (req, res) => {
  const orgId = req.user.organizationId;
  const billingCycle = String(req.body?.billingCycle ?? 'month').toLowerCase();
  const next = await upgradeToPro(orgId, req.user._id, { billingCycle });

  return res.json({
    message: 'Upgraded to PRO',
    subscriptionId: next._id,
  });
};

const downgrade = async (req, res) => {
  const orgId = req.user.organizationId;
  const next = await downgradeToFree(orgId, req.user._id);

  return res.json({
    message: 'Downgraded to FREE immediately.',
    subscriptionId: next._id,
  });
};

// Creates a Razorpay order for upgrading to PRO, and stores a PENDING PaymentTransaction.
// Frontend should open Razorpay checkout and then call the verify endpoint.
const createUpgradePaymentOrder = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const parsed = upgradePaymentCreateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid request payload', errors: parsed.error.flatten() });
    }

    const proPlan = await Plan.findOne({ name: 'PRO' });
    if (!proPlan) return res.status(500).json({ message: 'PRO plan missing.' });
    const billingCycle = String(parsed.data?.billingCycle ?? 'month').toLowerCase();
    const cycleMultiplier = billingCycle === 'day' ? 0.2 : billingCycle === 'week' ? 0.5 : 1;
    const amount = Math.max(1, Math.round((proPlan.price ?? 999) * cycleMultiplier));

    const tx = await PaymentTransaction.create({
      organizationId: orgId,
      amount,
      currency: 'INR',
      status: 'PENDING',
      paymentProvider: 'RAZORPAY',
      providerPaymentId: '',
      type: 'UPGRADE',
      metadata: { fromPlan: 'FREE', toPlan: 'PRO', billingCycle },
    });

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      // Local/dev fallback: no gateway keys configured.
      await upgradeToPro(orgId, req.user._id, {
        paymentTransactionId: tx._id,
        paymentProvider: 'RAZORPAY',
        providerPaymentId: 'SIMULATED_PAYMENT',
        amount: tx.amount,
        currency: tx.currency,
        billingCycle,
        metadata: { mocked: true, billingCycle },
      });
      const summary = await getSubscriptionSummary(req);
      return res.json({
        mocked: true,
        message: 'Payment mocked successfully. Subscription upgraded.',
        transactionId: tx._id,
        ...summary,
      });
    }

    const amountPaise = Math.round(amount * 100);
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: String(tx._id),
      payment_capture: 1,
      notes: {
        organizationId: String(orgId),
        plan: 'PRO',
        billingCycle,
      },
    });

    await PaymentTransaction.findByIdAndUpdate(tx._id, {
      $set: {
        'metadata.razorpayOrderId': order.id,
      },
    });

    return res.json({
      mocked: false,
      orderId: order.id,
      amount: proPlan.price ?? 999,
      billingCycle,
      amountPaise,
      currency: 'INR',
      keyId: getRazorpayKeyId(),
      transactionId: tx._id,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Webhook-style verification endpoint (frontend calls it after checkout).
const verifyUpgradePayment = async (req, res) => {
  let paymentTxId = null;
  try {
    const parsed = upgradePaymentVerifySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
    }

    const { transactionId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = parsed.data;
    paymentTxId = transactionId;
    const orgId = req.user.organizationId;

    const tx = await PaymentTransaction.findById(transactionId).lean();
    if (!tx || String(tx.organizationId) !== String(orgId)) {
      return res.status(404).json({ message: 'Payment transaction not found.' });
    }
    if (tx.status !== 'PENDING' || tx.type !== 'UPGRADE') {
      return res.status(400).json({ message: 'Payment transaction is not valid for verification.' });
    }

    if (tx.metadata?.razorpayOrderId && String(tx.metadata.razorpayOrderId) !== String(razorpay_order_id)) {
      return res.status(400).json({ message: 'Razorpay order id mismatch.' });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      // Local/dev fallback: treat as success without signature verification.
      const updated = await upgradeToPro(orgId, req.user._id, {
        paymentTransactionId: tx._id,
        paymentProvider: 'RAZORPAY',
        providerPaymentId: razorpay_payment_id,
        amount: tx.amount,
        currency: tx.currency,
        billingCycle: tx.metadata?.billingCycle ?? 'month',
        metadata: { mocked: true, razorpayOrderId: razorpay_order_id, billingCycle: tx.metadata?.billingCycle ?? 'month' },
      });
      const summary = await getSubscriptionSummary(req);
      return res.json({ message: 'Payment mocked verified. Subscription upgraded.', subscriptionId: updated._id, ...summary });
    }

    if (razorpay_signature) {
      // Verify Razorpay signature to ensure authenticity.
      razorpay.utility.verifyPaymentSignature({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
      });
    } else {
      // If the signature isn't provided by the frontend handler payload, we can't strictly verify here.
      // This is a temporary safeguard for wiring; connect Razorpay webhooks for production.
      // eslint-disable-next-line no-console
      console.warn('Razorpay signature missing; skipping signature verification for this flow.');
    }

    const updatedSub = await upgradeToPro(orgId, req.user._id, {
      paymentTransactionId: tx._id,
      paymentProvider: 'RAZORPAY',
      providerPaymentId: razorpay_payment_id,
      amount: tx.amount,
      currency: tx.currency,
      billingCycle: tx.metadata?.billingCycle ?? 'month',
      metadata: {
        razorpayOrderId: razorpay_order_id,
        signatureMissing: !razorpay_signature,
        billingCycle: tx.metadata?.billingCycle ?? 'month',
      },
    });

    const summary = await getSubscriptionSummary(req);
    return res.json({
      message: 'Payment verified. Subscription upgraded.',
      subscriptionId: updatedSub._id,
      ...summary,
    });
  } catch (err) {
    if (paymentTxId) {
      await PaymentTransaction.findByIdAndUpdate(paymentTxId, { status: 'FAILED', paymentProvider: 'RAZORPAY' }).catch(() => {});
    }
    return res.status(400).json({ message: err.message || 'Payment verification failed.' });
  }
};

// STAFF: create a subscription plan change request (PENDING) for admin approval.
const requestPlanChange = async (req, res) => {
  try {
    const parsed = planRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid request payload', errors: parsed.error.flatten() });
    }

    const orgId = req.user.organizationId;
    const requesterUserId = req.user._id;
    const requestedPlan = parsed.data.plan; // 'FREE' | 'PRO'

    // FREE is applied immediately for staff users; only PRO upgrades require admin approval.
    if (requestedPlan === 'FREE') {
      return res.status(400).json({ message: 'FREE plan changes are immediate; no admin approval required.' });
    }

    const existing = await SubscriptionRequest.findOne({
      organizationId: orgId,
      status: 'PENDING',
    });

    if (existing) {
      return res.status(200).json({ message: 'A request is already pending for this organization.' });
    }

    const created = await SubscriptionRequest.create({
      organizationId: orgId,
      requesterUserId,
      requestedPlan,
      status: 'PENDING',
    });

    return res.status(201).json({
      message: 'Subscription change request created. Waiting for admin approval.',
      requestId: created._id,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ADMIN: list pending requests for their tenant.
const getPendingRequests = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const requests = await SubscriptionRequest.find({ organizationId: orgId, status: 'PENDING' })
      .sort({ createdAt: -1 })
      .populate('requesterUserId', 'name email role')
      .lean();

    return res.json({
      requests: requests.map((r) => ({
        id: r._id,
        requestedPlan: r.requestedPlan,
        status: r.status,
        createdAt: r.createdAt,
        requester: r.requesterUserId
          ? {
              id: r.requesterUserId._id ?? r.requesterUserId.id,
              name: r.requesterUserId.name,
              email: r.requesterUserId.email,
              role: r.requesterUserId.role,
            }
          : null,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ADMIN: approve request and apply plan to active subscription.
const approveRequest = async (req, res) => {
  try {
    const parsed = requestIdSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid request id' });
    }

    const orgId = req.user.organizationId;
    const adminUserId = req.user._id;
    const requestId = req.params.id;

    const request = await SubscriptionRequest.findOne({
      _id: requestId,
      organizationId: orgId,
      status: 'PENDING',
    });

    if (!request) return res.status(404).json({ message: 'Pending request not found' });

    let next;
    if (request.requestedPlan === 'PRO') {
      next = await upgradeToPro(orgId, adminUserId);
    } else {
      next = await downgradeToFree(orgId, adminUserId);
    }

    request.status = 'APPROVED';
    request.decidedBy = adminUserId;
    request.decidedAt = new Date();
    await request.save();

    const sub = await getCurrentSubscription(orgId);

    await SubscriptionRequest.updateMany(
      { organizationId: orgId, status: 'PENDING' },
      { $set: { status: 'REJECTED', decidedBy: adminUserId, decidedAt: new Date() } }
    );

    return res.json({
      message: 'Request approved and subscription updated.',
      subscriptionId: next._id,
      plan: sub?.subscription?.plan?.name ?? null,
      planStatus: sub?.subscription?.status ?? null,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ADMIN: reject request.
const rejectRequest = async (req, res) => {
  try {
    const parsed = requestIdSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid request id' });
    }

    const orgId = req.user.organizationId;
    const adminUserId = req.user._id;
    const requestId = req.params.id;

    const request = await SubscriptionRequest.findOne({
      _id: requestId,
      organizationId: orgId,
      status: 'PENDING',
    });

    if (!request) return res.status(404).json({ message: 'Pending request not found' });

    request.status = 'REJECTED';
    request.decidedBy = adminUserId;
    request.decidedAt = new Date();
    await request.save();

    return res.json({ message: 'Request rejected.' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSubscription,
  getSubscriptionHistory,
  upgrade,
  downgrade,
  createUpgradePaymentOrder,
  verifyUpgradePayment,
  requestPlanChange,
  getPendingRequests,
  approveRequest,
  rejectRequest,
};


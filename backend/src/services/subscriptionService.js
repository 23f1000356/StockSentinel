const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Usage = require('../models/Usage');
const PaymentTransaction = require('../models/PaymentTransaction');
const { logActivity } = require('../utils/logger');

const ensurePlansExist = async () => {
  const free = await Plan.findOne({ name: 'FREE' });
  if (!free) {
    await Plan.create({ name: 'FREE', price: 0, features: [], productLimit: 10, warehouseLimit: 1 });
  }

  const pro = await Plan.findOne({ name: 'PRO' });
  if (!pro) {
    await Plan.create({
      name: 'PRO',
      price: 999,
      features: ['ANALYTICS', 'MULTI_WAREHOUSE', 'BULK_IMPORT', 'EXPORT'],
      productLimit: 1000000,
      warehouseLimit: -1,
    });
  }
};

function getEndDateFromBillingCycle(startDate, billingCycle = 'month') {
  const d = new Date(startDate);
  if (billingCycle === 'day') {
    d.setDate(d.getDate() + 1);
    return d;
  }
  if (billingCycle === 'week') {
    d.setDate(d.getDate() + 7);
    return d;
  }
  d.setMonth(d.getMonth() + 1);
  return d;
}

async function getCurrentSubscription(orgId) {
  const now = new Date();

  // Effective subscription depends on dates (scheduled downgrades keep PRO entitlements until endDate).
  const effective = await Subscription.findOne({
    organizationId: orgId,
    status: 'ACTIVE',
    startDate: { $lte: now },
    $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }],
  }).populate('planId');

  const sub =
    effective ||
    (await Subscription.findOne({ organizationId: orgId })
      .sort({ startDate: -1 })
      .populate('planId'));

  if (!sub) return null;

  const usage = await Usage.findOne({ organizationId: orgId });
  return {
    subscription: {
      id: sub._id,
      organizationId: sub.organizationId,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate ?? null,
      plan: {
        id: sub.planId._id,
        name: sub.planId.name,
        features: sub.planId.features,
        productLimit: sub.planId.productLimit,
        warehouseLimit: sub.planId.warehouseLimit,
      },
    },
    usage: usage ? { productsCount: usage.productsCount, warehousesCount: usage.warehousesCount } : { productsCount: 0, warehousesCount: 0 },
  };
}

async function upgradeToPro(orgId, adminUserId, opts = {}) {
  const now = new Date();
  await ensurePlansExist();

  const current = await Subscription.findOne({ organizationId: orgId }).populate('planId');
  const fromPlan = current?.planId?.name || 'FREE';

  const proPlan = await Plan.findOne({ name: 'PRO' });

  const billingCycle = String(opts.billingCycle ?? 'month').toLowerCase();
  const endDate = getEndDateFromBillingCycle(now, billingCycle);

  // Any scheduled/active subscriptions are cancelled when upgrading instantly.
  await Subscription.updateMany(
    { organizationId: orgId, status: 'ACTIVE' },
    { $set: { status: 'EXPIRED', endDate: now } }
  );

  const next = await Subscription.create({
    organizationId: orgId,
    planId: proPlan._id,
    status: 'ACTIVE',
    startDate: now,
    endDate,
  });

  await logActivity('SUBSCRIPTION_UPGRADED', adminUserId, orgId, {
    fromPlan,
    toPlan: 'PRO',
    billingCycle,
    subscriptionId: next._id,
  });

  // If the payment controller already created a transaction, update it.
  if (opts.paymentTransactionId) {
    await PaymentTransaction.findByIdAndUpdate(opts.paymentTransactionId, {
      status: 'SUCCESS',
      paymentProvider: opts.paymentProvider ?? 'RAZORPAY',
      providerPaymentId: opts.providerPaymentId ?? '',
      amount: opts.amount ?? (proPlan?.price ?? 999),
      currency: opts.currency ?? 'INR',
      metadata: {
        ...(opts.metadata ?? {}),
        fromPlan,
        toPlan: 'PRO',
        billingCycle,
        endDate,
        subscriptionId: next._id,
      },
    });
  } else {
    await PaymentTransaction.create({
      organizationId: orgId,
      amount: proPlan?.price ?? 999,
      currency: 'INR',
      status: 'SUCCESS',
      paymentProvider: 'MANUAL',
      type: 'UPGRADE',
      metadata: { fromPlan, toPlan: 'PRO', billingCycle, endDate, subscriptionId: next._id },
    });
  }

  return next;
}

async function downgradeToFree(orgId, adminUserId) {
  // Immediate downgrade (used by admin overrides / compatibility).
  const now = new Date();
  await ensurePlansExist();

  const current = await Subscription.findOne({ organizationId: orgId }).populate('planId');
  const fromPlan = current?.planId?.name || 'PRO';

  const freePlan = await Plan.findOne({ name: 'FREE' });
  await Subscription.updateMany(
    { organizationId: orgId, status: 'ACTIVE' },
    { $set: { status: 'EXPIRED', endDate: now } }
  );

  const next = await Subscription.create({
    organizationId: orgId,
    planId: freePlan._id,
    status: 'ACTIVE',
    startDate: now,
    endDate: null,
  });

  await logActivity('SUBSCRIPTION_DOWNGRADED', adminUserId, orgId, {
    fromPlan,
    toPlan: 'FREE',
    subscriptionId: next._id,
  });

  await PaymentTransaction.create({
    organizationId: orgId,
    amount: 0,
    currency: 'INR',
    status: 'SUCCESS',
    paymentProvider: 'MANUAL',
    type: 'DOWNGRADE',
    metadata: { fromPlan, toPlan: 'FREE', subscriptionId: next._id },
  });

  return next;
}

async function scheduleDowngradeToFree(orgId, adminUserId, effectiveAt) {
  // Scheduled downgrade: PRO entitlements remain until `effectiveAt`.
  const now = new Date();
  await ensurePlansExist();

  const proEffective = await Subscription.findOne({
    organizationId: orgId,
    status: 'ACTIVE',
    startDate: { $lte: now },
    $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }],
  }).populate('planId');

  const fromPlan = proEffective?.planId?.name || 'PRO';
  const freePlan = await Plan.findOne({ name: 'FREE' });

  // If there's an existing billing end date, keep it; otherwise schedule 30 days ahead.
  const scheduledAt =
    effectiveAt ??
    (proEffective?.endDate && proEffective.endDate > now ? proEffective.endDate : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));

  if (proEffective) {
    proEffective.endDate = scheduledAt;
    // Keep it ACTIVE so entitlement checks rely on date window.
    await proEffective.save();

    // Cancel any other active (scheduled) subscriptions to avoid overlapping entitlements.
    await Subscription.updateMany(
      { organizationId: orgId, status: 'ACTIVE', _id: { $ne: proEffective._id } },
      { $set: { status: 'EXPIRED', endDate: now } }
    );
  }

  const nextFree = await Subscription.create({
    organizationId: orgId,
    planId: freePlan._id,
    status: 'ACTIVE',
    startDate: scheduledAt,
    endDate: null,
  });

  await logActivity('SUBSCRIPTION_DOWNGRADE_SCHEDULED', adminUserId, orgId, {
    fromPlan,
    toPlan: 'FREE',
    effectiveAt: scheduledAt,
    subscriptionId: nextFree._id,
  });

  // Downgrades typically don't charge; we still record the event for analytics/audit.
  await PaymentTransaction.create({
    organizationId: orgId,
    amount: 0,
    currency: 'INR',
    status: 'SUCCESS',
    paymentProvider: 'MANUAL',
    type: 'DOWNGRADE',
    metadata: { fromPlan, toPlan: 'FREE', effectiveAt: scheduledAt, subscriptionId: nextFree._id },
  });

  return nextFree;
}

module.exports = {
  getCurrentSubscription,
  upgradeToPro,
  downgradeToFree,
  scheduleDowngradeToFree,
};


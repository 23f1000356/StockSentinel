const Organization = require('../models/Organization');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Usage = require('../models/Usage');
const Activity = require('../models/Activity');
const SubscriptionRequest = require('../models/SubscriptionRequest');
const PaymentTransaction = require('../models/PaymentTransaction');
const { upgradeToPro, downgradeToFree } = require('../services/subscriptionService');
 
const MONTHS_TO_FETCH = 6;
const ACTIONS_FOR_FEATURES = {
  bulk_import: 'PRODUCTS_BULK_IMPORTED',
  export: 'EXPORT_GENERATED',
  multi_warehouse: 'WAREHOUSE_CREATED',
};

const getTenants = async (req, res) => {
  try {
    const orgs = await Organization.find({}).sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(
      orgs.map(async (org) => {
        const [usersCount, latestSub, usage] = await Promise.all([
          User.countDocuments({ organizationId: org._id }),
          Subscription.findOne({ organizationId: org._id }).sort({ startDate: -1 }).populate('planId').lean(),
          Usage.findOne({ organizationId: org._id }).lean(),
        ]);

        return {
          id: org._id,
          name: org.name,
          createdAt: org.createdAt,
          usersCount,
          plan: latestSub?.planId?.name ?? 'FREE',
          planStatus: latestSub?.status ?? 'EXPIRED',
          productsCount: usage?.productsCount ?? 0,
          warehousesCount: usage?.warehousesCount ?? 0,
        };
      })
    );
    return res.json({ tenants: enriched });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({})
      .sort({ startDate: -1 })
      .populate('organizationId', 'name')
      .populate('planId')
      .lean();
    return res.json({
      subscriptions: subs.map((s) => ({
        id: s._id,
        organizationId: s.organizationId?._id ?? null,
        tenantName: s.organizationId?.name ?? 'Unknown',
        plan: s.planId?.name ?? 'FREE',
        status: s.status,
        startDate: s.startDate,
        endDate: s.endDate ?? null,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({}).sort({ name: 1 }).lean();
    return res.json({ plans });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, features, productLimit, warehouseLimit } = req.body || {};
    const patch = {};
    if (price !== undefined) patch.price = Number(price);
    if (features !== undefined) patch.features = Array.isArray(features) ? features : [];
    if (productLimit !== undefined) patch.productLimit = Number(productLimit);
    if (warehouseLimit !== undefined) patch.warehouseLimit = Number(warehouseLimit);

    const plan = await Plan.findByIdAndUpdate(id, patch, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    return res.json({ plan });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const rows = await PaymentTransaction.find({})
      .sort({ createdAt: -1 })
      .populate('organizationId', 'name')
      .lean();
    return res.json({
      payments: rows.map((r) => ({
        id: r._id,
        tenantName: r.organizationId?.name ?? 'Unknown',
        amount: r.amount,
        currency: r.currency,
        status: r.status,
        provider: r.paymentProvider,
        type: r.type,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getLogs = async (req, res) => {
  try {
    const logs = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(300)
      .populate('userId', 'name email')
      .populate('organizationId', 'name')
      .lean();
    return res.json({
      logs: logs.map((l) => ({
        id: l._id,
        action: l.action,
        metadata: l.metadata ?? {},
        createdAt: l.createdAt,
        user: l.userId ? { id: l.userId._id, name: l.userId.name, email: l.userId.email } : null,
        tenant: l.organizationId ? { id: l.organizationId._id, name: l.organizationId.name } : null,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getSubscriptionRequests = async (req, res) => {
  try {
    const requests = await SubscriptionRequest.find({ status: 'PENDING' })
      .sort({ createdAt: -1 })
      .populate('organizationId', 'name')
      .populate('requesterUserId', 'name email')
      .lean();
    return res.json({
      requests: requests.map((r) => ({
        id: r._id,
        requestedPlan: r.requestedPlan,
        status: r.status,
        createdAt: r.createdAt,
        tenantName: r.organizationId?.name ?? 'Unknown',
        organizationId: r.organizationId?._id ?? null,
        requester: r.requesterUserId
          ? { id: r.requesterUserId._id, name: r.requesterUserId.name, email: r.requesterUserId.email }
          : null,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const approveSubscriptionRequest = async (req, res) => {
  try {
    const request = await SubscriptionRequest.findOne({ _id: req.params.id, status: 'PENDING' });
    if (!request) return res.status(404).json({ message: 'Pending request not found' });
    const orgId = request.organizationId;

    if (request.requestedPlan === 'PRO') await upgradeToPro(orgId, req.user._id);
    else await downgradeToFree(orgId, req.user._id);

    request.status = 'APPROVED';
    request.decidedBy = req.user._id;
    request.decidedAt = new Date();
    await request.save();
    return res.json({ message: 'Request approved' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const rejectSubscriptionRequest = async (req, res) => {
  try {
    const request = await SubscriptionRequest.findOne({ _id: req.params.id, status: 'PENDING' });
    if (!request) return res.status(404).json({ message: 'Pending request not found' });
    request.status = 'REJECTED';
    request.decidedBy = req.user._id;
    request.decidedAt = new Date();
    await request.save();
    return res.json({ message: 'Request rejected' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ADMIN override: immediate upgrade for a specific tenant orgId.
const adminOverrideUpgradeTenant = async (req, res) => {
  try {
    const orgId = req.params.id;
    const next = await upgradeToPro(orgId, req.user._id);
    return res.json({ message: 'Tenant upgraded to PRO', subscriptionId: next._id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ADMIN override: immediate downgrade for a specific tenant orgId (does not delete products).
const adminOverrideDowngradeTenant = async (req, res) => {
  try {
    const orgId = req.params.id;
    const next = await downgradeToFree(orgId, req.user._id);
    return res.json({ message: 'Tenant downgraded to FREE', subscriptionId: next._id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAnalyticsOverview = async (req, res) => {
  try {
    const now = new Date();
    const activeQuery = {
      status: 'ACTIVE',
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }],
    };

    const [totalTenants, totalSubscriptions, activeSubscriptions, activeSubsBase, expiredBase] = await Promise.all([
      Organization.countDocuments({}),
      Subscription.countDocuments({}),
      Subscription.countDocuments(activeQuery),
      Subscription.find(activeQuery).populate('planId').lean(),
      Subscription.countDocuments({ status: 'EXPIRED' }).then(async (baseExpired) => {
        // Also treat scheduled docs whose effective end has passed as expired.
        const endedActive = await Subscription.countDocuments({ status: 'ACTIVE', endDate: { $lt: now } });
        return baseExpired + endedActive;
      }),
    ]);

    const activeSubs = activeSubsBase;
    const mrr = activeSubs.reduce((sum, s) => {
      const planPrice = s.planId?.price;
      if (typeof planPrice === 'number') return sum + planPrice;
      if (String(s.planId?.name ?? '').toUpperCase() === 'PRO') return sum + 999;
      return sum + 0;
    }, 0);

    const churnRate = totalSubscriptions === 0 ? 0 : (expiredBase / totalSubscriptions) * 100;

    return res.json({
      totalTenants,
      activeSubscriptions,
      mrr,
      churnRate,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getRevenueSeries = async (req, res) => {
  try {
    const now = new Date();
    const since = new Date(now);
    since.setMonth(now.getMonth() - (MONTHS_TO_FETCH - 1));

    const rows = await PaymentTransaction.find({
      createdAt: { $gte: since },
      status: 'SUCCESS',
      type: 'UPGRADE',
    }).lean();

    const byMonth = new Map();
    for (const r of rows) {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(r.amount ?? 0));
    }

    const series = Array.from(byMonth.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([month, revenue]) => ({ month, revenue }));

    return res.json({ series });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getNewUsersSeries = async (req, res) => {
  try {
    const now = new Date();
    const since = new Date(now);
    since.setMonth(now.getMonth() - (MONTHS_TO_FETCH - 1));

    const rows = await Organization.find({
      createdAt: { $gte: since },
    }).lean();

    const byMonth = new Map();
    for (const org of rows) {
      const d = new Date(org.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    }

    const series = Array.from(byMonth.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([month, newUsers]) => ({ month, newUsers }));

    return res.json({ series });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getFeatureUsageSeries = async (req, res) => {
  try {
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - 30);

    const actionsToCount = Object.values(ACTIONS_FOR_FEATURES);
    const rows = await Activity.find({
      createdAt: { $gte: since },
      action: { $in: actionsToCount },
    }).lean();

    const counts = {
      bulk_import: 0,
      export: 0,
      multi_warehouse: 0,
    };

    for (const r of rows) {
      const action = r.action;
      for (const [key, expectedAction] of Object.entries(ACTIONS_FOR_FEATURES)) {
        if (action === expectedAction) counts[key] += 1;
      }
    }

    return res.json({
      usage: [
        { featureKey: 'bulk_import', count: counts.bulk_import },
        { featureKey: 'export', count: counts.export },
        { featureKey: 'multi_warehouse', count: counts.multi_warehouse },
      ],
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getTenants,
  getSubscriptions,
  getPlans,
  updatePlan,
  getPayments,
  getLogs,
  getSubscriptionRequests,
  approveSubscriptionRequest,
  rejectSubscriptionRequest,
  getAnalyticsOverview,
  getRevenueSeries,
  getNewUsersSeries,
  getFeatureUsageSeries,
  adminOverrideUpgradeTenant,
  adminOverrideDowngradeTenant,
};


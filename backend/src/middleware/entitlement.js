const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Usage = require('../models/Usage');

const checkSubscription = async (req, res, next) => {
  try {
    // Effective entitlements depend on the subscription's effective window.
    const now = new Date();
    const sub = await Subscription.findOne({
      organizationId: req.user.organizationId,
      status: 'ACTIVE',
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }],
    }).populate('planId');

    if (!sub || sub.status !== 'ACTIVE') {
      return res.status(402).json({ message: 'Subscription expired' });
    }

    req.plan = sub.planId;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkFeature = (feature) => (req, res, next) => {
  if (!req.plan.features.includes(feature)) {
    return res.status(403).json({ message: `Feature ${feature} not allowed in your plan` });
  }
  next();
};

const checkUsageLimit = (limitType) => async (req, res, next) => {
  try {
    if (limitType === 'PRODUCTS') {
      const usage = await Usage.findOne({ organizationId: req.user.organizationId });
      if (usage && usage.productsCount >= req.plan.productLimit) {
        return res.status(429).json({ message: 'Product limit exceeded' });
      }
    }

    if (limitType === 'WAREHOUSES') {
      let limit = req.plan?.warehouseLimit;
      if (typeof limit !== 'number') {
        // Backward compatibility: older Plan docs may not have warehouseLimit.
        const planName = String(req.plan?.name ?? '').toUpperCase();
        if (planName === 'FREE') limit = 1;
        if (planName === 'PRO') limit = -1;
      }
      // -1 means unlimited; undefined means fallback to unlimited.
      if (typeof limit !== 'number' || limit === -1) return next();

      const usage = await Usage.findOne({ organizationId: req.user.organizationId });
      const count = usage?.warehousesCount ?? 0;
      if (count >= limit) {
        return res.status(429).json({ message: 'Warehouse limit exceeded' });
      }
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { checkSubscription, checkFeature, checkUsageLimit };

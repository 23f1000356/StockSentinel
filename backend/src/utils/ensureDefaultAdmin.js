const User = require('../models/User');
const Organization = require('../models/Organization');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const Usage = require('../models/Usage');

const DEFAULT_ADMIN = {
  name: 'Admin',
  email: 'admin@gmail.com',
  password: 'admin123',
};

const PRO_PLAN = {
  name: 'PRO',
  price: 999,
  features: ['ANALYTICS', 'MULTI_WAREHOUSE', 'BULK_IMPORT', 'EXPORT'],
  productLimit: 1000000,
  warehouseLimit: -1,
};

/**
 * Ensures a known admin exists so the "default login" works reliably.
 * - Creates Organization/Subscription/Usage if missing.
 * - Resets admin password to DEFAULT_ADMIN.password and role to ADMIN.
 */
async function ensureDefaultAdmin() {
  const email = DEFAULT_ADMIN.email.toLowerCase();

  let user = await User.findOne({ email });

  // Create a default organization if needed (either missing user or missing organizationId).
  let organizationId = user?.organizationId;
  if (!organizationId) {
    const org = await Organization.create({ name: 'Default Admin Org' });
    organizationId = org._id;
  }

  // Ensure PRO plan exists (admin needs access to features used by the app).
  let plan = await Plan.findOne({ name: PRO_PLAN.name });
  if (!plan) {
    plan = await Plan.create(PRO_PLAN);
  }

  // Ensure subscription exists.
  let subscription = await Subscription.findOne({ organizationId }).populate('planId');
  if (!subscription) {
    subscription = await Subscription.create({
      organizationId,
      planId: plan._id,
      status: 'ACTIVE',
    });
  }

  // Ensure usage exists.
  const existingUsage = await Usage.findOne({ organizationId });
  if (!existingUsage) {
    await Usage.create({ organizationId, productsCount: 0, warehousesCount: 1 });
  }

  // Ensure default main warehouse exists for admin org.
  const Warehouse = require('../models/Warehouse');
  const existingMain = await Warehouse.findOne({ organizationId, name: 'Main' });
  if (!existingMain) {
    await Warehouse.create({ organizationId, name: 'Main', location: '' });
  }

  // Keep usage.warehousesCount consistent if missing/older schema.
  const usageAfter = await Usage.findOne({ organizationId });
  if (!usageAfter) return;
  if (typeof usageAfter.warehousesCount !== 'number') {
    const count = await Warehouse.countDocuments({ organizationId });
    usageAfter.warehousesCount = count;
    await usageAfter.save();
  }

  // Create or reset the admin user.
  if (!user) {
    user = await User.create({
      name: DEFAULT_ADMIN.name,
      email,
      password: DEFAULT_ADMIN.password,
      organizationId,
      role: 'ADMIN',
    });
  } else {
    user.name = DEFAULT_ADMIN.name;
    user.role = 'ADMIN';
    user.password = DEFAULT_ADMIN.password; // hashed by pre-save middleware
    user.organizationId = organizationId;
    await user.save();
  }
}

module.exports = { ensureDefaultAdmin };


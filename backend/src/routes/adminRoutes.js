const express = require('express');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { checkDefaultAdmin } = require('../middleware/checkDefaultAdmin');
const {
  getTenants,
  getSubscriptions,
  getPlans,
  updatePlan,
  getPayments,
  getLogs,
  getSubscriptionRequests,
  approveSubscriptionRequest,
  rejectSubscriptionRequest,
  adminOverrideUpgradeTenant,
  adminOverrideDowngradeTenant,
  getAnalyticsOverview,
  getRevenueSeries,
  getNewUsersSeries,
  getFeatureUsageSeries,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authMiddleware, checkRole(['ADMIN']), checkDefaultAdmin);

router.get('/admin/tenants', getTenants);
router.get('/admin/subscriptions', getSubscriptions);
router.get('/admin/plans', getPlans);
router.patch('/admin/plans/:id', updatePlan);
router.get('/admin/payments', getPayments);
router.get('/admin/logs', getLogs);
router.get('/admin/subscription-requests', getSubscriptionRequests);
router.post('/admin/subscription-requests/:id/approve', approveSubscriptionRequest);
router.post('/admin/subscription-requests/:id/reject', rejectSubscriptionRequest);

// Admin override actions for a specific tenant (edge cases).
router.post('/admin/tenants/:id/upgrade', adminOverrideUpgradeTenant);
router.post('/admin/tenants/:id/downgrade', adminOverrideDowngradeTenant);

router.get('/admin/analytics/overview', getAnalyticsOverview);
router.get('/admin/analytics/revenue-series', getRevenueSeries);
router.get('/admin/analytics/new-users-series', getNewUsersSeries);
router.get('/admin/analytics/feature-usage', getFeatureUsageSeries);

module.exports = router;


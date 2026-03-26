const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  getSubscription,
  upgrade,
  downgrade,
  createUpgradePaymentOrder,
  verifyUpgradePayment,
} = require('../controllers/subscriptionController');

const router = express.Router();

router.get('/subscription', authMiddleware, getSubscription);

// Users/admin: upgrade/downgrade immediate (payment lifecycle can be wired later).
router.post('/upgrade', authMiddleware, upgrade);

router.post('/downgrade', authMiddleware, downgrade);

// Payment-driven plan changes (SaaS-style).
router.post('/subscriptions/upgrade', authMiddleware, createUpgradePaymentOrder);
router.post('/subscriptions/upgrade/verify', authMiddleware, verifyUpgradePayment);
router.post('/subscriptions/downgrade', authMiddleware, downgrade);

module.exports = router;


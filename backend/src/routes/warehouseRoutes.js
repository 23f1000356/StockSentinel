const express = require('express');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { checkSubscription, checkFeature, checkUsageLimit } = require('../middleware/entitlement');
const { getWarehouses, createWarehouse, updateWarehouse } = require('../controllers/warehouseController');

const router = express.Router();

// Warehouses are tenant-scoped and available based on active subscription.
router.get('/warehouses', authMiddleware, checkSubscription, getWarehouses);

// Staff can create/update warehouses; Free plan is limited to 1 warehouse.
router.post(
  '/warehouses',
  authMiddleware,
  checkSubscription,
  checkUsageLimit('WAREHOUSES'),
  checkRole(['STAFF']),
  createWarehouse
);

router.patch(
  '/warehouses/:id',
  authMiddleware,
  checkSubscription,
  checkRole(['STAFF']),
  updateWarehouse
);

module.exports = router;


const express = require('express');
const { createProduct, getProducts, updateStock, deleteProduct } = require('../controllers/productController');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { checkSubscription, checkUsageLimit } = require('../middleware/entitlement');
const router = express.Router();

// Inventory write operations are for tenant users (STAFF) only.
router.post('/', authMiddleware, checkRole(['STAFF']), checkSubscription, checkUsageLimit('PRODUCTS'), createProduct);
router.get('/', authMiddleware, getProducts);
router.patch('/:id/stock', authMiddleware, checkRole(['STAFF']), checkSubscription, updateStock);
router.delete('/:id', authMiddleware, checkRole(['STAFF']), checkSubscription, deleteProduct);

module.exports = router;

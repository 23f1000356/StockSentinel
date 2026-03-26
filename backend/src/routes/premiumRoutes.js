const express = require('express');
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth');
const { checkSubscription, checkFeature } = require('../middleware/entitlement');
const { getAnalytics, importProducts, exportProducts } = require('../controllers/premiumController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.get('/analytics', authMiddleware, checkSubscription, checkFeature('ANALYTICS'), getAnalytics);

// Field name expected: "file"
router.post(
  '/import',
  authMiddleware,
  checkSubscription,
  checkFeature('BULK_IMPORT'),
  upload.single('file'),
  importProducts
);

router.get('/export', authMiddleware, checkSubscription, checkFeature('EXPORT'), exportProducts);

module.exports = router;


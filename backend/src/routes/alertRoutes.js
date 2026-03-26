const express = require('express');
const { getAlerts } = require('../controllers/alertController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, getAlerts);

module.exports = router;

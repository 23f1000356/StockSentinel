const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getRecentActivity } = require('../controllers/activityController');

const router = express.Router();

router.get('/activity', authMiddleware, getRecentActivity);

module.exports = router;


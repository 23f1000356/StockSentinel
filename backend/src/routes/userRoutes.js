const express = require('express');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { checkDefaultAdmin } = require('../middleware/checkDefaultAdmin');
const { getUsers, createStaffUser } = require('../controllers/userController');

const router = express.Router();

// Admin-only user management (tenant-scoped).
router.get('/users', authMiddleware, checkRole(['ADMIN']), checkDefaultAdmin, getUsers);
router.post('/users', authMiddleware, checkRole(['ADMIN']), checkDefaultAdmin, createStaffUser);

module.exports = router;


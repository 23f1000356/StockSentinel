const User = require('../models/User');
const { logActivity } = require('../utils/logger');
const { z } = require('zod');
const Subscription = require('../models/Subscription');

const createStaffUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const getUsers = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    // Subscription info is tenant-scoped; all users in the same organization share it.
    const activeSub = await Subscription.findOne({ organizationId: orgId, status: 'ACTIVE' })
      .populate('planId')
      .lean();

    // If there's no ACTIVE subscription (expired/never), fall back to the latest record
    // so the UI shows the correct free/pro plan even when expired.
    const latestSub =
      activeSub ||
      (await Subscription.findOne({ organizationId: orgId })
        .sort({ startDate: -1 })
        .populate('planId')
        .lean());

    const planName = latestSub?.planId?.name ?? 'FREE';
    const planStatus = latestSub?.status ?? 'EXPIRED';

    const users = await User.find({ organizationId: orgId })
      .select('-password')
      .lean();

    return res.json({
      users: users.map((u) => ({
        ...u,
        plan: String(planName).toLowerCase(), // free|pro
        planStatus: String(planStatus).toLowerCase(), // active|expired
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const createStaffUser = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const parsed = createStaffUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid create user payload', errors: parsed.error.flatten() });
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      organizationId: orgId,
      role: 'STAFF', // keep non-default admin access restricted
    });

    await logActivity('USER_CREATED', req.user._id, orgId, { userId: user._id, email: normalizedEmail });

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getUsers, createStaffUser };


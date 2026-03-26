const User = require('../models/User');
const Organization = require('../models/Organization');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const Usage = require('../models/Usage');
const Warehouse = require('../models/Warehouse');
const { generateToken } = require('../utils/jwt');
const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  organizationName: z.string().min(1),
  planName: z
    .string()
    .min(1)
    .optional()
    .refine((v) => ['FREE', 'PRO', 'free', 'pro'].includes(v), {
      message: 'planName must be FREE or PRO',
    }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signup = async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid signup payload', errors: parsed.error.flatten() });
    }

    const { name, password, organizationName, planName, email: rawEmail } = parsed.data;
    const email = rawEmail.toLowerCase();
    console.log(`Signup attempt for: ${email}`);

    let user = await User.findOne({ email });
    if (user) {
      console.log(`Signup failed: User ${email} already exists`);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    console.log(`Creating organization: ${organizationName}`);
    const org = await Organization.create({ name: organizationName });

    let plan = await Plan.findOne({ name: planName ? planName.toUpperCase() : 'FREE' });
    
    // Auto-seed plans if they don't exist
    if (!plan) {
      console.log('Plan not found, seeding default plans...');
      await Plan.deleteMany();
      const plans = await Plan.insertMany([
        { name: 'FREE', price: 0, features: [], productLimit: 10, warehouseLimit: 1 },
        {
          name: 'PRO',
          price: 999,
          features: ['ANALYTICS', 'MULTI_WAREHOUSE', 'BULK_IMPORT', 'EXPORT'],
          productLimit: 1000,
          warehouseLimit: -1,
        }
      ]);
      plan = plans.find(p => p.name === (planName ? planName.toUpperCase() : 'FREE')) || plans[0];
    }

    console.log(`Using plan: ${plan.name}`);

    await Subscription.create({
      organizationId: org._id,
      planId: plan._id,
    });

    await Usage.create({ organizationId: org._id });

    // Every tenant starts with a default main warehouse so Free plan always has 1 warehouse.
    await Warehouse.create({ organizationId: org._id, name: 'Main', location: '' });
    await Usage.updateOne({ organizationId: org._id }, { $set: { warehousesCount: 1 } });

    user = await User.create({
      name,
      email,
      password,
      organizationId: org._id,
      // Signup in this app is for normal users (staff), not admins.
      role: 'STAFF',
    });

    console.log(`User created: ${user.email}`);

    const token = generateToken({ userId: user._id, organizationId: org._id, role: user.role });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId } });
  } catch (err) {
    console.error(`Signup error details: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid login payload', errors: parsed.error.flatten() });
    }

    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;
    console.log(`Login attempt for: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed: User ${email} not found`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    console.log(`Password match for ${email}: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user._id, organizationId: user.organizationId, role: user.role });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { signup, login };

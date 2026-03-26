const mongoose = require('mongoose');
const Plan = require('../models/Plan');
require('dotenv').config();

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    await Plan.deleteMany();

    await Plan.insertMany([
      {
        name: 'FREE',
        features: [],
        productLimit: 10,
      },
      {
        name: 'PRO',
        features: ['ANALYTICS', 'MULTI_WAREHOUSE', 'BULK_IMPORT', 'EXPORT'],
        productLimit: 1000000,
      },
    ]);

    console.log('Plans Seeded');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedPlans();

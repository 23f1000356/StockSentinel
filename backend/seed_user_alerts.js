const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
require('dotenv').config();

const seedLowStockProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ email: '23f1000356@ds.study.iitm.ac.in' });
    if (!user) {
      console.log('User not found');
      process.exit();
    }

    const orgId = user.organizationId;
    
    // Create 3 low stock products
    await Product.deleteMany({ organizationId: orgId, name: /Low Stock/ });
    
    await Product.create([
      { name: 'Low Stock Item A', category: 'General', price: 100, stock: 2, lowStockThreshold: 5, organizationId: orgId },
      { name: 'Low Stock Item B', category: 'General', price: 200, stock: 1, lowStockThreshold: 5, organizationId: orgId },
      { name: 'Low Stock Item C', category: 'General', price: 300, stock: 3, lowStockThreshold: 5, organizationId: orgId },
    ]);

    console.log('3 low stock products seeded');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedLowStockProducts();

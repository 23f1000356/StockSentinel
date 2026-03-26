const Product = require('../models/Product');

const getAlerts = async (req, res) => {
  try {
    const products = await Product.find({
      organizationId: req.user.organizationId,
      isDeleted: false,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).lean();

    const lowStockAlerts = (products || []).map(p => ({
      id: p._id,
      productId: p._id,
      type: 'low-stock',
      title: 'Low Stock Alert',
      message: `Stock for ${p.name} is below threshold (${p.lowStockThreshold})`,
      product: p.name,
      category: p.category,
      stock: p.stock,
      timestamp: p.updatedAt,
    }));

    res.json(lowStockAlerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAlerts };

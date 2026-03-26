const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  warehouse: { type: String, default: 'Main' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

ProductSchema.index({ organizationId: 1 });

module.exports = mongoose.model('Product', ProductSchema);

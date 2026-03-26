const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: { type: String, enum: ['FREE', 'PRO'], required: true },
  price: { type: Number, default: 0 },
  features: [{ type: String }],
  productLimit: { type: Number, required: true },
  // Maximum warehouses a tenant can create/update.
  // Use -1 for unlimited.
  warehouseLimit: { type: Number, default: -1 },
});

module.exports = mongoose.model('Plan', PlanSchema);

const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
});

// Index for tenant isolation.
WarehouseSchema.index({ organizationId: 1 });

module.exports = mongoose.model('Warehouse', WarehouseSchema);

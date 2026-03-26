const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, unique: true },
  productsCount: { type: Number, default: 0 },
  warehousesCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Usage', UsageSchema);

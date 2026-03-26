const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

// Indexes for filtering activities by tenant and ordering by time.
ActivitySchema.index({ organizationId: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, organizationId: 1 });

module.exports = mongoose.model('Activity', ActivitySchema);

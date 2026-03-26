const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED'], default: 'ACTIVE' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
});

// Indexes for fast tenant-scoped entitlement lookups.
SubscriptionSchema.index({ organizationId: 1, status: 1 });
SubscriptionSchema.index({ organizationId: 1, startDate: -1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);

const mongoose = require('mongoose');

const SubscriptionRequestSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    requesterUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedPlan: { type: String, enum: ['FREE', 'PRO'], required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

SubscriptionRequestSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('SubscriptionRequest', SubscriptionRequestSchema);


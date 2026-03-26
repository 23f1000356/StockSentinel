const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'SUCCESS' },
    paymentProvider: { type: String, default: 'MANUAL' },
    providerPaymentId: { type: String, default: '' },
    type: { type: String, enum: ['UPGRADE', 'DOWNGRADE', 'RENEWAL'], required: true },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

PaymentTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema);


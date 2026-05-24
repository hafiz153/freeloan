import mongoose, { Schema, Document } from 'mongoose';
import { IPayment } from '@/types';

export interface PaymentDocument extends Omit<IPayment, '_id'>, Document {}

const PaymentSchema = new Schema<PaymentDocument>(
  {
    loan: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
    borrower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    principalPortion: { type: Number, default: 0 },
    serviceChargePortion: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'bank', 'cash', 'adjustment'],
      required: true,
    },
    transactionId: { type: String, sparse: true },
    sslcommerzData: { type: Schema.Types.Mixed },
    receiptUrl: { type: String },
    notes: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

PaymentSchema.index({ loan: 1, createdAt: -1 });
PaymentSchema.index({ borrower: 1 });
PaymentSchema.index({ transactionId: 1 });

export const Payment = mongoose.models.Payment || mongoose.model<PaymentDocument>('Payment', PaymentSchema);

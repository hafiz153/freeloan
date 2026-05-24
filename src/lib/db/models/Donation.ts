import mongoose, { Schema, Document } from 'mongoose';
import { IDonation } from '@/types';

export interface DonationDocument extends Omit<IDonation, '_id'>, Document {}

const DonationSchema = new Schema<DonationDocument>(
  {
    donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String, unique: true, sparse: true },
    paymentMethod: { type: String, default: 'sslcommerz' },
    sslcommerzData: { type: Schema.Types.Mixed },
    invoiceUrl: { type: String },
    message: { type: String },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
    },
    allocatedTo: [{ type: Schema.Types.ObjectId, ref: 'Loan' }],
  },
  { timestamps: true }
);

DonationSchema.index({ donor: 1, createdAt: -1 });
DonationSchema.index({ status: 1 });
DonationSchema.index({ transactionId: 1 });

export const Donation = mongoose.models.Donation || mongoose.model<DonationDocument>('Donation', DonationSchema);

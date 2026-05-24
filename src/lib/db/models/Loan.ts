import mongoose, { Schema, Document } from 'mongoose';
import { ILoan } from '@/types';

export interface LoanDocument extends Omit<ILoan, '_id'>, Document {}

const LoanSchema = new Schema<LoanDocument>(
  {
    borrower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    purpose: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'disbursed', 'completed', 'defaulted'],
      default: 'pending',
    },
    tenureMonths: { type: Number, required: true, min: 1, max: 60 },
    interestRate: { type: Number, default: 0 },
    serviceChargeRate: { type: Number, default: 1 },
    monthlyServiceCharge: { type: Number, default: 0 },
    totalRepayable: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    disbursedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    documents: [
      {
        type: { type: String },
        url: { type: String },
      },
    ],
    notes: { type: String },
    nextPaymentDate: { type: Date },
    overdueDays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LoanSchema.index({ borrower: 1, status: 1 });
LoanSchema.index({ status: 1 });

export const Loan = mongoose.models.Loan || mongoose.model<LoanDocument>('Loan', LoanSchema);

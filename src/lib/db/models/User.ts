import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@/types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['super_admin', 'admin', 'donor', 'borrower'], default: 'borrower' },
    phone: { type: String, sparse: true },
    avatar: { type: String },
    emailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    kycStatus: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified' },
    kycDocuments: [
      {
        type: { type: String },
        url: { type: String },
        verifiedAt: { type: Date },
      },
    ],
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: { type: String, default: 'Bangladesh' },
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

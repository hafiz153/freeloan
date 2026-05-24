export type UserRole = 'super_admin' | 'admin' | 'donor' | 'borrower';

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'disbursed' | 'completed' | 'defaulted';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  kycStatus: KYCStatus;
  kycDocuments?: {
    type: string;
    url: string;
    verifiedAt?: Date;
  }[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IDonation {
  _id: string;
  donor: string | IUser;
  amount: number;
  currency: string;
  status: DonationStatus;
  transactionId: string;
  paymentMethod: string;
  sslcommerzData?: Record<string, unknown>;
  invoiceUrl?: string;
  message?: string;
  isRecurring: boolean;
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly';
  allocatedTo?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoan {
  _id: string;
  borrower: string | IUser;
  amount: number;
  purpose: string;
  status: LoanStatus;
  tenureMonths: number;
  interestRate: number;
  serviceChargeRate: number;
  monthlyServiceCharge: number;
  totalRepayable: number;
  amountPaid: number;
  outstandingBalance: number;
  disbursedAt?: Date;
  approvedBy?: string | IUser;
  approvedAt?: Date;
  documents?: {
    type: string;
    url: string;
  }[];
  notes?: string;
  nextPaymentDate?: Date;
  overdueDays?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  _id: string;
  loan: string | ILoan;
  borrower: string | IUser;
  amount: number;
  principalPortion: number;
  serviceChargePortion: number;
  remainingBalance: number;
  status: PaymentStatus;
  paymentMethod: 'online' | 'bank' | 'cash' | 'adjustment';
  transactionId?: string;
  sslcommerzData?: Record<string, unknown>;
  receiptUrl?: string;
  notes?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  _id: string;
  action: string;
  performedBy: string | IUser;
  targetModel: string;
  targetId: string;
  changes: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface INotification {
  _id: string;
  recipient: string | IUser;
  type: 'email' | 'sms' | 'in_app';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalDonations?: number;
  totalDonors?: number;
  totalLoans?: number;
  totalBorrowers?: number;
  totalDisbursed?: number;
  totalRepaid?: number;
  outstandingBalance?: number;
  overdueAmount?: number;
  recoveryRate?: number;
  recentTransactions?: unknown[];
}

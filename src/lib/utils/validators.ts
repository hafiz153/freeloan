import { z } from 'zod/v4';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(6).max(100),
  phone: z.string().optional(),
  role: z.enum(['donor', 'borrower']).default('borrower'),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const donationSchema = z.object({
  amount: z.number().min(10, 'Minimum donation is 10'),
  currency: z.string().default('BDT'),
  message: z.string().max(500).optional(),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
});

export const loanApplicationSchema = z.object({
  amount: z.number().min(500, 'Minimum loan is 500'),
  purpose: z.string().min(10).max(1000),
  tenureMonths: z.number().min(1).max(60),
  notes: z.string().max(500).optional(),
});

export const repaymentSchema = z.object({
  amount: z.number().min(1, 'Minimum repayment is 1'),
  paymentMethod: z.enum(['online', 'bank', 'cash']),
  notes: z.string().max(500).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export const passwordResetSchema = z.object({
  email: z.email(),
});

export const passwordUpdateSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6).max(100),
});

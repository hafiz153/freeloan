import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/connect';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { DashboardStats } from '@/types';

export const GET = withAuth(async (request) => {
  try {
    await connectDB();

    const role = request.user?.role;
    const userId = request.user?.userId;

    let stats: DashboardStats = {};

    switch (role) {
      case 'super_admin':
      case 'admin': {
        const { Loan } = await import('@/lib/db/models/Loan');
        const { Donation } = await import('@/lib/db/models/Donation');
        const { User } = await import('@/lib/db/models/User');
        const { Payment } = await import('@/lib/db/models/Payment');

        const [
          totalDonors, totalBorrowers,
          donationAgg,
          loanStats,
          recentTransactions,
        ] = await Promise.all([
          User.countDocuments({ role: 'donor' }),
          User.countDocuments({ role: 'borrower' }),
          Donation.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
          Loan.aggregate([
            { $match: { status: { $in: ['disbursed', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$amount' }, repaid: { $sum: '$amountPaid' }, outstanding: { $sum: '$outstandingBalance' } } },
          ]),
          Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
          Payment.find({ status: 'completed' })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('borrower', 'name')
            .populate('loan', 'amount')
            .lean(),
        ]);

        stats = {
          totalDonors,
          totalBorrowers,
          totalDonations: donationAgg[0]?.total || 0,
          totalDisbursed: loanStats[0]?.total || 0,
          totalRepaid: loanStats[0]?.repaid || 0,
          outstandingBalance: loanStats[0]?.outstanding || 0,
          totalLoans: loanStats[0]?.total || 0,
          recentTransactions: recentTransactions as [],
        };
        break;
      }

      case 'donor': {
        const { Donation } = await import('@/lib/db/models/Donation');

        const [donationAgg, donations] = await Promise.all([
          Donation.aggregate([
            { $match: { donor: new mongoose.Types.ObjectId(userId), status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ]),
          Donation.find({ donor: new mongoose.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        ]);

        stats = {
          totalDonations: donationAgg[0]?.total || 0,
          recentTransactions: donations as [],
        };
        break;
      }

      case 'borrower': {
        const { Loan } = await import('@/lib/db/models/Loan');
        const { Payment } = await import('@/lib/db/models/Payment');

        const [loanAgg, recentPayments] = await Promise.all([
          Loan.aggregate([
            { $match: { borrower: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: '$amount' }, outstanding: { $sum: '$outstandingBalance' }, repaid: { $sum: '$amountPaid' } } },
          ]),
          Loan.find({ borrower: new mongoose.Types.ObjectId(userId), status: { $in: ['disbursed'] } }).lean(),
          Payment.find({ borrower: new mongoose.Types.ObjectId(userId), status: 'completed' })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('loan', 'amount')
            .lean(),
        ]);

        stats = {
          totalLoans: loanAgg[0]?.total || 0,
          outstandingBalance: loanAgg[0]?.outstanding || 0,
          totalRepaid: loanAgg[0]?.repaid || 0,
          recentTransactions: recentPayments as [],
        };
        break;
      }
    }

    return successResponse({ role, stats });
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse('Internal server error', 500);
  }
});

import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { Loan } from '@/lib/db/models/Loan';
import { Donation } from '@/lib/db/models/Donation';
import { Payment } from '@/lib/db/models/Payment';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export const GET = withAuth(async (request) => {
  if (!['admin', 'super_admin'].includes(request.user?.role || '')) {
    return errorResponse('Insufficient permissions', 403);
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary';

    switch (type) {
      case 'summary': {
        const [
          totalDonors,
          totalBorrowers,
          totalLoans,
          loanAgg,
          donationAgg,
          paymentAgg,
          overdueLoans,
        ] = await Promise.all([
          User.countDocuments({ role: 'donor' }),
          User.countDocuments({ role: 'borrower' }),
          Loan.countDocuments(),
          Loan.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' }, disbursed: { $sum: { $cond: [{ $in: ['$status', ['disbursed', 'completed']] }, '$amount', 0] } } } },
          ]),
          Donation.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ]),
          Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, totalCollected: { $sum: '$amount' }, totalPrincipal: { $sum: '$principalPortion' }, totalServiceCharge: { $sum: '$serviceChargePortion' } } },
          ]),
          Loan.countDocuments({ status: 'disbursed', overdueDays: { $gt: 0 } }),
        ]);

        return successResponse({
          users: { totalDonors, totalBorrowers, total: totalDonors + totalBorrowers },
          donations: {
            total: donationAgg[0]?.total || 0,
            count: donationAgg[0]?.count || 0,
          },
          loans: {
            total: loanAgg[0]?.total || 0,
            disbursed: loanAgg[0]?.disbursed || 0,
            totalApplications: totalLoans,
            overdue: overdueLoans,
          },
          payments: {
            totalCollected: paymentAgg[0]?.totalCollected || 0,
            totalPrincipal: paymentAgg[0]?.totalPrincipal || 0,
            totalServiceCharge: paymentAgg[0]?.totalServiceCharge || 0,
          },
        });
      }

      case 'donations': {
        const donations = await Donation.aggregate([
          { $match: { status: 'completed' } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        return successResponse(donations);
      }

      case 'loans': {
        const loans = await Loan.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' },
            },
          },
        ]);

        return successResponse(loans);
      }

      case 'recovery': {
        const recovery = await Loan.aggregate([
          { $match: { status: { $in: ['disbursed', 'completed', 'defaulted'] } } },
          {
            $group: {
              _id: null,
              totalDisbursed: { $sum: '$amount' },
              totalRecovered: { $sum: '$amountPaid' },
              totalOutstanding: { $sum: '$outstandingBalance' },
            },
          },
        ]);

        const data = recovery[0] || { totalDisbursed: 0, totalRecovered: 0, totalOutstanding: 0 };
        data.recoveryRate = data.totalDisbursed > 0
          ? ((data.totalRecovered / data.totalDisbursed) * 100).toFixed(2)
          : '0';

        return successResponse(data);
      }

      default:
        return errorResponse('Invalid report type');
    }
  } catch (error) {
    console.error('Admin reports error:', error);
    return errorResponse('Internal server error', 500);
  }
});

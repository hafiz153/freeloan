import { connectDB } from '@/lib/db/connect';
import { Loan } from '@/lib/db/models/Loan';
import { Payment } from '@/lib/db/models/Payment';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export const GET = withAuth(async (request, { params }) => {
  try {
    await connectDB();
    const { id } = await params;

    const loan = await Loan.findById(id)
      .populate('approvedBy', 'name email')
      .lean();

    if (!loan) {
      return errorResponse('Loan not found', 404);
    }

    if (loan.borrower?.toString() !== request.user?.userId && !['admin', 'super_admin'].includes(request.user?.role || '')) {
      return errorResponse('Access denied', 403);
    }

    const payments = await Payment.find({ loan: id })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ loan, payments });
  } catch (error) {
    console.error('Get loan error:', error);
    return errorResponse('Internal server error', 500);
  }
});

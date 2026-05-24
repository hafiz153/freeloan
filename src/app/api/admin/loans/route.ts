import { connectDB } from '@/lib/db/connect';
import { Loan } from '@/lib/db/models/Loan';
import { User } from '@/lib/db/models/User';
import { Notification } from '@/lib/db/models/Notification';
import { AuditLog } from '@/lib/db/models/AuditLog';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { parsePageParam, parseLimitParam } from '@/lib/utils/helpers';
import { LoanStatus } from '@/types';
import { sendNotificationEmail } from '@/lib/email';

export const GET = withAuth(async (request) => {
  if (!['admin', 'super_admin'].includes(request.user?.role || '')) {
    return errorResponse('Insufficient permissions', 403);
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parsePageParam(searchParams.get('page'));
    const limit = parseLimitParam(searchParams.get('limit'), 20);
    const status = searchParams.get('status') as LoanStatus | null;
    const search = searchParams.get('search');

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { purpose: { $regex: search, $options: 'i' } },
      ];
    }

    const [loans, total] = await Promise.all([
      Loan.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('borrower', 'name email phone')
        .populate('approvedBy', 'name email')
        .lean(),
      Loan.countDocuments(filter),
    ]);

    return successResponse({
      loans,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Admin get loans error:', error);
    return errorResponse('Internal server error', 500);
  }
});

export const PATCH = withAuth(async (request) => {
  if (!['admin', 'super_admin'].includes(request.user?.role || '')) {
    return errorResponse('Insufficient permissions', 403);
  }

  try {
    await connectDB();

    const body = await request.json();
    const { loanId, action, notes } = body;

    if (!loanId || !action) return errorResponse('Loan ID and action are required');

    const loan = await Loan.findById(loanId);
    if (!loan) return errorResponse('Loan not found', 404);

    let statusUpdate: LoanStatus | null = null;
    let notificationTitle = '';
    let notificationMessage = '';

    switch (action) {
      case 'approve':
        if (loan.status !== 'pending') return errorResponse('Loan is not in pending status');
        statusUpdate = 'approved';
        notificationTitle = 'Loan Approved';
        notificationMessage = `Your loan of ${loan.amount} BDT has been approved.`;
        break;
      case 'reject':
        if (loan.status !== 'pending') return errorResponse('Loan is not in pending status');
        statusUpdate = 'rejected';
        notificationTitle = 'Loan Rejected';
        notificationMessage = `Your loan application has been rejected.${notes ? ` Reason: ${notes}` : ''}`;
        break;
      case 'disburse':
        if (loan.status !== 'approved') return errorResponse('Loan is not approved');
        statusUpdate = 'disbursed';
        loan.disbursedAt = new Date();
        loan.approvedBy = request.user?.userId as string | undefined;
        loan.approvedAt = new Date();
        notificationTitle = 'Loan Disbursed';
        notificationMessage = `Your loan of ${loan.amount} BDT has been disbursed.`;
        break;
      case 'complete':
        statusUpdate = 'completed';
        notificationTitle = 'Loan Completed';
        notificationMessage = 'Your loan has been marked as completed.';
        break;
      case 'default':
        statusUpdate = 'defaulted';
        notificationTitle = 'Loan Defaulted';
        notificationMessage = 'Your loan has been marked as defaulted. Please contact support.';
        break;
      default:
        return errorResponse('Invalid action');
    }

    if (statusUpdate) {
      loan.status = statusUpdate;
    }
    if (notes) loan.notes = notes;
    await loan.save();

    await Notification.create({
      recipient: loan.borrower,
      type: 'in_app',
      title: notificationTitle,
      message: notificationMessage,
      data: { loanId: loan._id },
    });

    const borrower = await User.findById(loan.borrower).select('email name').lean();
    if (borrower?.email) {
      sendNotificationEmail(
        borrower.email,
        notificationTitle,
        `Hello ${borrower.name},<br><br>${notificationMessage}<br><br>Best regards,<br>The FreeLoan Team`
      ).catch((err) => console.error('Loan status email failed:', err));
    }

    await AuditLog.create({
      action: `${action.toUpperCase()}_LOAN`,
      performedBy: request.user?.userId,
      targetModel: 'Loan',
      targetId: loanId,
      changes: { status: statusUpdate, notes },
    });

    return successResponse(loan, `Loan ${action}d successfully`);
  } catch (error) {
    console.error('Admin loan action error:', error);
    return errorResponse('Internal server error', 500);
  }
});

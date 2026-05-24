import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { Loan } from '@/lib/db/models/Loan';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export const GET = withAuth(async (request, { params }) => {
  try {
    await connectDB();

    if (!['admin', 'super_admin'].includes(request.user?.role || '')) {
      return errorResponse('Insufficient permissions', 403);
    }

    const { id } = await params;

    const [user, loans] = await Promise.all([
      User.findById(id).select('-password').lean(),
      Loan.find({ borrower: id }).sort({ createdAt: -1 }).lean(),
    ]);

    if (!user) return errorResponse('User not found', 404);

    return successResponse({ user, loans });
  } catch (error) {
    console.error('Get borrower error:', error);
    return errorResponse('Internal server error', 500);
  }
});

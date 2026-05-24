import { connectDB } from '@/lib/db/connect';
import { Loan } from '@/lib/db/models/Loan';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { parsePageParam, parseLimitParam } from '@/lib/utils/helpers';

export const GET = withAuth(async (request) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parsePageParam(searchParams.get('page'));
    const limit = parseLimitParam(searchParams.get('limit'), 10);
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = { borrower: request.user?.userId };
    if (status) filter.status = status;

    const [loans, total] = await Promise.all([
      Loan.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('approvedBy', 'name email')
        .lean(),
      Loan.countDocuments(filter),
    ]);

    return successResponse({
      loans,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get loans error:', error);
    return errorResponse('Internal server error', 500);
  }
});

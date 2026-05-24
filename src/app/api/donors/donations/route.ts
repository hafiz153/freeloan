import { connectDB } from '@/lib/db/connect';
import { Donation } from '@/lib/db/models/Donation';
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

    const filter: Record<string, unknown> = { donor: request.user?.userId };
    if (status) filter.status = status;

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Donation.countDocuments(filter),
    ]);

    return successResponse({
      donations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get donations error:', error);
    return errorResponse('Internal server error', 500);
  }
});

export const POST = withAuth(async (request) => {
  try {
    await connectDB();

    const body = await request.json();
    const { amount, currency, message, isRecurring, recurringInterval } = body;

    if (!amount || amount < 10) {
      return errorResponse('Minimum donation is 10');
    }

    const donation = await Donation.create({
      donor: request.user?.userId,
      amount,
      currency: currency || 'BDT',
      message,
      isRecurring: isRecurring || false,
      recurringInterval,
      status: 'pending',
    });

    return successResponse(donation, 'Donation initiated', 201);
  } catch (error) {
    console.error('Create donation error:', error);
    return errorResponse('Internal server error', 500);
  }
});

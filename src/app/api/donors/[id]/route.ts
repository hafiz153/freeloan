import { connectDB } from '@/lib/db/connect';
import { Donation } from '@/lib/db/models/Donation';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export const GET = withAuth(async (request, { params }) => {
  try {
    await connectDB();
    const { id } = await params;

    const donation = await Donation.findOne({
      _id: id,
      donor: request.user?.userId,
    }).lean();

    if (!donation) {
      return errorResponse('Donation not found', 404);
    }

    return successResponse(donation);
  } catch (error) {
    console.error('Get donation error:', error);
    return errorResponse('Internal server error', 500);
  }
});

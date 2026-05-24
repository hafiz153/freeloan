import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export const GET = withAuth(async (request) => {
  try {
    await connectDB();

    const user = await User.findById(request.user?.userId)
      .select('-password')
      .lean();

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Internal server error', 500);
  }
});

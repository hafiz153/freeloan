import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export const POST = withAuth(async (request) => {
  try {
    await connectDB();

    await User.findByIdAndUpdate(request.user?.userId, {
      emailVerified: true,
    });

    return successResponse(null, 'Email verified successfully');
  } catch (error) {
    console.error('Email verification error:', error);
    return errorResponse('Internal server error', 500);
  }
});

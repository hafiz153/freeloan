import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { updateUserSchema } from '@/lib/utils/validators';

export const GET = withAuth(async (request) => {
  try {
    await connectDB();
    const user = await User.findById(request.user?.userId)
      .select('-password')
      .lean();

    if (!user) return errorResponse('User not found', 404);
    return successResponse(user);
  } catch (error) {
    console.error('Get borrower profile error:', error);
    return errorResponse('Internal server error', 500);
  }
});

export const PATCH = withAuth(async (request) => {
  try {
    await connectDB();

    const body = await request.json();
    const validated = updateUserSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse('Validation failed', 400, validated.error?.flatten().fieldErrors as Record<string, string[]> | undefined);
    }

    const user = await User.findByIdAndUpdate(
      request.user?.userId,
      { $set: validated.data },
      { new: true }
    ).select('-password').lean();

    if (!user) return errorResponse('User not found', 404);

    return successResponse(user, 'Profile updated successfully');
  } catch (error) {
    console.error('Update borrower profile error:', error);
    return errorResponse('Internal server error', 500);
  }
});

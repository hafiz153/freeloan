import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { hashPassword } from '@/lib/utils/helpers';
import { passwordResetSchema, passwordUpdateSchema } from '@/lib/utils/validators';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = passwordResetSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse('Validation failed', 400);
    }

    await connectDB();

    const { email } = validated.data;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return successResponse(null, 'If the email exists, a reset link has been sent');
    }

    return successResponse(null, 'If the email exists, a reset link has been sent');
  } catch (error) {
    console.error('Password reset error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = passwordUpdateSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse('Validation failed', 400);
    }

    await connectDB();

    const { password } = validated.data;
    const hashedPassword = await hashPassword(password);

    await User.updateOne(
      { email: body.email?.toLowerCase() },
      { password: hashedPassword }
    );

    return successResponse(null, 'Password updated successfully');
  } catch (error) {
    console.error('Password update error:', error);
    return errorResponse('Internal server error', 500);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { hashPassword } from '@/lib/utils/helpers';
import { registerSchema } from '@/lib/utils/validators';
import { signToken } from '@/lib/auth/jwt';
import { errorResponse } from '@/lib/utils/api-response';
import { Notification } from '@/lib/db/models/Notification';
import { sendNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse('Validation failed', 400, validated.error?.flatten().fieldErrors as Record<string, string[]> | undefined);
    }

    await connectDB();

    const { name, email, password, phone, role } = validated.data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse('Email already registered', 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await Notification.create({
      recipient: user._id,
      type: 'in_app',
      title: 'Welcome to FreeLoan',
      message: `Welcome ${user.name}! Your account has been created successfully.`,
    });

    sendNotificationEmail(
      user.email,
      'Welcome to FreeLoan',
      `Hello ${user.name},<br><br>Your account has been created successfully. You can now log in and start using FreeLoan services.<br><br>Best regards,<br>The FreeLoan Team`
    ).catch((err) => console.error('Welcome email failed:', err));

    const response = NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            kycStatus: user.kycStatus,
          },
        },
        message: 'Registration successful',
      },
      { status: 201 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Internal server error', 500);
  }
}

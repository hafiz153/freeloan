import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { AuditLog } from '@/lib/db/models/AuditLog';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { parsePageParam, parseLimitParam } from '@/lib/utils/helpers';

export const GET = withAuth(async (request) => {
  if (!['admin', 'super_admin'].includes(request.user?.role || '')) {
    return errorResponse('Insufficient permissions', 403);
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parsePageParam(searchParams.get('page'));
    const limit = parseLimitParam(searchParams.get('limit'), 20);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return successResponse({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Admin get users error:', error);
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
    const { userId, ...updates } = body;

    if (!userId) return errorResponse('User ID is required');

    const allowedUpdates = ['role', 'isActive', 'kycStatus', 'name', 'phone'] as const;
    const filteredUpdates: Record<string, unknown> = {};

    for (const key of allowedUpdates) {
      if (updates[key as string] !== undefined) {
        filteredUpdates[key] = updates[key as string];
      }
    }

    const user = await User.findByIdAndUpdate(userId, filteredUpdates, { new: true })
      .select('-password')
      .lean();

    if (!user) return errorResponse('User not found', 404);

    await AuditLog.create({
      action: 'UPDATE_USER',
      performedBy: request.user?.userId,
      targetModel: 'User',
      targetId: userId,
      changes: filteredUpdates,
    });

    return successResponse(user, 'User updated successfully');
  } catch (error) {
    console.error('Admin update user error:', error);
    return errorResponse('Internal server error', 500);
  }
});

export const DELETE = withAuth(async (request) => {
  if (request.user?.role !== 'super_admin') {
    return errorResponse('Insufficient permissions', 403);
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return errorResponse('User ID is required');

    await User.findByIdAndUpdate(userId, { isActive: false });

    await AuditLog.create({
      action: 'SUSPEND_USER',
      performedBy: request.user?.userId,
      targetModel: 'User',
      targetId: userId,
      changes: { isActive: false },
    });

    return successResponse(null, 'User suspended successfully');
  } catch (error) {
    console.error('Admin delete user error:', error);
    return errorResponse('Internal server error', 500);
  }
});

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';
import { UserRole } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const token = request.cookies.get('token')?.value;
  return token || null;
}

export function authenticate(request: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(request: NextRequest): TokenPayload | null {
  return authenticate(request);
}

export function requireRole(user: TokenPayload | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role as UserRole);
}

export function withAuth(
  handler: (req: AuthenticatedRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const user = authenticate(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const authedReq = request as AuthenticatedRequest;
    authedReq.user = user;

    return handler(authedReq, context);
  };
}

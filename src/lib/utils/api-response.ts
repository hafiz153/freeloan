import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export function successResponse<T>(data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = { success: true, data, message };
  return NextResponse.json(body, { status });
}

export function errorResponse(error: string, status = 400, errors?: Record<string, string[]>) {
  const body: ApiResponse = { success: false, error, errors };
  return NextResponse.json(body, { status });
}

export function paginatedResponse<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number }
) {
  const body: ApiResponse<T[]> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };
  return NextResponse.json(body);
}

'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    switch (user.role) {
      case 'donor':
        router.push('/dashboard/donor');
        break;
      case 'borrower':
        router.push('/dashboard/borrower');
        break;
      case 'admin':
      case 'super_admin':
        router.push('/dashboard/admin');
        break;
      default:
        router.push('/');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

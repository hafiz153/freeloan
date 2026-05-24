'use client';

import { AuthProvider as AuthContextProvider } from '@/lib/auth/auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}

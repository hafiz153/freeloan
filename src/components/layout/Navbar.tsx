'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import Link from 'next/link';

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const t = useT();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              {t('common.appName')}
            </Link>
            {user && (
              <div className="ml-10 flex items-center gap-1">
                <Link
                  href={user.role === 'donor' ? '/dashboard/donor' : user.role === 'admin' || user.role === 'super_admin' ? '/dashboard/admin' : '/dashboard/borrower'}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-50"
                >
                  {t('nav.dashboard')}
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {loading ? null : user ? (
              <>
                <span className="text-sm text-gray-600">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">{t('nav.login')}</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">{t('nav.register')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

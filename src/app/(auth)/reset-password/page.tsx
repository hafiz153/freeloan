'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useT } from '@/lib/i18n';

export default function ResetPasswordPage() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (result.success) {
        setSent(true);
        toast.success(t('auth.resetLinkSent'));
      }
    } catch {
      toast.error(t('auth.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card>
            <h1 className="text-xl font-bold text-gray-900 text-center">{t('auth.checkEmail')}</h1>
            <p className="text-gray-500 text-center text-sm mt-2">
              {t('auth.checkEmailMsg')}
            </p>
            <div className="mt-6 text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                {t('auth.backToLogin')}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <h1 className="text-xl font-bold text-gray-900 text-center">{t('auth.resetPassword')}</h1>
          <p className="text-gray-500 text-center text-sm mt-2 mb-6">
            {t('auth.resetInstructions')}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              {t('auth.sendResetLink')}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              {t('auth.backToLogin')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

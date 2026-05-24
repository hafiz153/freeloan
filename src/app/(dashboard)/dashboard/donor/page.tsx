'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

interface Donation {
  _id: string;
  amount: number;
  status: string;
  transactionId: string;
  createdAt: string;
  message?: string;
}

interface DashboardData {
  totalDonations: number;
  recentTransactions: Donation[];
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const t = useT();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDonate, setShowDonate] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/dashboard');
        const result = await res.json();
        if (result.success) {
          setData({
            totalDonations: result.stats.totalDonations || 0,
            recentTransactions: result.stats.recentTransactions || [],
          });
        }
      } catch {
        toast.error(t('errors.internalError'));
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDonate = async (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(donateAmount);
    if (isNaN(amount) || amount < 10) {
      toast.error(t('errors.minDonation'));
      return;
    }

    setDonating(true);
    try {
      const res = await fetch('/api/payments/sslcommerz/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'BDT' }),
      });

      const result = await res.json();
      if (result.success && result.data?.gatewayUrl) {
        window.location.href = result.data.gatewayUrl;
      } else {
        toast.error(result.error || t('errors.donationFailed'));
      }
    } catch {
      toast.error(t('errors.donationFailed'));
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('donor.dashboard')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('donor.welcome')}, {user?.name}</p>
        </div>
        <Button onClick={() => setShowDonate(!showDonate)}>
          {showDonate ? t('donor.cancel') : t('donor.makeDonation')}
        </Button>
      </div>

      {showDonate && (
        <Card title={t('donor.makeDonation')}>
          <form onSubmit={handleDonate} className="flex items-end gap-4">
            <Input
              label={t('donor.enterAmount')}
              type="number"
              placeholder={t('donor.enterAmount')}
              value={donateAmount}
              onChange={(e) => setDonateAmount(e.target.value)}
              min={10}
              required
            />
            <Button type="submit" loading={donating}>
              {t('donor.proceedToPay')}
            </Button>
          </form>
        </Card>
      )}

      <StatsCard
        label={t('donor.totalDonations')}
        value={formatCurrency(data?.totalDonations || 0)}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        }
      />

      <Card title={t('donor.donationHistory')}>
        {data?.recentTransactions && data.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('common.amount')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('common.status')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('donor.transaction')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('common.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recentTransactions.map((donation: Donation) => (
                  <tr key={donation._id}>
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(donation.amount)}
                    </td>
                    <td className="py-3"><StatusBadge status={donation.status} /></td>
                    <td className="py-3 text-sm text-gray-500">{donation.transactionId || '-'}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm py-4 text-center">{t('donor.noDonations')}</p>
        )}
      </Card>
    </div>
  );
}

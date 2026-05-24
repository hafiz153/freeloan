'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Loan {
  _id: string;
  amount: number;
  purpose: string;
  status: string;
  tenureMonths: number;
  outstandingBalance: number;
  amountPaid: number;
  monthlyServiceCharge: number;
  createdAt: string;
}

interface DashboardData {
  totalLoans: number;
  outstandingBalance: number;
  totalRepaid: number;
  recentTransactions: Payment[];
}

interface Payment {
  _id: string;
  amount: number;
  principalPortion: number;
  serviceChargePortion: number;
  status: string;
  paidAt: string;
  loan?: { amount: number };
}

export default function BorrowerDashboard() {
  const { user } = useAuth();
  const t = useT();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, loansRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/loans'),
        ]);
        const dashData = await dashRes.json();
        const loansData = await loansRes.json();
        if (dashData.success) {
          setData({
            totalLoans: dashData.stats.totalLoans || 0,
            outstandingBalance: dashData.stats.outstandingBalance || 0,
            totalRepaid: dashData.stats.totalRepaid || 0,
            recentTransactions: dashData.stats.recentTransactions || [],
          });
        }
        if (loansData.success) {
          setLoans(loansData.data.loans || []);
        }
      } catch {
        toast.error(t('errors.internalError'));
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">{t('borrower.dashboard')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('borrower.welcome')}, {user?.name}</p>
        </div>
        <Link href="/dashboard/borrower/apply">
          <Button>{t('borrower.applyLoan')}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label={t('borrower.totalLoans')}
          value={formatCurrency(data?.totalLoans || 0)}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          label={t('borrower.outstanding')}
          value={formatCurrency(data?.outstandingBalance || 0)}
          changeType={data?.outstandingBalance ? 'negative' : 'neutral'}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 003-3V9m-6 0v.75M3 6.75h18M3 12h18M3 17.25h18" />
            </svg>
          }
        />
        <StatsCard
          label={t('borrower.totalRepaid')}
          value={formatCurrency(data?.totalRepaid || 0)}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <Card title={t('borrower.myLoans')}>
        {loans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('common.amount')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('common.status')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('borrower.outstanding')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('borrower.totalRepaid')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('borrower.tenure')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td className="py-3 text-sm font-medium text-gray-900">{formatCurrency(loan.amount)}</td>
                    <td className="py-3"><StatusBadge status={loan.status} /></td>
                    <td className="py-3 text-sm text-gray-900">{formatCurrency(loan.outstandingBalance)}</td>
                    <td className="py-3 text-sm text-gray-500">{formatCurrency(loan.amountPaid)}</td>
                    <td className="py-3 text-sm text-gray-500">{loan.tenureMonths} {t('borrower.months')}</td>
                    <td className="py-3">
                      {loan.status === 'disbursed' && (
                        <Link href={`/dashboard/borrower/repay/${loan._id}`}>
                          <Button variant="secondary" size="sm">{t('borrower.payNow')}</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">{t('borrower.noLoans')}</p>
            <Link href="/dashboard/borrower/apply">
              <Button>{t('borrower.applyFirstLoan')}</Button>
            </Link>
          </div>
        )}
      </Card>

      <Card title={t('borrower.recentPayments')}>
        {data?.recentTransactions && data.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('common.amount')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('borrower.principal')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('borrower.serviceCharge')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">{t('common.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recentTransactions.map((p: Payment) => (
                  <tr key={p._id}>
                    <td className="py-3 text-sm font-medium text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="py-3 text-sm text-gray-500">{formatCurrency(p.principalPortion)}</td>
                    <td className="py-3 text-sm text-gray-500">{formatCurrency(p.serviceChargePortion)}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm py-4 text-center">{t('borrower.noPayments')}</p>
        )}
      </Card>
    </div>
  );
}

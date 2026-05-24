'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DonationChart, LoanStatusChart } from '@/components/charts/DashboardCharts';
import { formatCurrency } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

interface SummaryData {
  users: { totalDonors: number; totalBorrowers: number; total: number };
  donations: { total: number; count: number };
  loans: { total: number; disbursed: number; totalApplications: number; overdue: number };
  payments: { totalCollected: number; totalPrincipal: number; totalServiceCharge: number };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  kycStatus: string;
  createdAt: string;
}

interface AdminLoan {
  _id: string;
  amount: number;
  purpose: string;
  status: string;
  outstandingBalance: number;
  tenureMonths: number;
  borrower?: { name: string; email: string };
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const t = useT();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [donationChart, setDonationChart] = useState([]);
  const [loanChart, setLoanChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'summary' | 'users' | 'loans'>('summary');

  const fetchData = async (initial = false) => {
    try {
      const [summaryRes, usersRes, loansRes, donationChartRes, loanChartRes] = await Promise.all([
        fetch('/api/admin/reports?type=summary'),
        fetch('/api/admin/users?limit=10'),
        fetch('/api/admin/loans?limit=10'),
        fetch('/api/admin/reports?type=donations'),
        fetch('/api/admin/reports?type=loans'),
      ]);

      const summaryData = await summaryRes.json();
      const usersData = await usersRes.json();
      const loansData = await loansRes.json();
      const donationChartData = await donationChartRes.json();
      const loanChartData = await loanChartRes.json();

      if (summaryData.success) setSummary(summaryData.data);
      if (usersData.success) setUsers(usersData.data.users || []);
      if (loansData.success) setLoans(loansData.data.loans || []);
      if (donationChartData.success) setDonationChart(donationChartData.data);
      if (loanChartData.success) setLoanChart(loanChartData.data);
    } catch {
      toast.error(t('errors.internalError'));
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoanAction = async (loanId: string, action: string) => {
    try {
      const res = await fetch('/api/admin/loans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Loan ${action}d successfully`);
        fetchData();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(t('errors.internalError'));
    }
  };

  const handleUserAction = async (userId: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('User updated');
        fetchData();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(t('errors.internalError'));
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('admin.welcome')}, {user?.name}</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-1">
        {(['summary', 'users', 'loans'] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              tab === tabKey
                ? 'bg-white text-blue-600 border border-gray-200 border-b-white -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t(`admin.${tabKey}`)}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard label={t('admin.donors')} value={summary?.users.totalDonors || 0} />
            <StatsCard label={t('admin.borrowers')} value={summary?.users.totalBorrowers || 0} />
            <StatsCard label={t('admin.totalDonations')} value={formatCurrency(summary?.donations.total || 0)} />
            <StatsCard label={t('admin.donationCount')} value={summary?.donations.count || 0} />
            <StatsCard label={t('admin.totalLoans')} value={formatCurrency(summary?.loans.total || 0)} />
            <StatsCard label={t('admin.disbursed')} value={formatCurrency(summary?.loans.disbursed || 0)} />
            <StatsCard label={t('admin.collected')} value={formatCurrency(summary?.payments.totalCollected || 0)} />
            <StatsCard label={t('admin.serviceCharge')} value={formatCurrency(summary?.payments.totalServiceCharge || 0)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DonationChart data={donationChart} />
            <LoanStatusChart data={loanChart} />
          </div>
        </>
      )}

      {tab === 'users' && (
        <Card title={t('admin.userManagement')}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">{t('admin.name')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">{t('admin.email')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">{t('admin.role')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">{t('admin.status')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="py-3 text-sm text-gray-900">{u.name}</td>
                    <td className="py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="py-3"><StatusBadge status={u.role} /></td>
                    <td className="py-3">
                      <StatusBadge status={u.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {u.role !== 'super_admin' && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleUserAction(u._id, { isActive: !u.isActive })}
                            >
                              {u.isActive ? t('admin.suspend') : t('admin.activate')}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'loans' && (
        <Card title={t('admin.loanManagement')}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">{t('admin.borrower')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">{t('common.amount')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">{t('common.status')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">{t('borrower.outstanding')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td className="py-3 text-sm text-gray-900">
                      {loan.borrower?.name || 'Unknown'}
                      <span className="text-gray-400 block text-xs">{loan.borrower?.email}</span>
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900">{formatCurrency(loan.amount)}</td>
                    <td className="py-3"><StatusBadge status={loan.status} /></td>
                    <td className="py-3 text-sm text-gray-500">{formatCurrency(loan.outstandingBalance)}</td>
                    <td className="py-3">
                      <div className="flex gap-1 flex-wrap">
                        {loan.status === 'pending' && (
                          <>
                            <Button variant="secondary" size="sm" onClick={() => handleLoanAction(loan._id, 'approve')}>{t('admin.approve')}</Button>
                            <Button variant="danger" size="sm" onClick={() => handleLoanAction(loan._id, 'reject')}>{t('admin.reject')}</Button>
                          </>
                        )}
                        {loan.status === 'approved' && (
                          <Button size="sm" onClick={() => handleLoanAction(loan._id, 'disburse')}>{t('admin.disburse')}</Button>
                        )}
                        {loan.status === 'disbursed' && (
                          <Button variant="secondary" size="sm" onClick={() => handleLoanAction(loan._id, 'default')}>{t('admin.markDefault')}</Button>
                        )}
                        {loan.status === 'disbursed' && (
                          <Button variant="secondary" size="sm" onClick={() => handleLoanAction(loan._id, 'complete')}>{t('admin.complete')}</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

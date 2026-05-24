'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useT } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

interface LoanDetail {
  _id: string;
  amount: number;
  outstandingBalance: number;
  amountPaid: number;
  monthlyServiceCharge: number;
  tenureMonths: number;
  status: string;
}

export default function RepayLoanPage() {
  const router = useRouter();
  const params = useParams();
  const t = useT();
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/loans/${params.id}`);
        const result = await res.json();
        if (result.success) {
          setLoan(result.data.loan);
        } else {
          toast.error(t('errors.loanNotFound'));
          router.push('/dashboard/borrower');
        }
      } catch {
        toast.error(t('errors.internalError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, t]);

  const handleRepay = async (e: FormEvent) => {
    e.preventDefault();
    const repayAmount = parseFloat(amount);

    if (isNaN(repayAmount) || repayAmount <= 0) {
      toast.error(t('validation.enterAmount'));
      return;
    }
    if (loan && repayAmount > loan.outstandingBalance) {
      toast.error(t('errors.amountExceeds'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: params.id,
          amount: repayAmount,
          paymentMethod: 'online',
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('Payment successful!');
        router.push('/dashboard/borrower');
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch {
      toast.error(t('errors.paymentFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!loan) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('loan.repayTitle')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500">{t('borrower.originalAmount')}</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(loan.amount)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">{t('borrower.outstanding')}</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(loan.outstandingBalance)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">{t('borrower.alreadyPaid')}</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(loan.amountPaid)}</p>
        </Card>
      </div>
      <Card title={t('borrower.makePayment')}>
        <form onSubmit={handleRepay} className="space-y-4">
          <Input
            label={t('loan.repayAmount')}
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            max={loan.outstandingBalance}
            required
          />
          {amount && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="text-gray-600">
                {t('loan.serviceChargeNote')}
              </p>
              <p className="text-gray-600 mt-1">
                {t('loan.serviceChargeNote2')}
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={submitting}>
              {t('borrower.payNow')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/borrower')}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

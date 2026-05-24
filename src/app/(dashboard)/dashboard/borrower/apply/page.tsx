'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function ApplyLoanPage() {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    purpose: '',
    tenureMonths: '12',
    notes: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    const tenure = parseInt(form.tenureMonths);

    if (isNaN(amount) || amount < 500) {
      toast.error(t('errors.minLoan'));
      return;
    }
    if (form.purpose.length < 10) {
      toast.error(t('validation.purposeMin'));
      return;
    }
    if (isNaN(tenure) || tenure < 1 || tenure > 60) {
      toast.error(t('validation.tenureRange'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, purpose: form.purpose, tenureMonths: tenure, notes: form.notes }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('Loan application submitted!');
        router.push('/dashboard/borrower');
      } else {
        toast.error(result.error || 'Application failed');
      }
    } catch {
      toast.error(t('errors.internalError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('loan.applyTitle')}</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('loan.loanAmount')}
            type="number"
            placeholder="5000"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            min={500}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('loan.purpose')}
            </label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
              placeholder={t('loan.purposePlaceholder')}
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              required
              minLength={10}
            />
          </div>
          <Input
            label={t('loan.tenure')}
            type="number"
            placeholder="12"
            value={form.tenureMonths}
            onChange={(e) => setForm({ ...form, tenureMonths: e.target.value })}
            min={1}
            max={60}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('loan.notes')}
            </label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
              placeholder={t('loan.notesPlaceholder')}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
            <strong>{t('loan.loanTerms')}:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>{t('loan.termZero')}</li>
              <li>{t('loan.termCharge')}</li>
              <li>{t('loan.termPartial')}</li>
              <li>{t('loan.termPenalty')}</li>
            </ul>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>
              {t('loan.submitApplication')}
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

'use client';

import { Card } from '@/components/ui/Card';

interface ChartData {
  _id: string;
  total: number;
  count?: number;
}

interface DonationChartProps {
  data: ChartData[];
  title?: string;
}

export function DonationChart({ data, title = 'Monthly Donations' }: DonationChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card title={title}>
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          No donation data yet
        </div>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.total));

  return (
    <Card title={title}>
      <div className="h-48 flex items-end gap-2">
        {data.map((item) => (
          <div
            key={item._id}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <span className="text-xs text-gray-500">
              {item.total.toLocaleString()}
            </span>
            <div
              className="w-full bg-blue-500 rounded-t"
              style={{
                height: `${(item.total / maxValue) * 100}%`,
                minHeight: '4px',
              }}
            />
            <span className="text-xs text-gray-400 truncate w-full text-center">
              {item._id}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface LoanStatusChartProps {
  data: { _id: string; count: number; totalAmount: number }[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-400',
  approved: 'bg-blue-400',
  rejected: 'bg-red-400',
  disbursed: 'bg-green-400',
  completed: 'bg-emerald-600',
  defaulted: 'bg-red-600',
};

export function LoanStatusChart({ data }: LoanStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card title="Loan Status Distribution">
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          No loan data yet
        </div>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card title="Loan Status Distribution">
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item._id} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 capitalize w-24">{item._id}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${statusColors[item._id] || 'bg-gray-400'}`}
                style={{ width: `${(item.count / total) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 w-16 text-right">{item.count}</span>
            <span className="text-sm text-gray-700 w-24 text-right font-medium">
              {item.totalAmount.toLocaleString()} BDT
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

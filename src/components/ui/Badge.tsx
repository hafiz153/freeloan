import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variants = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    pending: { label: 'Pending', variant: 'warning' },
    approved: { label: 'Approved', variant: 'info' },
    rejected: { label: 'Rejected', variant: 'danger' },
    disbursed: { label: 'Disbursed', variant: 'success' },
    completed: { label: 'Completed', variant: 'success' },
    defaulted: { label: 'Defaulted', variant: 'danger' },
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'danger' },
    verified: { label: 'Verified', variant: 'success' },
    unverified: { label: 'Unverified', variant: 'default' },
  };

  const mapped = statusMap[status] || { label: status, variant: 'default' as const };
  return <Badge variant={mapped.variant}>{mapped.label}</Badge>;
}

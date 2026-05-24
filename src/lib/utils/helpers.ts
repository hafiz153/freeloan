import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN${timestamp}${random}`;
}

export function formatCurrency(amount: number, currency = 'BDT'): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function calculateServiceCharge(
  outstandingBalance: number,
  ratePercent: number = 1
): number {
  return (outstandingBalance * ratePercent) / 100;
}

export function calculateTotalRepayable(
  principal: number,
  tenureMonths: number,
  ratePercent: number = 1
): number {
  let balance = principal;
  let totalCharge = 0;

  for (let i = 0; i < tenureMonths; i++) {
    totalCharge += calculateServiceCharge(balance, ratePercent);
    balance -= principal / tenureMonths;
  }

  return principal + totalCharge;
}

export function calculateMonthlyServiceCharge(
  principal: number,
  tenureMonths: number,
  ratePercent: number = 1
): number {
  const monthlyPrincipal = principal / tenureMonths;
  let totalCharge = 0;

  for (let i = 0; i < tenureMonths; i++) {
    const balance = principal - monthlyPrincipal * i;
    totalCharge += calculateServiceCharge(balance, ratePercent);
  }

  return totalCharge / tenureMonths;
}

export function excludePassword<T extends Record<string, unknown>>(user: T): Omit<T, 'password'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest as Omit<T, 'password'>;
}

export function parsePageParam(param: string | null, defaultVal = 1): number {
  if (!param) return defaultVal;
  const num = parseInt(param, 10);
  return isNaN(num) || num < 1 ? defaultVal : num;
}

export function parseLimitParam(param: string | null, defaultVal = 10): number {
  if (!param) return defaultVal;
  const num = parseInt(param, 10);
  return isNaN(num) || num < 1 ? defaultVal : Math.min(num, 100);
}

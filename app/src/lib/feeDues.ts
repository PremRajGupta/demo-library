import { parseDateInputValue } from './formatDate';

export type FeePaymentLike = {
  month: string;
  amount: number;
  paymentDate?: string | Date;
};

export type FeeDueBreakdown = {
  pendingAmount: number;
  paidAmount: number;
  expectedTotal: number;
  overdueMonths: number;
  currentMonthPaid: number;
};

export const getGracePeriodEnd = (joinDate: Date): Date => {
  return addBillingMonths(joinDate, 1);
};

export function addBillingMonths(startDate: Date, months: number): Date {
  const wholeMonths = Math.max(0, Math.floor(months));
  const originalDay = startDate.getDate();
  const endDate = new Date(startDate);
  endDate.setHours(0, 0, 0, 0);
  endDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + wholeMonths);
  const lastDayOfTargetMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
  endDate.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  return endDate;
}

function formatPeriodLabel(index: number, billingStart: Date): string {
  const labelDate = new Date(billingStart);
  labelDate.setMonth(labelDate.getMonth() + index);
  const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
  return labelDate.toLocaleDateString('en-IN', options);
}

export function getBillablePeriodCount(startDate: Date, asOf: Date): number {
  if (asOf < startDate) return 0;
  let count = 0;
  while (addBillingMonths(startDate, count) <= asOf) {
    count += 1;
  }
  return count;
}

export const computeStudentFeeDue = ({
  monthlyFee,
  joiningDate,
  payments,
  asOf = new Date(),
}: {
  monthlyFee: number;
  joiningDate?: string | Date | null;
  payments: FeePaymentLike[];
  asOf?: Date;
}): FeeDueBreakdown => {
  const empty: FeeDueBreakdown = {
    pendingAmount: 0,
    paidAmount: 0,
    expectedTotal: 0,
    overdueMonths: 0,
    currentMonthPaid: 0,
  };

  if (!monthlyFee || monthlyFee <= 0) return empty;

  const joinDate = parseDateInputValue(joiningDate) || asOf;
  // Advance billing: the first 30-day period starts immediately from joiningDate.
  const billingStart = joinDate;
  const periodCount = getBillablePeriodCount(billingStart, asOf);
  if (periodCount <= 0) return empty;

  const paidAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const expectedTotal = periodCount * monthlyFee;

  let overdueMonths = 0;
  let currentMonthPaid = 0;
  const currentStart = addBillingMonths(billingStart, periodCount - 1);

  let remainingPaid = Math.max(0, paidAmount);

  for (let i = 0; i < periodCount; i += 1) {
    const start = addBillingMonths(billingStart, i);

    const allocated = Math.min(remainingPaid, monthlyFee);
    remainingPaid -= allocated;
    remainingPaid = Math.max(0, remainingPaid);

    if (allocated < monthlyFee) {
      overdueMonths += 1;
    }

    if (start.getTime() === currentStart.getTime()) {
      currentMonthPaid = allocated;
    }
  }

  return {
    pendingAmount: Math.max(expectedTotal - paidAmount, 0),
    paidAmount,
    expectedTotal,
    overdueMonths,
    currentMonthPaid,
  };
};

export const getUnpaidMonthOptions = (
  monthlyFee: number,
  joiningDate: string | Date | null | undefined,
  payments: FeePaymentLike[],
  asOf: Date = new Date(),
): string[] => {
  const joinDate = parseDateInputValue(joiningDate) || asOf;
  const billingStart = joinDate;
  const periodCount = getBillablePeriodCount(billingStart, asOf);
  if (!monthlyFee || monthlyFee <= 0 || periodCount <= 0) return [];

  const paidAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  let remainingPaid = Math.max(0, paidAmount);

  const options: string[] = [];
  for (let i = 0; i < periodCount; i += 1) {
    const allocated = Math.min(remainingPaid, monthlyFee);
    remainingPaid -= allocated;
    remainingPaid = Math.max(0, remainingPaid);

    if (allocated < monthlyFee) {
      options.push(formatPeriodLabel(i, billingStart));
    }
  }

  return options;
};

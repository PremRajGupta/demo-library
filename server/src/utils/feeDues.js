const MS_PER_DAY = 24 * 60 * 60 * 1000;
const BILLING_DAYS = 30;
const BILLING_MS = BILLING_DAYS * MS_PER_DAY;

export const parseDateInputValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const str = String(value);
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getGracePeriodEnd = (joinDate) => {
  const end = new Date(joinDate);
  end.setDate(end.getDate() + 30);
  return end;
};

const toValidDate = (value) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getBillablePeriodCount = (startDate, asOf) => {
  if (asOf < startDate) return 0;
  const elapsed = asOf.getTime() - startDate.getTime();
  return Math.floor(elapsed / BILLING_MS) + 1;
};

export const computeStudentFeeDue = ({
  monthlyFee,
  joiningDate,
  payments,
  asOf = new Date(),
}) => {
  const empty = {
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

  const paymentsWithDate = (payments || [])
    .map((p) => ({
      amount: Number(p.amount) || 0,
      paidOn: toValidDate(p.paymentDate) || asOf,
    }))
    .filter((p) => p.amount > 0 && p.paidOn && !Number.isNaN(p.paidOn.getTime()))
    .sort((a, b) => a.paidOn.getTime() - b.paidOn.getTime());

  const expectedTotal = periodCount * monthlyFee;
  const paidAmount = paymentsWithDate.reduce((sum, p) => sum + p.amount, 0);

  let overdueMonths = 0;
  let currentMonthPaid = 0;
  const currentStart = new Date(billingStart.getTime() + (periodCount - 1) * BILLING_MS);
  const currentEnd = new Date(currentStart.getTime() + BILLING_MS);

  for (let i = 0; i < periodCount; i += 1) {
    const start = new Date(billingStart.getTime() + i * BILLING_MS);
    const end = new Date(start.getTime() + BILLING_MS);
    const paidInPeriod = paymentsWithDate
      .filter((p) => p.paidOn >= start && p.paidOn < end)
      .reduce((sum, p) => sum + p.amount, 0);

    const periodDue = Math.max(monthlyFee - paidInPeriod, 0);
    if (periodDue > 0) overdueMonths += 1;

    if (start.getTime() === currentStart.getTime() && end.getTime() === currentEnd.getTime()) {
      currentMonthPaid = paidInPeriod;
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

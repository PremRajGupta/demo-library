/**
 * Payment Validity Calculation Service
 * Handles advance payments and calculates validity periods
 */

/**
 * Calculate how many complete months an advance payment covers
 * @param advanceAmount - Total advance amount paid
 * @param monthlyFee - Monthly fee amount
 * @returns Number of complete months covered
 */
export const calculateMonthsCovered = (advanceAmount: number, monthlyFee: number): number => {
  if (monthlyFee <= 0) return 0;
  return Math.floor(advanceAmount / monthlyFee);
};

/**
 * Calculate validity end date based on advance months
 * @param startDate - Starting date (joining date or last payment date)
 * @param monthsCovered - Number of months the advance covers
 * @returns Object with validity end date and formatted string
 */
export const calculateValidityEndDate = (
  startDate: string | Date,
  monthsCovered: number
): {
  endDate: Date;
  endDateStr: string;
  formattedDate: string;
} => {
  const date = new Date(startDate);
  date.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + Math.max(0, Math.floor(monthsCovered)));
  const lastDayOfTargetMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
  endDate.setDate(Math.min(date.getDate(), lastDayOfTargetMonth));

  const endDateStr = endDate.toISOString().split('T')[0];
  const formattedDate = endDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return {
    endDate,
    endDateStr,
    formattedDate,
  };
};

/**
 * Get payment validity information
 * @param monthlyFee - Monthly fee amount
 * @param advanceAmount - Total advance amount paid
 * @param startDate - Joining/starting date
 * @returns Validity information
 */
export const getPaymentValidity = (
  monthlyFee: number,
  advanceAmount: number,
  startDate: string | Date
): {
  monthsCovered: number;
  validUntilDate: string;
  validUntilFormatted: string;
  paymentStatus: 'valid' | 'expired' | 'expiring-soon';
} => {
  const monthsCovered = calculateMonthsCovered(advanceAmount, monthlyFee);
  const { endDateStr, formattedDate } = calculateValidityEndDate(startDate, monthsCovered);

  // Check if payment is valid, expired, or expiring soon
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(endDateStr);
  endDate.setHours(0, 0, 0, 0);

  const daysRemaining = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let paymentStatus: 'valid' | 'expired' | 'expiring-soon' = 'valid';
  if (daysRemaining < 0) {
    paymentStatus = 'expired';
  } else if (daysRemaining <= 15) {
    paymentStatus = 'expiring-soon';
  }

  return {
    monthsCovered,
    validUntilDate: endDateStr,
    validUntilFormatted: formattedDate,
    paymentStatus,
  };
};

/**
 * Calculate remaining days in payment validity
 * @param validUntilDate - Date until payment is valid
 * @returns Number of days remaining
 */
export const getDaysRemaining = (validUntilDate: string | Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(validUntilDate);
  endDate.setHours(0, 0, 0, 0);

  const daysRemaining = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysRemaining);
};

/**
 * Get payment status badge color
 * @param status - Payment status
 * @returns CSS class for badge color
 */
export const getPaymentStatusColor = (
  status: 'valid' | 'expired' | 'expiring-soon'
): string => {
  switch (status) {
    case 'valid':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'expiring-soon':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'expired':
      return 'bg-red-100 text-red-800 border border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-300';
  }
};

/**
 * Get payment status label
 * @param status - Payment status
 * @returns Display label
 */
export const getPaymentStatusLabel = (
  status: 'valid' | 'expired' | 'expiring-soon'
): string => {
  switch (status) {
    case 'valid':
      return 'Valid';
    case 'expiring-soon':
      return 'Expiring Soon';
    case 'expired':
      return 'Expired';
    default:
      return 'Unknown';
  }
};

/**
 * Format advance payment info for display
 * @param monthsCovered - Number of months covered
 * @param validUntilFormatted - Formatted validity date
 * @param daysRemaining - Days remaining
 * @returns Formatted string for display
 */
export const formatAdvancePaymentInfo = (
  monthsCovered: number,
  validUntilFormatted: string,
  daysRemaining: number
): string => {
  return `${monthsCovered} month${monthsCovered !== 1 ? 's' : ''} • Valid until ${validUntilFormatted} (${daysRemaining} days)`;
};

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { getPaymentValidity, getPaymentStatusColor, getPaymentStatusLabel, getDaysRemaining } from '../../lib/paymentValidity';

interface AdvancePaymentProps {
  studentId: string;
  studentName: string;
  monthlyFee: number;
  advanceAmount: number;
  joiningDate?: string;
  onMarkAdvance?: (months: number, validUntilDate: string) => void;
  isLoading?: boolean;
}

export default function AdvancePaymentCard({ 
  studentId, 
  studentName, 
  monthlyFee, 
  advanceAmount,
  joiningDate,
  onMarkAdvance,
  isLoading = false
}: AdvancePaymentProps) {
  const [validity, setValidity] = useState<any>(null);

  useEffect(() => {
    if (monthlyFee > 0 && advanceAmount > 0 && joiningDate) {
      const validityInfo = getPaymentValidity(monthlyFee, advanceAmount, joiningDate);
      setValidity(validityInfo);
    }
  }, [monthlyFee, advanceAmount, joiningDate]);

  if (!validity) {
    return null;
  }

  const daysRemaining = getDaysRemaining(validity.validUntilDate);
  const statusColor = getPaymentStatusColor(validity.paymentStatus);
  const statusLabel = getPaymentStatusLabel(validity.paymentStatus);

  return (
    <div className={`border-l-4 border-[#3b82f6] rounded-lg p-4 sm:p-6 mb-4 ${
      validity.paymentStatus === 'valid' ? 'bg-green-50' :
      validity.paymentStatus === 'expiring-soon' ? 'bg-yellow-50' :
      'bg-red-50'
    }`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="mt-1 flex-shrink-0">
          {validity.paymentStatus === 'valid' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
          {validity.paymentStatus === 'expiring-soon' && <Clock className="w-5 h-5 text-yellow-600" />}
          {validity.paymentStatus === 'expired' && <AlertCircle className="w-5 h-5 text-red-600" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h3 className="text-lg font-bold text-[#1e293b]">
              Advance Payment Summary
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {/* Months Covered */}
            <div className="bg-white rounded-lg p-3 border border-[#e2e8f0]">
              <p className="text-xs text-[#64748b] mb-1">Months Covered</p>
              <p className="text-2xl font-bold text-[#3b82f6]">{validity.monthsCovered}</p>
              <p className="text-xs text-[#94a3b8] mt-1">month{validity.monthsCovered !== 1 ? 's' : ''}</p>
            </div>

            {/* Total Amount */}
            <div className="bg-white rounded-lg p-3 border border-[#e2e8f0]">
              <p className="text-xs text-[#64748b] mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-[#10b981]">₹{advanceAmount}</p>
              <p className="text-xs text-[#94a3b8] mt-1">per month: ₹{monthlyFee}</p>
            </div>

            {/* Valid Until */}
            <div className="bg-white rounded-lg p-3 border border-[#e2e8f0]">
              <p className="text-xs text-[#64748b] mb-1">Valid Until</p>
              <p className="text-sm font-bold text-[#1e293b]">{validity.validUntilFormatted}</p>
              <p className="text-xs text-[#94a3b8] mt-1">{validity.validUntilDate}</p>
            </div>

            {/* Days Remaining */}
            <div className={`bg-white rounded-lg p-3 border ${
              validity.paymentStatus === 'valid' ? 'border-green-300 bg-green-50' :
              validity.paymentStatus === 'expiring-soon' ? 'border-yellow-300 bg-yellow-50' :
              'border-red-300 bg-red-50'
            }`}>
              <p className="text-xs text-[#64748b] mb-1">Days Remaining</p>
              <p className={`text-2xl font-bold ${
                validity.paymentStatus === 'valid' ? 'text-green-600' :
                validity.paymentStatus === 'expiring-soon' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {daysRemaining}
              </p>
              <p className="text-xs text-[#94a3b8] mt-1">days left</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg p-3 border border-[#e2e8f0]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#64748b] mb-1">Student</p>
                <p className="font-semibold text-[#1e293b]">{studentName} ({studentId})</p>
              </div>
              <div>
                <p className="text-xs text-[#64748b] mb-1">Monthly Fee</p>
                <p className="font-semibold text-[#1e293b]">₹{monthlyFee}</p>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className={`mt-3 p-3 rounded-lg ${
            validity.paymentStatus === 'valid' ? 'bg-green-100 text-green-800' :
            validity.paymentStatus === 'expiring-soon' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <p className="text-sm font-medium">
              {validity.paymentStatus === 'valid' && 
                `✓ Payment is valid. Student can access services until ${validity.validUntilFormatted}.`}
              {validity.paymentStatus === 'expiring-soon' && 
                `⚠ Payment expiring soon. Valid until ${validity.validUntilFormatted}. Please collect renewal.`}
              {validity.paymentStatus === 'expired' && 
                `✗ Payment has expired. Please collect renewal fee.`}
            </p>
          </div>

          {/* Action Button */}
          {onMarkAdvance && (
            <button
              onClick={() => onMarkAdvance(validity.monthsCovered, validity.validUntilDate)}
              disabled={isLoading}
              className="mt-3 w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {isLoading ? 'Processing...' : 'Mark as Advance Payment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

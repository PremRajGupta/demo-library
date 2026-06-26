import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TopHeader from '../components/layout/TopHeader';
import S from '../lib/strings';
import { generateReceiptPDF, getDefaultReceiptLogo } from '../sections/fees/receiptService';
import { getInitials, getAvatarColor } from '../sections/fees/feeModels';
import type { PaymentReceipt } from '../sections/fees/receiptService';
import type { StudentFee } from '../sections/fees/feeModels';
import {
  createPaymentRecord,
  saveFeePayment,
  getStoredPayments,
  mapStudentToFeeRow,
} from '../sections/fees/collectionService';
import { getStudentDisplayId } from '../lib/studentId';
import { studentApi, feeApi } from '../lib/apiService';
import { getFeeForTimeShift, getTimeShiftLabel } from '../lib/feeRules';
import { addBillingMonths, computeStudentFeeDue, getBillablePeriodCount, getUnpaidMonthOptions } from '../lib/feeDues';
import { formatJoiningDate, parseDateInputValue, toDateInputString, toDateInputValue } from '../lib/formatDate';
import { Search, Wallet, Check, CreditCard, X, IndianRupee, ArrowRight, RefreshCw, CheckCircle2, Eye, Pencil, Zap } from 'lucide-react';

type FeesLocationState = {
  openPayForStudentId?: string;
};

const formatMobileDisplay = (mobile?: string) => {
  if (!mobile?.trim()) return 'N/A';
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits}`;
  return mobile;
};

const renderStudentAvatar = (
  name: string,
  photo?: string,
  sizeClass = 'w-9 h-9',
  textClass = 'text-xs',
  shapeClass = 'rounded-full',
) => {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizeClass} ${shapeClass} object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${sizeClass} ${shapeClass} ${getAvatarColor(name)} flex items-center justify-center flex-shrink-0`}>
      <span className={`text-white font-semibold ${textClass}`}>{getInitials(name)}</span>
    </div>
  );
};

const formatPaymentDate = (date?: string) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getPeriodLabelFromDateValue = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const start = new Date(parsed);
  start.setHours(0, 0, 0, 0);
  const endInclusive = new Date(start);
  endInclusive.setDate(1);
  endInclusive.setMonth(endInclusive.getMonth() + 1);
  const lastDayOfTargetMonth = new Date(endInclusive.getFullYear(), endInclusive.getMonth() + 1, 0).getDate();
  endInclusive.setDate(Math.min(start.getDate(), lastDayOfTargetMonth));
  endInclusive.setDate(endInclusive.getDate() - 1);
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  return `${start.toLocaleDateString('en-IN', options)} - ${endInclusive.toLocaleDateString('en-IN', options)}`;
};

// Removed unused helper getDateValueFromMonthLabel to avoid TS warnings.

const isAdmissionPayment = (payment: PaymentReceipt) => {
  const note = payment.notes?.toLowerCase() ?? '';
  return note.includes('admission') && !note.includes('pending fee') && !note.includes('due');
};

export function FeeCollection() {
  const location = useLocation();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentFee[]>([]);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  
  const loadData = async () => {
    try {
      const [studentData, paymentData] = await Promise.all([
        studentApi.getStudents(),
        getStoredPayments(),
      ]);

      const paymentsByStudent = paymentData.reduce((acc: Record<string, Array<{ month: string; amount: number; paymentDate?: string }>>, payment: PaymentReceipt) => {
        const studentId = payment.studentId;
        if (!studentId) return acc;
        if (!acc[studentId]) acc[studentId] = [];
        acc[studentId].push({
          month: payment.month,
          amount: Number(payment.feeCreditAmount ?? payment.amount) || 0,
          paymentDate: payment.date,
        });
        return acc;
      }, {});

      const lastPaidByStudent = paymentData.reduce((acc: Record<string, string>, payment: PaymentReceipt) => {
        const studentId = payment.studentId;
        const paymentDate = payment.date;
        if (!studentId || !paymentDate) return acc;
        if (!acc[studentId] || paymentDate > acc[studentId]) {
          acc[studentId] = paymentDate;
        }
        return acc;
      }, {});

      const mappedStudents = studentData.map((s: Record<string, unknown>) => {
        const row = mapStudentToFeeRow(s);
        const displayId = getStudentDisplayId(s);
        const monthlyFee = Number(s.feeAmount) || getFeeForTimeShift(String(s.timeShift || ''));
        const studentPayments = paymentsByStudent[displayId] || [];
        const due = computeStudentFeeDue({
          monthlyFee,
          joiningDate: row.joiningDate,
          payments: studentPayments,
        });

        return {
          ...row,
          monthlyFee,
          feeDue: due.pendingAmount,
          overdueMonths: due.overdueMonths,
          lastPaid: lastPaidByStudent[displayId] || '-',
        };
      });

      setStudents(mappedStudents);
      setPayments(paymentData);
    } catch (error) {
      console.error('Failed to load fee data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [location]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentFee | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [month, setMonth] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [notes, setNotes] = useState('');
  const [includeAdmissionFee, setIncludeAdmissionFee] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [successPayment, setSuccessPayment] = useState<PaymentReceipt | null>(null);
  const [editPayment, setEditPayment] = useState<PaymentReceipt | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');
  // Pagination state
  const RECORDS_PER_PAGE = 7;
  const [duePage, setDuePage] = useState(1);

  // Mark as Advance states (in Recent Payments)
  const [markAdvancePayment, setMarkAdvancePayment] = useState<PaymentReceipt | null>(null);
  const [advanceMonthlyFee, setAdvanceMonthlyFee] = useState('');
  const [advanceStartDate, setAdvanceStartDate] = useState('');
  const [isMarkingAdvance, setIsMarkingAdvance] = useState(false);

  // Mark as Advance during payment collection
  const [markAsAdvanceDuringCollection, setMarkAsAdvanceDuringCollection] = useState(false);

  // State for payment validity details in receipt
  const [receiptFeeDetails, setReceiptFeeDetails] = useState<any>(null);
  const [loadingFeeDetails, setLoadingFeeDetails] = useState(false);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openPaymentReceipt = (payment: PaymentReceipt) => {
    const student = students.find((s) => s.studentId === payment.studentId);
    if (!student) return;
    setSelectedStudent(student);
    setSuccessPayment(payment);
  };

  const openEditPayment = (payment: PaymentReceipt) => {
    setEditPayment(payment);
    setEditAmount(String(payment.amount));
    setEditNotes(payment.notes || '');
  };

  const closeEditPayment = () => {
    setEditPayment(null);
    setEditAmount('');
    setEditNotes('');
  };

  const openMarkAdvanceModal = (payment: PaymentReceipt) => {
    const student = students.find((s) => s.studentId === payment.studentId);
    if (!student) return;
    setMarkAdvancePayment(payment);
    setAdvanceMonthlyFee(String(student.monthlyFee));
    setAdvanceStartDate(toDateInputValue(new Date(payment.date || new Date())));
  };

  const closeMarkAdvanceModal = () => {
    setMarkAdvancePayment(null);
    setAdvanceMonthlyFee('');
    setAdvanceStartDate('');
    setIsMarkingAdvance(false);
  };

  const handleMarkAsAdvance = async () => {
    if (!markAdvancePayment) return;

    const monthlyFee = parseFloat(advanceMonthlyFee);
    if (isNaN(monthlyFee) || monthlyFee <= 0) {
      showNotification('Please enter a valid monthly fee.', 'error');
      return;
    }

    if (!advanceStartDate) {
      showNotification('Please select a start date.', 'error');
      return;
    }

    try {
      setIsMarkingAdvance(true);
      // Pass the full payment amount as advanceAmount for this modal
      // (assuming payment is fully advance when marking from recent payments)
      await feeApi.markAdvancePayment(
        markAdvancePayment.rawId || markAdvancePayment.id,
        monthlyFee,
        advanceStartDate,
        true,
        markAdvancePayment.amount
      );
      showNotification('Payment marked as advance successfully!', 'success');
      await loadData();
      closeMarkAdvanceModal();
    } catch (error) {
      console.error('Failed to mark as advance:', error);
      showNotification('Failed to mark as advance. Please try again.', 'error');
    } finally {
      setIsMarkingAdvance(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && s.feeDue > 0;
  });

  // Paginated slices
  const dueTotalPages = Math.max(1, Math.ceil(filteredStudents.length / RECORDS_PER_PAGE));
  const paginatedDueStudents = filteredStudents.slice((duePage - 1) * RECORDS_PER_PAGE, duePage * RECORDS_PER_PAGE);

  // Keep only the latest RECORDS_PER_PAGE recent payments (newest first)
  const recentPaymentsSorted = [...payments].sort((a, b) => (new Date(b.date || '').getTime() - new Date(a.date || '').getTime()));
  const paginatedRecentPayments = recentPaymentsSorted.slice(0, RECORDS_PER_PAGE);

  const totalDue = students.reduce((sum, s) => sum + s.feeDue, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const openPayModal = (student: StudentFee) => {
    const studentPayments = payments
      .filter((payment) => payment.studentId === student.studentId)
      .map((payment) => ({
        month: payment.month,
        amount: payment.feeCreditAmount ?? payment.amount,
        paymentDate: payment.date,
      }));
    const monthOptions = getUnpaidMonthOptions(
      student.monthlyFee,
      student.joiningDate,
      studentPayments,
    );

    setSelectedStudent(student);
    setPayAmount(String(student.feeDue));
    setDiscount('');
    setMonth(toDateInputValue(new Date()));
    setPaymentMode('cash');

    const pendingMonthsText = monthOptions.length > 0
      ? `Pending for: ${monthOptions.join(', ')}`
      : 'Pending for the current period';

    setNotes(pendingMonthsText);
    setIncludeAdmissionFee(false);
    setSuccessPayment(null);
    setMarkAsAdvanceDuringCollection(false);
  };

  useEffect(() => {
    const openPayForStudentId = (location.state as FeesLocationState | null)?.openPayForStudentId;
    if (!openPayForStudentId || students.length === 0) return;

    const student = students.find((s) => s.studentId === openPayForStudentId);
    if (student && student.feeDue > 0) {
      openPayModal(student);
    } else if (student) {
      showNotification('This student has no pending fee for this period.', 'error');
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [students, location.state, location.pathname, navigate]);

  // Fetch student-level payment validity when receipt is opened.
  useEffect(() => {
    if (!successPayment) {
      setReceiptFeeDetails(null);
      return;
    }

    const fetchFeeDetails = async () => {
      try {
        setLoadingFeeDetails(true);
        const validity = await feeApi.getStudentPaymentValidity(successPayment.studentId);
        setReceiptFeeDetails(validity);
      } catch (error) {
        console.error('Failed to fetch fee details:', error);
        setReceiptFeeDetails(null);
      } finally {
        setLoadingFeeDetails(false);
      }
    };

    fetchFeeDetails();
  }, [successPayment]);

  const handlePay = async () => {
    if (!selectedStudent || !payAmount || !month) {
      showNotification(S.fillFieldsError, 'error');
      return;
    }

    const collectedAmount = parseFloat(payAmount);
    const discountValue = parseFloat(discount) || 0;

    if (isNaN(collectedAmount) || collectedAmount <= 0) {
      showNotification(S.invalidAmountError, 'error');
      return;
    }

    if (discountValue < 0) {
      showNotification('Discount cannot be negative.', 'error');
      return;
    }

    if (discountValue > collectedAmount) {
      showNotification('Discount cannot be more than the pay amount.', 'error');
      return;
    }

    const creditAmount = collectedAmount;
    if (creditAmount <= 0) {
      showNotification('Amount after discount must be greater than zero.', 'error');
      return;
    }

    // If not marking as advance, validate amount doesn't exceed due
    if (!markAsAdvanceDuringCollection && creditAmount > selectedStudent.feeDue) {
      showNotification('Please mark as advance if paying more than the due amount.', 'error');
      return;
    }

    if (markAsAdvanceDuringCollection && creditAmount <= selectedStudent.feeDue) {
      showNotification('Advance payment must be more than the current due amount.', 'error');
      return;
    }

    const selectedMonthLabel = getPeriodLabelFromDateValue(month);
    const previousDue = selectedStudent.feeDue;
    const remainingDue = Math.max(0, previousDue - creditAmount);

    const noteParts: string[] = [
      `Paid ₹${collectedAmount.toLocaleString('en-IN')} for ${selectedMonthLabel}`,
      `Previous due ₹${previousDue.toLocaleString('en-IN')}`,
      `Remaining due ₹${remainingDue.toLocaleString('en-IN')}`,
    ];
    if (discountValue > 0) {
      noteParts.push(`Discount ₹${discountValue.toLocaleString('en-IN')} applied`);
    }
    if (selectedStudent.overdueMonths && selectedStudent.overdueMonths > 0) {
      noteParts.push(`Overdue months: ${selectedStudent.overdueMonths}`);
    }
    if (includeAdmissionFee) {
      noteParts.push('Includes Admission Fee');
    }
    if (notes.trim()) {
      noteParts.push(notes.trim());
    }

    const updatedStudents = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          feeDue: remainingDue,
          lastPaid: toDateInputString(new Date()),
        };
      }
      return s;
    });

    const joiningDateValue = toDateInputString(selectedStudent.joiningDate) || undefined;

    const newPayment = createPaymentRecord({
      studentName: selectedStudent.name,
      studentId: selectedStudent.studentId,
      course: selectedStudent.course,
      seatNumber: selectedStudent.seat,
      fatherName: selectedStudent.fatherName,
      studentMobile: selectedStudent.contact,
      joiningDate: joiningDateValue,
      amount: collectedAmount,
      discountAmount: discountValue,
      feeCreditAmount: creditAmount,
      month: selectedMonthLabel,
      paymentMode,
      notes: noteParts.length > 0 ? noteParts.join(' | ') : undefined,
    });

    setStudents(updatedStudents);
    try {
      const serverResponse = await saveFeePayment(newPayment);
      await loadData();

      // Use server-generated receipt number (GalaxyPRYYMMSS) if available
      const confirmedPayment: typeof newPayment = {
        ...newPayment,
        id: serverResponse?.receiptNumber || serverResponse?.receiptNo || newPayment.id,
        discountAmount: serverResponse?.discountAmount ?? newPayment.discountAmount,
        feeCreditAmount: serverResponse?.feeCreditAmount ?? newPayment.feeCreditAmount,
      };

      // If marked as advance, call the API to mark it
      if (markAsAdvanceDuringCollection && (serverResponse?._id || serverResponse?.id)) {
        try {
          const feeId = serverResponse._id || serverResponse.id;
          const billingStart = parseDateInputValue(selectedStudent.joiningDate) || new Date();
          const paidThroughCurrentPeriodCount = getBillablePeriodCount(billingStart, new Date());
          const advanceStartDate = toDateInputValue(addBillingMonths(billingStart, paidThroughCurrentPeriodCount));
          const advanceAmount = Math.max(0, creditAmount - previousDue);
          await feeApi.markAdvancePayment(
            feeId,
            selectedStudent.monthlyFee,
            advanceStartDate,
            true,
            advanceAmount
          );
          // Reset checkbox after successful advance marking
          setMarkAsAdvanceDuringCollection(false);
          // Refresh data to show updated advance payment status
          await loadData();
        } catch (advanceErr) {
          console.error('Failed to mark as advance:', advanceErr);
          showNotification('Advance payment marking failed. Please try again.', 'error');
        }
      }

      setSuccessPayment(confirmedPayment);
      
      await generateReceiptPDF(confirmedPayment, getDefaultReceiptLogo());
      showNotification(S.payCollectedMsg(collectedAmount, selectedStudent.name), 'success');
    } catch (err) {
      console.error('Payment saving or receipt generation error:', err);
      showNotification(S.paymentRecordedReceiptFailed, 'error');
    }
  };

  return (
    <div>
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-0 left-1/2 z-[9999] px-6 py-3 text-white text-sm font-medium rounded-b-lg shadow-lg ${
              notification.type === 'success' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
            }`}
          >
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <TopHeader />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-[10px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fee2e2] rounded-full flex items-center justify-center">
                <IndianRupee className="text-[#ef4444]" size={18} />
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Total Due Fees</p>
                <p className="text-xl font-bold text-[#ef4444]">₹{totalDue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[10px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#dcfce7] rounded-full flex items-center justify-center">
                <Check className="text-[#22c55e]" size={18} />
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Total Collected</p>
                <p className="text-xl font-bold text-[#22c55e]">₹{totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[10px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#dbeafe] rounded-full flex items-center justify-center">
                <Wallet className="text-[#3b82f6]" size={18} />
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Students with Due</p>
                <p className="text-xl font-bold text-[#3b82f6]">{filteredStudents.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="page-card">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#fef9c3] rounded-lg flex items-center justify-center">
              <Wallet className="text-[#eab308]" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1e293b]">Fee Collection</h2>
              <p className="text-sm text-[#64748b]">Students with pending fees</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Student ID or Name..."
              className="w-full pl-10 pr-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
            />
          </div>

          {/* Students Due Table */}
          <div className="table-scroll">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#e2e8f0]">
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Student</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Course</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Seat</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Monthly Fee</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Fee Due</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Last Paid</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#94a3b8]">
                      {searchTerm ? `No student found with "${searchTerm}"` : 'No pending fees!'}
                    </td>
                  </tr>
                ) : (
                  paginatedDueStudents.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.3 }}
                      className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#f8fafc] transition-colors duration-100"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {renderStudentAvatar(student.name, student.photo)}
                          <div>
                            <p className="text-sm font-medium text-[#1e293b]">{student.name}</p>
                            <p className="text-xs text-[#94a3b8]">{student.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-[#1e293b]">
                        <div>{student.course}</div>
                        <div className="text-xs text-[#64748b]">
                          {getTimeShiftLabel(student.timeShift, student.customShiftHours)}
                        </div>
                      </td>
                      <td className="py-4 text-sm text-[#64748b]">{student.seat}</td>
                      <td className="py-4 text-sm text-[#64748b]">₹{student.monthlyFee}</td>
                      <td className="py-4">
                        <span className="text-sm font-bold text-[#ef4444]">₹{student.feeDue.toLocaleString()}</span>
                      </td>
                      <td className="py-4 text-sm text-[#64748b]">{student.lastPaid}</td>
                      <td className="py-4">
                        <button
                          onClick={() => openPayModal(student)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#22c55e] text-white text-xs font-semibold rounded-md hover:bg-[#16a34a] transition-colors duration-150"
                        >
                          <CreditCard size={14} />
                          Pay
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Due Students Pagination */}
          {dueTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e2e8f0]">
              <p className="text-xs text-[#64748b]">
                Showing {(duePage - 1) * RECORDS_PER_PAGE + 1}–{Math.min(duePage * RECORDS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length} students
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDuePage((p) => Math.max(1, p - 1))}
                  disabled={duePage === 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-[#e2e8f0] rounded-md hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: dueTotalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setDuePage(pg)}
                    className={`w-8 h-8 text-xs font-bold rounded-md transition-colors ${
                      pg === duePage
                        ? 'bg-[#2F4FD7] text-white'
                        : 'border border-[#e2e8f0] hover:bg-[#f1f5f9] text-[#64748b]'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  onClick={() => setDuePage((p) => Math.min(dueTotalPages, p + 1))}
                  disabled={duePage === dueTotalPages}
                  className="px-3 py-1.5 text-xs font-semibold border border-[#e2e8f0] rounded-md hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        {payments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 page-card"
          >
            <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Recent Payments</h3>
            <div className="table-scroll">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-[#e2e8f0]">
                    <th className="pb-3 text-sm font-medium text-[#64748b]">Student</th>
                    <th className="pb-3 text-sm font-medium text-[#64748b]">Amount</th>
                    <th className="pb-3 text-sm font-medium text-[#64748b]">Due Period</th>
                    <th className="pb-3 text-sm font-medium text-[#64748b]">Mode</th>
                    <th className="pb-3 text-sm font-medium text-[#64748b]">Date</th>
                    <th className="pb-3 text-sm font-medium text-[#64748b]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecentPayments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[#e2e8f0] last:border-b-0"
                    >
                      <td className="py-3">
                        <p className="text-sm font-medium text-[#1e293b]">{payment.studentName}</p>
                        <p className="text-xs text-[#94a3b8]">{payment.studentId}</p>
                      </td>
                      <td className="py-3 text-sm font-bold text-[#22c55e]">₹{payment.amount.toLocaleString()}</td>
                      <td className="py-3 text-sm text-[#64748b]">{payment.month}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-[#dbeafe] text-[#3b82f6] text-xs font-medium rounded-md uppercase">
                          {payment.paymentMode || '—'}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-[#64748b]">{payment.date}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openPaymentReceipt(payment)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f1f5f9] text-[#475569] text-xs font-medium rounded-md hover:bg-[#e2e8f0] transition-colors"
                          >
                            <Eye size={13} />
                            View
                          </button>
                          <button
                            onClick={() => openEditPayment(payment)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#e2e8f0] text-[#1f2937] text-xs font-medium rounded-md hover:bg-[#cbd5e1] transition-colors"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() => openMarkAdvanceModal(payment)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#fef3c7] text-[#92400e] text-xs font-medium rounded-md hover:bg-[#fde68a] transition-colors"
                          >
                            <Zap size={13} />
                            Advance
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Showing only the latest 7 payments (no pagination) */}
          </motion.div>
        )}
      </motion.div>

      {/* Edit Payment Modal */}
      <AnimatePresence>
        {editPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeEditPayment}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, type: 'spring', stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1e293b]">Edit Payment</h2>
                  <p className="text-sm text-[#64748b]">Modify amount or note for this transaction.</p>
                </div>
                <button
                  onClick={closeEditPayment}
                  className="p-2 rounded-lg text-[#475569] hover:bg-[#f1f5f9] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#f8fafc] rounded-[16px] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#64748b] mb-2">Student</p>
                    <p className="text-sm font-semibold text-[#1e293b]">{editPayment.studentName}</p>
                    <p className="text-xs text-[#94a3b8]">{editPayment.studentId}</p>
                  </div>
                  <div className="bg-[#f8fafc] rounded-[16px] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#64748b] mb-2">Due Period (30 days)</p>
                    <p className="text-sm font-semibold text-[#1e293b]">{editPayment.month}</p>
                    <p className="text-xs text-[#64748b] mt-2">{editPayment.paymentMode?.toUpperCase() || 'Cash'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1e293b] mb-2">Amount</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="1"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-[#e2e8f0] rounded-[12px] focus:outline-none focus:border-[#2F4FD7] focus:ring-2 focus:ring-[#2F4FD7]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1e293b] mb-2">Notes</label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-[#e2e8f0] rounded-[12px] focus:outline-none focus:border-[#2F4FD7] focus:ring-2 focus:ring-[#2F4FD7]/20 transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
                  <button
                    onClick={async () => {
                      if (!editPayment) return;
                      const amountValue = parseFloat(editAmount);
                      if (Number.isNaN(amountValue) || amountValue <= 0) {
                        showNotification('Please enter a valid amount.', 'error');
                        return;
                      }

                      try {
                        await feeApi.updateFee(editPayment.rawId || editPayment.id, {
                          amount: amountValue,
                          notes: editNotes.trim() || undefined,
                        });
                        await loadData();
                        showNotification('Payment updated successfully.', 'success');
                        closeEditPayment();
                      } catch (error) {
                        console.error('Failed to update payment:', error);
                        showNotification('Unable to update payment. Please try again.', 'error');
                      }
                    }}
                    className="flex-1 py-3.5 bg-[#2F4FD7] text-white font-bold rounded-[14px] hover:bg-[#1e3ea9] transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={closeEditPayment}
                    className="flex-1 py-3.5 bg-white border border-[#e2e8f0] text-[#1e293b] font-bold rounded-[14px] hover:bg-[#f8fafc] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mark as Advance Modal */}
      <AnimatePresence>
        {markAdvancePayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={closeMarkAdvanceModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, type: 'spring', stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[24px] w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-y-auto my-auto"
            >
              <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 sm:px-6 py-4 bg-gradient-to-r from-[#fef08a] to-[#fef3c7]">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-[#92400e] text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-xl font-bold text-[#1e293b] truncate">Mark as Advance Payment</h2>
                    <p className="text-xs sm:text-sm text-[#64748b] truncate">Calculate and track advance payment validity</p>
                  </div>
                </div>
                <button
                  onClick={closeMarkAdvanceModal}
                  className="p-2 rounded-lg text-[#475569] hover:bg-[#fef08a] transition-colors flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6 overflow-y-auto"
                style={{ maxHeight: 'calc(90vh - 80px)' }}
              >
                {/* Payment Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#f8fafc] rounded-[16px] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#64748b] mb-2">Student</p>
                    <p className="text-sm font-semibold text-[#1e293b]">{markAdvancePayment.studentName}</p>
                    <p className="text-xs text-[#94a3b8]">{markAdvancePayment.studentId}</p>
                  </div>
                  <div className="bg-[#f8fafc] rounded-[16px] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#64748b] mb-2">Payment Amount</p>
                    <p className="text-sm font-semibold text-[#22c55e]">₹{markAdvancePayment.amount.toLocaleString()}</p>
                    <p className="text-xs text-[#64748b] mt-1">For: {markAdvancePayment.month}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1e293b] mb-2">Monthly Fee *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] font-semibold">₹</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        value={advanceMonthlyFee}
                        onChange={(e) => setAdvanceMonthlyFee(e.target.value)}
                        className="w-full pl-8 pr-4 py-3.5 border-2 border-[#e2e8f0] rounded-[12px] focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20 transition-all"
                        placeholder="e.g., 500"
                      />
                    </div>
                    <p className="text-xs text-[#64748b] mt-1.5">Enter the monthly fee amount for calculation</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1e293b] mb-2">Advance Start Date *</label>
                    <input
                      type="date"
                      value={advanceStartDate}
                      onChange={(e) => setAdvanceStartDate(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-[#e2e8f0] rounded-[12px] focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20 transition-all"
                    />
                    <p className="text-xs text-[#64748b] mt-1.5">When should the advance payment validity start?</p>
                  </div>
                </div>

                {/* Preview with Calculation */}
                {advanceMonthlyFee && parseFloat(advanceMonthlyFee) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#fef08a] to-[#fef3c7] rounded-[16px] p-4 border-2 border-[#fcd34d]"
                  >
                    <p className="text-xs font-bold text-[#92400e] uppercase tracking-wide mb-3">Advance Calculation</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-[#1e293b]">Payment Amount:</span>
                        <span className="text-sm font-bold text-[#22c55e]">₹{markAdvancePayment.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-[#1e293b]">Monthly Fee:</span>
                        <span className="text-sm font-bold text-[#2F4FD7]">₹{parseFloat(advanceMonthlyFee).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-[#fcd34d] pt-2 flex justify-between items-center">
                        <span className="text-sm font-bold text-[#1e293b]">Months Covered:</span>
                        <span className="px-3 py-1 bg-[#92400e] text-white text-sm font-bold rounded-lg">
                          {Math.floor(markAdvancePayment.amount / parseFloat(advanceMonthlyFee))} months
                        </span>
                      </div>
                      {advanceStartDate && (
                        <div className="flex justify-between items-center pt-2 border-t border-[#fcd34d]">
                          <span className="text-sm font-semibold text-[#1e293b]">Valid Until:</span>
                          <span className="text-sm font-bold text-[#22c55e]">
                            {new Date(advanceStartDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {' + '}
                            {Math.floor(markAdvancePayment.amount / parseFloat(advanceMonthlyFee))} months
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-3 bg-[#fef3c7] rounded-lg border border-[#fcd34d]">
                      <p className="text-xs text-[#92400e]">
                        ℹ️ <span className="font-semibold">Note:</span> Payment amount will cover {Math.floor(markAdvancePayment.amount / parseFloat(advanceMonthlyFee))} months of fees from the selected start date.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
                  <button
                    onClick={handleMarkAsAdvance}
                    disabled={isMarkingAdvance || !advanceMonthlyFee || !advanceStartDate}
                    className="flex-1 py-3.5 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white font-bold rounded-[14px] hover:shadow-lg hover:from-[#d97706] hover:to-[#b45309] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={18} />
                    {isMarkingAdvance ? 'Processing...' : 'Mark as Advance'}
                  </button>
                  <button
                    onClick={closeMarkAdvanceModal}
                    className="flex-1 py-3.5 bg-white border border-[#e2e8f0] text-[#1e293b] font-bold rounded-[14px] hover:bg-[#f8fafc] transition-all"
                  >
                    Cancel
                  </button>
                </div>

                {/* Info Message */}
                <div className="bg-[#fef3c7] rounded-[12px] p-3.5 border border-[#fcd34d]">
                  <p className="text-xs text-[#92400e] leading-relaxed">
                    ℹ️ <span className="font-semibold">Auto-Tracking:</span> The system will automatically calculate and track when this advance payment expires. The student's status will automatically change from Valid → Expiring Soon → Expired.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Fee Collection Payment Dashboard Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              if (!successPayment) {
                setSelectedStudent(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#F5F7FB] rounded-[24px] w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* SUCCESS VIEW - Detailed Fee Receipt */}
              {successPayment && (
                <>
                  {/* Success Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-8 py-6 flex items-center justify-between rounded-t-[24px]">
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 size={32} className="text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                        <p className="text-green-100 text-sm mt-1">Fee collection completed successfully</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSuccessPayment(null);
                        setSelectedStudent(null);
                        setDiscount('');
                      }}
                      className="p-2.5 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                    >
                      <X size={24} className="text-white" />
                    </button>
                  </div>

                  <div className="p-8">
                    {/* Receipt Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                      
                      {/* Left: Student & Payment Summary */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1 space-y-5"
                      >
                        {/* Student Card */}
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#e2e8f0]/60">
                          <div className="text-center mb-4">
                            {renderStudentAvatar(
                              successPayment.studentName,
                              selectedStudent?.photo,
                              'w-16 h-16 mx-auto shadow-md',
                              'text-xl',
                              'rounded-[14px]',
                            )}
                            <h3 className="text-base font-bold text-[#1e293b] mt-3">{successPayment.studentName}</h3>
                            <p className="text-xs text-[#64748b]">{successPayment.studentId}</p>
                          </div>
                          <div className="bg-[#f8fafc] rounded-[12px] p-3 text-center">
                            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Course</p>
                            <p className="text-sm font-bold text-[#1e293b]">{successPayment.course}</p>
                          </div>
                        </div>

                        {/* Receipt ID Card */}
                        <div className="bg-gradient-to-br from-[#2F4FD7] to-[#1e40af] rounded-[20px] p-6 shadow-sm border border-[#2F4FD7]/30 text-white">
                          <p className="text-xs font-semibold uppercase tracking-widest opacity-90 mb-2">Receipt ID</p>
                          <p className="text-2xl font-bold font-mono mb-4">{successPayment.id}</p>
                          <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between">
                              <span className="opacity-90">Date:</span>
                              <span className="font-semibold">{successPayment.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="opacity-90">Time:</span>
                              <span className="font-semibold">{new Date().toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Right: Payment Details */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 bg-white rounded-[20px] p-6 shadow-sm border border-[#e2e8f0]/60"
                      >
                        <h3 className="text-lg font-bold text-[#1e293b] mb-6">Payment Details</h3>
                        
                        <div className="space-y-4 mb-6 pb-6 border-b border-[#e2e8f0]">
                          {/* Amount Paid */}
                          <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-[14px]">
                            <span className="text-sm font-semibold text-[#64748b]">Amount Paid</span>
                            <span className="text-2xl font-bold text-[#22c55e]">₹{successPayment.amount.toLocaleString()}</span>
                          </div>

                          {(successPayment.discountAmount || 0) > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex items-center justify-between p-4 bg-[#fff7ed] rounded-[14px]">
                                <span className="text-sm font-semibold text-[#9a3412]">Discount</span>
                                <span className="text-xl font-bold text-[#ea580c]">₹{(successPayment.discountAmount || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-[#eff6ff] rounded-[14px]">
                                <span className="text-sm font-semibold text-[#1e3a8a]">Final Payment</span>
                                <span className="text-xl font-bold text-[#2F4FD7]">
                                  ₹{(successPayment.amount - (successPayment.discountAmount || 0)).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Payment Info Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-[#f8fafc] rounded-[14px]">
                              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1.5">For Period</p>
                              <p className="text-sm font-bold text-[#1e293b]">{successPayment.month}</p>
                            </div>
                            <div className="p-4 bg-[#f8fafc] rounded-[14px]">
                              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1.5">Payment Mode</p>
                              <p className="text-sm font-bold text-[#2F4FD7]">{successPayment.paymentMode?.toUpperCase()}</p>
                            </div>
                            <div className="p-4 bg-[#f8fafc] rounded-[14px]">
                              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1.5">Seat Number</p>
                              <p className="text-sm font-bold text-[#1e293b]">{successPayment.seatNumber}</p>
                            </div>
                            <div className="p-4 bg-[#f8fafc] rounded-[14px]">
                              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1.5">Joining Date</p>
                              <p className="text-sm font-bold text-[#1e293b]">{formatJoiningDate(successPayment.joiningDate)}</p>
                            </div>
                            <div className="p-4 bg-[#f8fafc] rounded-[14px]">
                              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1.5">Father Name</p>
                              <p className="text-sm font-bold text-[#1e293b]">{successPayment.fatherName || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Notes */}
                          {successPayment.notes && (
                            <div className="p-4 bg-[#eff6ff] rounded-[14px] border border-[#bfdbfe]">
                              <p className="text-xs font-semibold text-[#1e40af] uppercase tracking-wide mb-1.5">Notes</p>
                              <p className="text-sm text-[#1e40af]">{successPayment.notes}</p>
                            </div>
                          )}

                          {/* Payment Validity Section */}
                          {loadingFeeDetails ? (
                            <div className="p-4 bg-[#f8fafc] rounded-[14px] animate-pulse">
                              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1.5">Payment Validity</p>
                              <p className="text-sm text-[#64748b]">Loading...</p>
                            </div>
                          ) : receiptFeeDetails?.validUntilDate ? (
                            <div className="p-4 bg-gradient-to-br from-[#fef08a] to-[#fef3c7] rounded-[14px] border-2 border-[#fcd34d]">
                              <p className="text-xs font-semibold text-[#92400e] uppercase tracking-wide mb-3">Payment Validity</p>
                              <div className="space-y-2.5">
                                {/* Months Covered */}
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-[#1e293b]">Total Months Covered:</span>
                                  <span className="px-2.5 py-1 bg-[#92400e] text-white text-xs font-bold rounded-md">
                                    {receiptFeeDetails.monthsCovered || 0} months
                                  </span>
                                </div>

                                {/* Validity Period */}
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-[#1e293b]">Validity Period:</span>
                                  <span className="text-sm font-bold text-[#1e293b]">
                                    {formatJoiningDate(successPayment.joiningDate)} to {formatJoiningDate(receiptFeeDetails.validUntilDate)}
                                  </span>
                                </div>

                                {receiptFeeDetails.advanceMonths > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[#1e293b]">Advance Balance:</span>
                                    <span className="text-sm font-bold text-[#166534]">
                                      {receiptFeeDetails.advanceMonths} months paid ahead
                                    </span>
                                  </div>
                                )}

                                {/* Status Badge */}
                                <div className="flex items-center justify-between pt-2 border-t border-[#fcd34d]">
                                  <span className="text-sm font-semibold text-[#1e293b]">Status:</span>
                                  {receiptFeeDetails.validUntilDate && (() => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const validUntil = new Date(receiptFeeDetails.validUntilDate);
                                    validUntil.setHours(0, 0, 0, 0);
                                    const daysRemaining = receiptFeeDetails.rawDaysRemaining ?? Math.floor((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                                    if (daysRemaining < 0) {
                                      return (
                                        <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md border border-red-300">
                                          Expired on {formatJoiningDate(receiptFeeDetails.validUntilDate)}
                                        </span>
                                      );
                                    } else if (daysRemaining <= 15) {
                                      return (
                                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-md border border-yellow-300">
                                          Expiring soon: {daysRemaining} days left
                                        </span>
                                      );
                                    } else {
                                      return (
                                        <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-md border border-green-300">
                                          Valid until {formatJoiningDate(receiptFeeDetails.validUntilDate)}
                                        </span>
                                      );
                                    }
                                  })()}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-3">Contact Information</p>
                          <div className="flex items-center gap-2 p-3 bg-[#f8fafc] rounded-[10px]">
                            <span className="text-xs font-semibold text-[#64748b]">Mobile:</span>
                            <span className="text-sm font-bold text-[#1e293b]">{successPayment.studentMobile || 'N/A'}</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                          try {
                            await generateReceiptPDF(successPayment, getDefaultReceiptLogo());
                            showNotification('Receipt downloaded successfully!');
                          } catch (err) {
                            console.error('Receipt download error:', err);
                            showNotification('Failed to download receipt.', 'error');
                          }
                        }}
                        className="py-3.5 px-4 bg-[#2F4FD7] text-white font-bold rounded-[12px] hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard size={18} />
                        <span>Download Receipt</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSuccessPayment(null);
                          setSelectedStudent(null);
                          setDiscount('');
                        }}
                        className="py-3.5 px-4 bg-[#22c55e] text-white font-bold rounded-[12px] hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={18} />
                        <span>Done</span>
                      </motion.button>
                    </motion.div>
                  </div>
                </>
              )}

              {/* PAYMENT FORM VIEW - Show if not successful yet */}
              {!successPayment && (
                <>
                  {/* Header Bar */}
                  <div className="sticky top-0 bg-white border-b border-[#e2e8f0] px-8 py-4 flex items-center justify-between rounded-t-[24px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2F4FD7] to-[#1e40af] rounded-lg flex items-center justify-center">
                        <Wallet className="text-white" size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#1e293b]">Collect Fees</h2>
                        <p className="text-xs text-[#64748b]">Fee Collection Admin Dashboard</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="p-2.5 hover:bg-[#f1f5f9] rounded-lg transition-all duration-200 group"
                    >
                      <X size={24} className="text-[#64748b] group-hover:text-[#1e293b]" />
                    </button>
                  </div>

                  <div className="p-8">
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  
                  {/* ============================================
                      STUDENT DETAILS CARD (LEFT)
                      ============================================ */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1 bg-white rounded-[20px] p-6 shadow-sm border border-[#e2e8f0]/60 hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Student Header with Avatar */}
                    <div className="text-center mb-6 pt-2">
                      <div className="relative inline-block">
                        {renderStudentAvatar(
                          selectedStudent.name,
                          selectedStudent.photo,
                          'w-20 h-20 rounded-[16px] mx-auto shadow-lg',
                          'text-2xl',
                        )}
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#22c55e] rounded-full border-2 border-white shadow-md flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-[#1e293b] mt-4">{selectedStudent.name}</h3>
                      <p className="text-sm text-[#64748b]">{selectedStudent.studentId}</p>
                    </div>

                    {/* Student Info Grid */}
                    <div className="space-y-4 mb-6 pb-6 border-b border-[#e2e8f0]">
                      <div className="bg-[#f8fafc] rounded-[12px] p-3.5">
                        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Joining Date</p>
                        <p className="text-sm font-bold text-[#1e293b]">
                          {formatJoiningDate(selectedStudent.joiningDate)}
                        </p>
                      </div>
                      <div className="bg-[#f8fafc] rounded-[12px] p-3.5">
                        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Monthly Fee</p>
                        <p className="text-sm font-bold text-[#2F4FD7]">₹{selectedStudent.monthlyFee}</p>
                      </div>
                      <div className="bg-[#f8fafc] rounded-[12px] p-3.5">
                        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Mobile Number</p>
                        <p className="text-sm font-bold text-[#1e293b]">
                          {formatMobileDisplay(selectedStudent.contact)}
                        </p>
                      </div>
                      <div className="bg-[#f8fafc] rounded-[12px] p-3.5">
                        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Father Name</p>
                        <p className="text-sm font-bold text-[#1e293b]">{selectedStudent.fatherName || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Shift-wise Validity */}
                    <div>
                      <p className="text-xs font-bold text-[#1e293b] uppercase tracking-wide mb-3">Shift-wise Validity</p>
                      <div className="bg-gradient-to-br from-[#fef2f2] to-[#fef5f5] rounded-[14px] p-4 border border-[#fee2e2]">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#64748b]">Shift</span>
                            <span className="text-sm font-bold text-[#1e293b]">
                              {getTimeShiftLabel(selectedStudent.timeShift, selectedStudent.customShiftHours)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#64748b]">Fee Amount</span>
                            <span className="text-sm font-bold text-[#2F4FD7]">₹{selectedStudent.monthlyFee}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#64748b]">Join Date</span>
                            <span className="text-sm font-bold text-[#1e293b]">
                              {formatJoiningDate(selectedStudent.joiningDate)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#64748b]">Seat Number</span>
                            <span className="text-sm font-bold text-[#1e293b]">{selectedStudent.seat}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-[#fecaca]">
                            <span className="text-xs font-bold text-[#1e293b]">Total Due</span>
                            <div className="flex items-center gap-1.5">
                              {(selectedStudent.overdueMonths ?? 0) > 0 && (
                                <span className="px-2 py-0.5 bg-[#ef4444] text-white text-xs font-bold rounded-full">
                                  {(selectedStudent.overdueMonths ?? 0) > 1
                                    ? `${selectedStudent.overdueMonths} MONTHS`
                                    : 'DUE'}
                                </span>
                              )}
                              <span className="text-sm font-bold text-[#ef4444]">
                                ₹{selectedStudent.feeDue.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* ============================================
                      COLLECT FEES PANEL (RIGHT)
                      ============================================ */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white rounded-[20px] p-7 shadow-sm border border-[#e2e8f0]/60"
                  >
                    {/* Panel Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2F4FD7] to-[#1e40af] rounded-lg flex items-center justify-center">
                        <CreditCard className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1e293b]">Collect Fees</h3>
                        <p className="text-sm text-[#ef4444] font-semibold">
                          Due Amount: ₹<span className="text-lg">{selectedStudent.feeDue.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* Admission Fee Checkbox */}
                    
                      {/* Payment Amount */}
                      <div>
                        <label className="block text-sm font-bold text-[#1e293b] mb-3 flex items-center gap-2">
                          <IndianRupee size={16} className="text-[#2F4FD7]" />
                          Pay Amount <span className="text-[#ef4444]">*</span>
                        </label>
                        <input
                          type="text"
                          value={payAmount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^[0-9]*$/.test(value)) {
                              setPayAmount(value);
                            }
                          }}
                          placeholder="Enter amount"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          spellCheck="false"
                          className="w-full px-4 py-3.5 border-2 border-[#e2e8f0] rounded-[12px] focus:outline-none focus:border-[#2F4FD7] focus:ring-2 focus:ring-[#2F4FD7]/20 transition-all text-lg font-semibold"
                        />
                        <p className="text-xs text-[#64748b] mt-2">Enter the amount to collect. Can be more than due if marking as advance.</p>
                      </div>

                      {/* Select Period Start Date */}
                      <div>
                        <label className="block text-sm font-bold text-[#1e293b] mb-3 flex items-center gap-2">
                          📅 Payment Date <span className="text-[#ef4444]">*</span>
                        </label>
                        <input
                          type="date"
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-[#e2e8f0] rounded-[12px] focus:outline-none focus:border-[#2F4FD7] focus:ring-2 focus:ring-[#2F4FD7]/20 transition-all bg-white font-medium"
                        />
                        <p className="text-xs text-[#64748b] mt-2">
                          Choose the period start date. It will be recorded as a 30-day due period.
                        </p>
                      </div>

                      {/* Discount */}
                      <div>
                        <label className="block text-sm font-bold text-[#1e293b] mb-3">Discount (Optional)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={discount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d+$/.test(value)) setDiscount(value);
                          }}
                          placeholder="Enter discount amount"
                          className="w-full px-4 py-3.5 border-2 border-[#e2e8f0] rounded-[12px] focus:outline-none focus:border-[#2F4FD7] focus:ring-2 focus:ring-[#2F4FD7]/20 transition-all"
                        />
                        <p className="text-xs text-[#64748b] mt-2">
                          Fee credit = Pay amount (reduces pending balance). Final cash = Pay amount - Discount.
                        </p>
                        {payAmount && (() => {
                          const payValue = parseFloat(payAmount) || 0;
                          const discountValue = parseFloat(discount) || 0;
                          const finalPayment = payValue - discountValue;
                          const isInvalidDiscount = discountValue > payValue;

                          return (
                            <div className={`mt-3 rounded-[12px] border px-4 py-3 ${
                              isInvalidDiscount
                                ? 'border-[#fecaca] bg-[#fef2f2]'
                                : 'border-[#bfdbfe] bg-[#eff6ff]'
                            }`}>
                              <div className="flex items-center justify-between gap-4">
                                <span className={`text-sm font-bold ${
                                  isInvalidDiscount ? 'text-[#b91c1c]' : 'text-[#1e3a8a]'
                                }`}>
                                  Final payment
                                </span>
                                <span className={`text-lg font-extrabold ${
                                  isInvalidDiscount ? 'text-[#b91c1c]' : 'text-[#2F4FD7]'
                                }`}>
                                  ₹{Math.max(0, finalPayment).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <p className={`mt-1 text-xs ${
                                isInvalidDiscount ? 'text-[#b91c1c]' : 'text-[#475569]'
                              }`}>
                                Pay amount ₹{payValue.toLocaleString('en-IN')} reduces pending balance. Final cash: ₹{Math.max(0, finalPayment).toLocaleString('en-IN')}.
                              </p>
                              {isInvalidDiscount && (
                                <p className="mt-1 text-xs font-semibold text-[#b91c1c]">
                                  Discount cannot be more than the pay amount.
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-bold text-[#1e293b] mb-3 flex items-center gap-2">
                          <CreditCard size={16} className="text-[#2F4FD7]" />
                          Payment Method <span className="text-[#ef4444]">*</span>
                        </label>
                        <select
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-[#e2e8f0] rounded-[12px] focus:outline-none focus:border-[#2F4FD7] focus:ring-2 focus:ring-[#2F4FD7]/20 transition-all bg-white font-medium"
                        >
                          <option value="cash">Cash</option>
                          <option value="upi">UPI/QR</option>
                          <option value="card">Card</option>
                          
                          
                        </select>
                      </div>

                      {/* Mark as Advance Checkbox */}
                      <div className="bg-[#eff6ff] border-2 border-[#bfdbfe] rounded-[12px] p-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={markAsAdvanceDuringCollection}
                            onChange={(e) => setMarkAsAdvanceDuringCollection(e.target.checked)}
                            className="w-5 h-5 rounded border-2 border-[#2F4FD7] cursor-pointer accent-[#2F4FD7]"
                          />
                          <div>
                            <p className="text-sm font-bold text-[#1e293b]">Mark as Advance Payment</p>
                            <p className="text-xs text-[#64748b]">Student is paying for multiple months in advance</p>
                          </div>
                        </label>

                        {/* Advance Preview */}
                        {markAsAdvanceDuringCollection && payAmount && parseFloat(payAmount) > 0 && (() => {
                          const totalPayment = parseFloat(payAmount) || 0;
                          const feeCredit = Math.max(0, totalPayment);
                          const advanceAmount = Math.max(0, feeCredit - selectedStudent.feeDue);
                          const advanceMonths = selectedStudent.monthlyFee > 0
                            ? Math.floor(advanceAmount / selectedStudent.monthlyFee)
                            : 0;

                          return (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 p-4 bg-gradient-to-br from-[#fef08a] to-[#fef3c7] rounded-[12px] border-2 border-[#fcd34d]"
                            >
                              <p className="text-xs font-bold text-[#92400e] uppercase tracking-wide mb-3">Advance Preview</p>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-[#1e293b]">Total Payment:</span>
                                  <span className="text-sm font-bold text-[#22c55e]">₹{totalPayment.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-[#1e293b]">Current Due:</span>
                                  <span className="text-sm font-bold text-[#ef4444]">₹{selectedStudent.feeDue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-[#1e293b]">Advance Amount:</span>
                                  <span className="text-sm font-bold text-[#22c55e]">₹{advanceAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-[#1e293b]">Monthly Fee:</span>
                                  <span className="text-sm font-bold text-[#2F4FD7]">₹{selectedStudent.monthlyFee.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-[#fcd34d] pt-2 flex justify-between items-center">
                                  <span className="text-sm font-bold text-[#1e293b]">Advance Months:</span>
                                  <span className="px-3 py-1 bg-[#92400e] text-white text-sm font-bold rounded-lg">
                                    {advanceMonths} month{advanceMonths !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })()}
                      </div>

                      {/* Transaction Note */}
                      <div>
                        <label className="block text-sm font-bold text-[#1e293b] mb-3">Transaction Note (Optional)</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any notes about this transaction..."
                          rows={3}
                          className="w-full px-4 py-3.5 border-2 border-[#e2e8f0] rounded-[12px] focus:outline-none focus:border-[#2F4FD7] focus:ring-2 focus:ring-[#2F4FD7]/20 transition-all resize-none font-medium"
                        />
                        <p className="text-xs text-[#64748b] mt-2">
                          Notes will be printed on the payment receipt.
                        </p>
                      </div>

                      {/* CTA Button */}
                      <motion.button
                        onClick={handlePay}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-gradient-to-r from-[#2F4FD7] to-[#1e40af] text-white font-bold rounded-[14px] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 group"
                      >
                        <CreditCard size={20} className="group-hover:animate-pulse" />
                        <span>Collect Payment</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                {/* ============================================
                    TRANSACTION HISTORY TABLE (this student only)
                    ============================================ */}
                {(() => {
                  // Payments for this student only, sorted newest first
                  const studentPaymentHistory = payments
                    .filter((p) => p.studentId === selectedStudent.studentId)
                    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

                  const displayHistory = studentPaymentHistory;

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-[20px] p-7 shadow-sm border border-[#e2e8f0]/60"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#dbeafe] rounded-lg flex items-center justify-center">
                            <CreditCard className="text-[#2F4FD7]" size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[#1e293b]">Transaction History</h3>
                            <p className="text-xs text-[#64748b]">{selectedStudent.name} — {displayHistory.length} payment{displayHistory.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ rotate: 180 }}
                          transition={{ duration: 0.5 }}
                          onClick={loadData}
                          className="p-2.5 hover:bg-[#f1f5f9] rounded-lg transition-colors"
                        >
                          <RefreshCw size={20} className="text-[#64748b]" />
                        </motion.button>
                      </div>

                      {/* Transaction Table */}
                      {displayHistory.length > 0 ? (
                        <div className="table-scroll">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#e2e8f0]">
                                <th className="text-left pb-4 text-xs font-bold text-[#64748b] uppercase tracking-wide">Payment Date</th>
                                <th className="text-left pb-4 text-xs font-bold text-[#64748b] uppercase tracking-wide">For Month</th>
                                <th className="text-left pb-4 text-xs font-bold text-[#64748b] uppercase tracking-wide">Mode</th>
                                <th className="text-left pb-4 text-xs font-bold text-[#64748b] uppercase tracking-wide">Note / Type</th>
                                <th className="text-right pb-4 text-xs font-bold text-[#64748b] uppercase tracking-wide">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayHistory.map((payment, index) => {
                                const admPayment = isAdmissionPayment(payment);
                                return (
                                  <motion.tr
                                    key={payment.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#f8fafc] transition-colors ${
                                      admPayment ? 'bg-[#fffbeb]' : ''
                                    }`}
                                  >
                                    <td className="py-4">
                                      <span className="text-sm font-semibold text-[#1e293b]">{payment.date}</span>
                                    </td>
                                    <td className="py-4">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-sm text-[#64748b]">{payment.month || formatPaymentDate(payment.date) || '—'}</span>
                                      </div>
                                    </td>
                                    <td className="py-4">
                                      <span className="inline-flex items-center px-3 py-1.5 bg-[#dbeafe] text-[#2F4FD7] text-xs font-bold rounded-full uppercase">
                                        {payment.paymentMode || '—'}
                                      </span>
                                    </td>
                                    <td className="py-4">
                                      <div className="flex flex-col gap-1">
                                        {admPayment && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fef3c7] text-[#92400e] text-xs font-bold rounded-full w-fit">
                                            🎓 Admission Time Payment
                                          </span>
                                        )}
                                        {!admPayment && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#dcfce7] text-[#166534] text-xs font-bold rounded-full w-fit">
                                            💳 Due Payment
                                          </span>
                                        )}
                                        {payment.notes && (
                                          <span className="text-xs text-[#64748b]">{payment.notes}</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-4 text-right">
                                      <span className="text-sm font-bold text-[#22c55e]">₹{payment.amount.toLocaleString()}</span>
                                    </td>
                                  </motion.tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f1f5f9] rounded-full mb-4">
                            <CheckCircle2 size={32} className="text-[#94a3b8]" />
                          </div>
                          <p className="text-base font-semibold text-[#1e293b] mb-1">No transactions yet</p>
                          <p className="text-sm text-[#64748b]">Payments for {selectedStudent.name} will appear here</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })()}
              </div>
                  </>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default FeeCollection;

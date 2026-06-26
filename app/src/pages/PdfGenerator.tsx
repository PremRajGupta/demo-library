import { Fragment, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TopHeader from '../components/layout/TopHeader';
import { generateReceiptPDF, getDefaultReceiptLogo } from '../sections/fees/receiptService';
import type { PaymentReceipt } from '../sections/fees/receiptService';
import S from '../lib/strings';
import { getStoredPayments } from '../sections/fees/collectionService';
import { Download, Search, Eye, X, Pencil, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { feeApi, studentApi } from '../lib/apiService';
import { getStudentDisplayId } from '../lib/studentId';
import { formatJoiningDate } from '../lib/formatDate';

interface ReceiptGroup {
  studentId: string;
  studentName: string;
  payments: PaymentReceipt[];
  totalAmount: number;
  lastPaymentDate: string;
}

interface PaymentValidity {
  hasPaymentHistory?: boolean;
  hasAdvancePayment: boolean;
  isAdvancePayment?: boolean;
  monthsCovered?: number;
  advanceMonths?: number;
  validUntilDate?: string;
  advanceStartDate?: string;
  advanceValidUntilDate?: string;
  daysRemaining?: number;
  rawDaysRemaining?: number;
  paymentStatus?: 'valid' | 'expiring-soon' | 'expired' | 'no-payment' | 'no-advance';
}

interface Notification {
  msg: string;
  type: 'success' | 'error';
}

export default function PdfGenerator() {
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [validityData, setValidityData] = useState<Record<string, PaymentValidity>>({});
  const [studentFees, setStudentFees] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterAdvanceOnly, setFilterAdvanceOnly] = useState(false);
  const RECORDS_PER_PAGE = 20;

  const fetchValidityData = async (paymentsList: PaymentReceipt[]) => {
    try {
      const uniqueStudents = [...new Set(paymentsList.map(p => p.studentId))];
      const validity: Record<string, PaymentValidity> = {};

      for (const studentId of uniqueStudents) {
        try {
          const response = await feeApi.getStudentPaymentValidity(studentId);
          validity[studentId] = response;
        } catch (err) {
          console.error(`Error fetching validity for ${studentId}:`, err);
          validity[studentId] = { hasAdvancePayment: false };
        }
      }
      setValidityData(validity);
    } catch (error) {
      console.error('Error fetching validity data:', error);
    }
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const [data, studentsList] = await Promise.all([
          getStoredPayments(),
          studentApi.getStudents().catch(() => [])
        ]);
        setPayments(data);
        
        const feeMap: Record<string, number> = {};
        studentsList.forEach((s: any) => {
          const sid = getStudentDisplayId(s);
          if (sid) {
            feeMap[sid] = Number(s.feeAmount) || 0;
          }
        });
        setStudentFees(feeMap);

        await fetchValidityData(data);
      } catch (error) {
        console.error('Error fetching fees:', error);
      }
    };
    fetchPayments();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [data, studentsList] = await Promise.all([
        getStoredPayments(),
        studentApi.getStudents().catch(() => [])
      ]);
      setPayments(data);
      
      const feeMap: Record<string, number> = {};
      studentsList.forEach((s: any) => {
        const sid = getStudentDisplayId(s);
        if (sid) {
          feeMap[sid] = Number(s.feeAmount) || 0;
        }
      });
      setStudentFees(feeMap);

      await fetchValidityData(data);
      showNotification('Data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showNotification('Failed to refresh data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredPayments = useMemo(
    () => payments.filter((payment) => {
      const normalized = searchTerm.trim().toLowerCase();
      const matchesSearch = !normalized || (
        payment.studentName.toLowerCase().includes(normalized) ||
        payment.studentId.toLowerCase().includes(normalized) ||
        payment.month.toLowerCase().includes(normalized)
      );

      if (filterAdvanceOnly) {
        const validity = validityData[payment.studentId];
        return matchesSearch && (validity?.hasAdvancePayment || validity?.isAdvancePayment);
      }

      return matchesSearch;
    }),
    [payments, searchTerm, filterAdvanceOnly, validityData]
  );

  const groupedPayments = useMemo((): ReceiptGroup[] => {
    const groups: Record<string, ReceiptGroup> = {};
    filteredPayments.forEach((payment) => {
      const key = payment.studentId || payment.studentName || 'unknown';
      if (!groups[key]) {
        groups[key] = {
          studentId: payment.studentId,
          studentName: payment.studentName,
          payments: [],
          totalAmount: 0,
          lastPaymentDate: '',
        };
      }
      groups[key].payments.push(payment);
      groups[key].totalAmount += payment.amount;
      const dateStr = payment.date || '';
      const dateTs = dateStr ? new Date(dateStr).getTime() : 0;
      const currentTs = groups[key].lastPaymentDate ? new Date(groups[key].lastPaymentDate).getTime() : 0;
      if (dateTs > currentTs) {
        groups[key].lastPaymentDate = dateStr;
      }
    });

    // Sort payments within each group newest-first, and then sort groups by newest payment
    const result = Object.values(groups).map((g) => {
      g.payments = g.payments.sort((x, y) => (new Date(y.date || '').getTime() - new Date(x.date || '').getTime()));
      return g;
    });

    result.sort((a, b) => (new Date(b.lastPaymentDate || '').getTime() - new Date(a.lastPaymentDate || '').getTime()));
    return result;
  }, [filteredPayments]);

  const advancePaymentStats = useMemo(() => {
    const stats = {
      activeAdvance: 0,
      totalAdvance: 0,
      validCoverage: 0,
      expiringSoon: 0,
      expired: 0,
    };
    Object.values(validityData).forEach(v => {
      if (!v.hasPaymentHistory) return;

      if (v.paymentStatus === 'expired') {
        stats.expired += 1;
      } else if (v.paymentStatus === 'expiring-soon') {
        stats.expiringSoon += 1;
      } else if (v.paymentStatus === 'valid') {
        stats.validCoverage += 1;
      }

      if (v.hasAdvancePayment || v.isAdvancePayment) {
        stats.totalAdvance += 1;
        if (v.paymentStatus !== 'expired') {
          stats.activeAdvance += 1;
        }
      }
    });
    return stats;
  }, [validityData]);

  // Pagination calculations
  const totalPages = Math.ceil(groupedPayments.length / RECORDS_PER_PAGE);
  const paginatedPayments = useMemo(() => {
    const startIdx = (currentPage - 1) * RECORDS_PER_PAGE;
    const endIdx = startIdx + RECORDS_PER_PAGE;
    return groupedPayments.slice(startIdx, endIdx);
  }, [groupedPayments, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const [selectedGroup, setSelectedGroup] = useState<ReceiptGroup | null>(null);
  const [editPayment, setEditPayment] = useState<PaymentReceipt | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const openGroupView = (group: ReceiptGroup) => setSelectedGroup(group);
  const closeGroupView = () => setSelectedGroup(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getValidityBadge = (studentId: string) => {
    const validity = validityData[studentId];

    if (!validity || !validity.hasPaymentHistory || !validity.validUntilDate) {
      return (
        <div className="text-xs text-slate-500 font-medium">
          No payment coverage
        </div>
      );
    }

    const status = validity.paymentStatus;
    const validUntil = formatJoiningDate(validity.validUntilDate);
    const validFrom = formatJoiningDate(validity.advanceStartDate);
    const advanceValidUntil = validity.advanceValidUntilDate ? formatJoiningDate(validity.advanceValidUntilDate) : validUntil;
    const days = validity.daysRemaining ?? 0;
    const overdueDays = Math.max(1, Math.abs(validity.rawDaysRemaining ?? 0));
    const months = validity.monthsCovered ?? 0;
    const advanceMonths = validity.advanceMonths ?? 0;
    const hasAdvance = Boolean(validity.hasAdvancePayment || validity.isAdvancePayment);

    if (status === 'expired') {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
            <span className="text-xs font-bold text-red-700">Expired on: {validUntil}</span>
          </div>
          <div className="text-xs text-red-600 ml-6">
            {overdueDays} day{overdueDays !== 1 ? 's' : ''} overdue - collect payment
          </div>
          {hasAdvance && validFrom !== '-' && (
            <div className="text-xs text-slate-600 ml-6">Advance paid: {validFrom} - {advanceValidUntil}</div>
          )}
        </div>
      );
    } else if (status === 'expiring-soon') {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-yellow-600 flex-shrink-0" />
            <span className="text-xs font-bold text-yellow-700">Expiring soon: {days} days left</span>
          </div>
          <div className="text-xs text-yellow-600 ml-6">Valid until: {validUntil}</div>
          {hasAdvance && validFrom !== '-' && (
            <div className="text-xs text-slate-600 ml-6">Advance paid: {validFrom} - {advanceValidUntil}</div>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
            <span className="text-xs font-bold text-green-700">Valid until: {validUntil}</span>
          </div>
          <div className="text-xs text-green-600 ml-6">{days} days remaining - {months} month{months !== 1 ? 's' : ''} paid</div>
          {hasAdvance && validFrom !== '-' && (
            <div className="text-xs text-slate-600 ml-6">
              Advance paid: {validFrom} - {advanceValidUntil}
              {advanceMonths > 0 ? ` (${advanceMonths} month${advanceMonths !== 1 ? 's' : ''})` : ''}
            </div>
          )}
        </div>
      );
    }
  };

  const handleDownload = async (payment: PaymentReceipt) => {
    try {
      await generateReceiptPDF(payment, getDefaultReceiptLogo());
      showNotification(S.receiptDownloadSuccess, 'success');
    } catch (error) {
      console.error('Receipt generation failed:', error);
      showNotification(S.receiptDownloadFailed, 'error');
    }
  };

  return (
    <div>
      <TopHeader />

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-3 text-white text-sm font-medium rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
            }`}
          >
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
              <p className="text-sm text-[#64748b]">{S.pdfPageSubtitle}</p>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{S.pdfPageTitle}</h1>
              <p className="text-xs text-yellow-600 mt-1 font-semibold">
                ⚡ {advancePaymentStats.activeAdvance} student{advancePaymentStats.activeAdvance !== 1 ? 's have' : ' has'} active advance payments
              </p>
            </div>
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setFilterAdvanceOnly(!filterAdvanceOnly)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                filterAdvanceOnly
                  ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap size={16} />
              {filterAdvanceOnly ? 'Advance Payments' : 'Show All'}
            </button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm w-full md:w-auto">
              <Search size={16} className="text-slate-500" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={S.searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Advance Payment Stats Cards */}
        {(advancePaymentStats.totalAdvance > 0 || advancePaymentStats.expiringSoon > 0 || advancePaymentStats.expired > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-yellow-600" />
                <p className="text-xs font-semibold text-yellow-700 uppercase">Active Advance</p>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{advancePaymentStats.activeAdvance}</p>
              <p className="text-xs text-yellow-600 mt-1">Students covered beyond current period</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={18} className="text-orange-600" />
                <p className="text-xs font-semibold text-orange-700 uppercase">Expiring Soon</p>
              </div>
              <p className="text-2xl font-bold text-orange-900">{advancePaymentStats.expiringSoon}</p>
              <p className="text-xs text-orange-600 mt-1">Students expiring within 15 days</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={18} className="text-red-600" />
                <p className="text-xs font-semibold text-red-700 uppercase">Expired</p>
              </div>
              <p className="text-2xl font-bold text-red-900">{advancePaymentStats.expired}</p>
              <p className="text-xs text-red-600 mt-1">Students needing renewal</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {selectedGroup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
              onClick={closeGroupView}
            >
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl rounded-2xl bg-white shadow-xl overflow-y-auto max-h-[80vh]"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Payment History — {selectedGroup.studentName}</h3>
                    <p className="text-sm text-slate-500">{selectedGroup.studentId} — {selectedGroup.payments.length} receipts</p>
                  </div>
                  <button onClick={closeGroupView} className="p-2 rounded-md text-slate-600 hover:bg-slate-100">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {selectedGroup.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{payment.month}</p>
                        <p className="text-xs text-slate-500">{payment.date} • {payment.paymentMode || 'Cash'}</p>
                        {payment.notes && <p className="mt-2 text-xs text-slate-600">{payment.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm font-bold text-slate-900">₹{payment.amount.toFixed(2)}</div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(payment)}
                            className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition"
                          >
                            <Download size={14} />
                            Download
                          </button>
                          <button
                            onClick={() => {
                              setEditPayment(payment);
                              setEditAmount(String(payment.amount));
                              // prepare date input value (YYYY-MM-DD) if possible
                              try {
                                setEditDate(new Date(payment.date || '').toISOString().slice(0, 10));
                              } catch {
                                setEditDate('');
                              }
                              setEditNotes(payment.notes || '');
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Edit Payment Modal (inside group view) */}
                <AnimatePresence>
                  {editPayment && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40"
                      onClick={() => setEditPayment(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                          <div>
                            <h3 className="text-lg font-bold">Edit Payment</h3>
                            <p className="text-sm text-slate-500">Modify amount, date or notes</p>
                          </div>
                          <button onClick={() => setEditPayment(null)} className="p-2 rounded-md text-slate-600 hover:bg-slate-100">
                            <X size={20} />
                          </button>
                        </div>
                        <div className="p-6 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-full px-4 py-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full px-4 py-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                            <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full px-4 py-2 border rounded-md" rows={3} />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={async () => {
                                if (!editPayment) return;
                                const amt = parseFloat(editAmount);
                                if (Number.isNaN(amt) || amt < 0) {
                                  showNotification('Enter a valid amount', 'error');
                                  return;
                                }
                                try {
                                  await feeApi.updateFee(editPayment.rawId || editPayment.id, {
                                    amount: amt,
                                    notes: editNotes.trim() || undefined,
                                    date: editDate || undefined,
                                  });
                                  const data = await getStoredPayments();
                                  setPayments(data);
                                  // refresh group view to reflect changes
                                  const updatedGroup = groupedPayments.find(g => g.studentId === selectedGroup?.studentId) || null;
                                  setSelectedGroup(updatedGroup);
                                  setEditPayment(null);
                                  showNotification('Payment updated', 'success');
                                } catch (err) {
                                  console.error('Failed to update payment:', err);
                                  showNotification('Unable to update payment', 'error');
                                }
                              }}
                              className="px-4 py-2 bg-[#2563eb] text-white rounded-md"
                            >
                              Save
                            </button>
                            <button onClick={() => setEditPayment(null)} className="px-4 py-2 border rounded-md">Cancel</button>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="table-scroll overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Monthly Fee</th>
                <th className="px-4 py-3">Total Paid</th>
                <th className="px-4 py-3">Last Payment</th>
                <th className="px-4 py-3">Payment Validity</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    {S.pdfEmpty}
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((group) => (
                  <Fragment key={`group-${group.studentId}`}>
                    <tr className="bg-slate-50">
                      <td className="px-4 py-4 text-slate-900 font-medium">
                        <div className="flex items-center gap-2">
                          <span>{group.studentName}</span>
                          {(validityData[group.studentId]?.hasAdvancePayment || validityData[group.studentId]?.isAdvancePayment) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border border-yellow-300">
                              <Zap size={12} />
                              Advance
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{group.studentId}</td>
                      <td className="px-4 py-4 text-slate-900 font-bold">
                        {studentFees[group.studentId] !== undefined ? `₹${studentFees[group.studentId]}` : 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-slate-900">₹{group.totalAmount.toFixed(2)}</td>
                      <td className="px-4 py-4 text-slate-600">{group.lastPaymentDate}</td>
                      <td className="px-4 py-4">
                        {getValidityBadge(group.studentId)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openGroupView(group)}
                            className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                            {group.payments.length} history items
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* History hidden here; open via View button (modal) */}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {totalPages} • Showing {paginatedPayments.length} of {groupedPayments.length} records
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      page === currentPage
                        ? 'bg-[#2563eb] text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { studentPortalApi } from '../lib/apiService';
import { 
  LogOut, User, Calendar, CreditCard, Clock, Phone, MapPin, 
  CheckCircle, AlertCircle, Receipt, ShieldCheck, Mail,
  MessageCircle, Users, Download, BookOpen, Monitor, MessageSquare, Send
} from 'lucide-react';
import { getInitials, getAvatarColor } from '../sections/students/students';
import { getCourseLabel } from '../lib/courseOptions';
import { formatJoiningDate } from '../lib/formatDate';
import { generateReceiptPDF, getDefaultReceiptLogo } from '../sections/fees/receiptService';
import S from '../lib/strings';
import AppLogo from '../components/AppLogo';
import ChatBot from '../components/ChatBot';

const RUPEE = '\u20B9';
const PAYMENT_UPI_ID = '7488252019@okbizaxis';
const PAYMENT_PAYEE_NAME = 'Galaxy Computer';
const PAYMENT_NOTE = 'Library Fee';
const formatRupee = (amount: number) => `${RUPEE}${amount.toLocaleString('en-IN')}`;

const normalizePaymentAmount = (value: string | number) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? Number(amount.toFixed(2)) : 0;
};

/** Generate a unique transaction reference for every payment attempt */
const generateTransactionRef = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GLX${timestamp}${random}`;
};

const buildUpiPaymentUrl = (amount: number, studentId?: string) => {
  const tr = generateTransactionRef();
  const note = studentId ? `${PAYMENT_NOTE} - ${studentId}` : PAYMENT_NOTE;

  // Only use essential UPI parameters. Remove static QR-specific params (aid, hardcoded tr)
  // that cause "Unable to process" errors in UPI apps.
  const params = new URLSearchParams({
    pa: PAYMENT_UPI_ID,
    pn: PAYMENT_PAYEE_NAME,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note,
    tr: tr,
    mc: '8220',
  });

  const queryString = params.toString();

  return {
    generic: `upi://pay?${queryString}`,
    // App-specific deep links for Android
    phonePe: `phonepe://pay?${queryString}`,
    gpay: `tez://upi/pay?${queryString}`,
    paytm: `paytmmp://upi/pay?${queryString}`,
    // Android intent URLs
    androidIntent: `intent://pay?${queryString}#Intent;scheme=upi;end`,
    androidIntentChooser: `intent://pay?${queryString}#Intent;scheme=upi;action=android.intent.action.VIEW;end`,
    // iOS universal link style
    upiUniversal: `https://upi.google.com/pay?${queryString}`,
    transactionRef: tr,
  };
};

export default function StudentPortal() {
  const { logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'payments' | 'courses' | 'feedback'>('overview');
  const [customPayAmount, setCustomPayAmount] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [paymentError, setPaymentError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await studentPortalApi.getMyDetails();
        setData(res);
      } catch (err: any) {
        console.error('Error fetching student details:', err);
        setError(err.message || 'Failed to load details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleDownloadReceipt = async (fee: any) => {
    const payment = {
      id: fee.receiptNumber || fee._id || 'MIGRATED',
      studentName: data.student.name,
      studentId: data.student.studentId,
      course: getCourseLabel(data.student.course),
      seatNumber: data.student.seatNumber || data.student.seatNumber?.toString(),
      fatherName: data.student.fatherName,
      studentMobile: data.student.mobile,
      joiningDate: data.student.joiningDate,
      amount: fee.amount || 0,
      month: fee.month,
      paymentMode: fee.paymentMode || 'cash',
      date: new Date(fee.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: fee.notes || ''
    };
    await generateReceiptPDF(payment, getDefaultReceiptLogo());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mb-4" />
        <h2 className="text-lg font-semibold text-[#1e293b]">{S.appName} Student Portal</h2>
        <p className="text-sm text-[#64748b] mt-1">Fetching your dashboard...</p>
      </div>
    );
  }

  if (error || !data || !data.student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <AlertCircle className="mx-auto text-red-500 w-12 h-12 mb-4" />
          <h2 className="text-xl font-bold text-[#1e293b] mb-2">Error Loading Portal</h2>
          <p className="text-sm text-[#64748b] mb-6">{error || 'Student details could not be retrieved.'}</p>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-[#1a2b4a] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#2a3b5a] transition-all"
          >
            <LogOut size={16} /> Logout & Re-login
          </button>
        </div>
      </div>
    );
  }

  const { student, fees, validity } = data;
  const paymentHistory = fees || [];
  const seatNumber = student.seatNumber && student.seatNumber !== '--' ? student.seatNumber : 'N/A';
  const shiftText = student.timeShift || 'N/A';

  // Calculate fees status using computed backend dues
  const { dues } = data;
  const pendingAmount = dues?.pendingAmount ?? 0;
  const totalPaidAmount = dues?.paidAmount ?? 0;
  const fallbackPayAmount = pendingAmount > 0 ? pendingAmount : (student.feeAmount || 0);
  const selectedPayAmount = normalizePaymentAmount(customPayAmount !== '' ? customPayAmount : fallbackPayAmount);
  const upiPaymentUrls = selectedPayAmount > 0 ? buildUpiPaymentUrl(selectedPayAmount, student.studentId) : null;

  const isInactive = student.status === 'inactive';
  let feeStatus: 'paid' | 'due' | 'inactive' = 'due';
  let statusColor = 'text-red-600 bg-red-50 border-red-200';
  let statusText = 'Payment Due';

  if (isInactive) {
    feeStatus = 'inactive';
    statusColor = 'text-gray-500 bg-gray-50 border-gray-200';
    statusText = 'Inactive Account';
  } else if (pendingAmount === 0) {
    feeStatus = 'paid';
    statusColor = 'text-[#16a34a] bg-[#f0fdf4] border-[#bbf7d0]';
    statusText = 'Fees Paid';
  }

  // Get last payment date
  const lastPayment = paymentHistory[0]; // array is sorted by date desc

  const handlePaymentClick = () => {
    if (selectedPayAmount <= 0) {
      setPaymentError('Please enter a valid amount greater than 0.');
      return;
    }

    setPaymentError('');

    const userAgent = navigator.userAgent || '';
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isMobile = isAndroid || isIOS || /Mobile/i.test(userAgent);

    if (!isMobile) {
      setPaymentError('Desktop par QR code scan karein phone se payment karne ke liye.');
      return;
    }

    if (!upiPaymentUrls) return;

    // Try app-specific deep links first (more reliable than generic upi://)
    if (isAndroid) {
      // Strategy: try app-specific schemes first, then generic intent
      const tryDeepLink = (url: string, delayMs: number) => {
        setTimeout(() => {
          window.location.href = url;
        }, delayMs);
      };

      // Try PhonePe, GPay, PayTM specific deep links first (0ms)
      // These have higher success rate than generic upi:// on Android
      tryDeepLink(upiPaymentUrls.phonePe, 0);

      // Fallback chain: if app-specific fails, generic intent will be tried by OS
      // We also set a timeout to show fallback UI if nothing opened
      return;
    }

    if (isIOS) {
      // iOS: upi:// works in Safari. In in-app browsers (FB, IG, Telegram),
      // we try window.open first, then location.href fallback.
      const url = upiPaymentUrls.generic;

      // Create a hidden iframe trick for iOS in-app browsers
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);

      // Also try window.open as backup
      setTimeout(() => {
        const w = window.open(url, '_blank');
        if (!w || w.closed || typeof w.closed === 'undefined') {
          window.location.href = url;
        }
      }, 100);

      // Cleanup iframe
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);

      // Show fallback UI if app didn't open
      return;
    }

    // Generic mobile fallback
    window.location.href = upiPaymentUrls.generic;
    setTimeout(() => {
      setPaymentError('Payment could not be completed automatically. Please try again or use the UPI ID.');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] relative overflow-hidden">
      {/* Animated Background Blobs for Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300/30 blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-300/30 blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* Header bar */}
      <header className="bg-[#1a2b4a]/95 backdrop-blur-xl text-white shadow-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <AppLogo size="sm" className="flex-shrink-0 drop-shadow-md" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-black tracking-tight truncate">{S.appName} Student Portal</h1>
              <p className="text-[10px] sm:text-[11px] text-blue-200/80 font-bold uppercase tracking-wider hidden sm:block">Digital Library Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold transition-all border border-white/10 shadow-sm flex-shrink-0"
          >
            <LogOut size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8 relative z-10">
        
        {/* Welcome greeting card (Glassmorphism) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 sm:gap-5 relative z-10">
            {student.photo ? (
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-blue-400 blur-md opacity-30 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                <img 
                  src={student.photo} 
                  alt={student.name} 
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-2 sm:border-4 border-white shadow-xl relative z-10" 
                />
              </div>
            ) : (
              <div className={`w-14 h-14 sm:w-20 sm:h-20 ${getAvatarColor(student.name)} rounded-full flex items-center justify-center text-xl sm:text-3xl text-white font-black border-2 sm:border-4 border-white shadow-xl relative z-10 flex-shrink-0`}>
                {getInitials(student.name)}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-[#0f172a] tracking-tight mb-0.5 sm:mb-1 truncate">Hello, {student.name}! 👋</h2>
              <p className="text-xs sm:text-sm font-semibold text-[#64748b]">Welcome back to your digital dashboard.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative z-10">
            <div className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-bold shadow-sm transition-all ${statusColor}`}>
              {feeStatus === 'paid' ? <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" /> : <AlertCircle size={16} className="sm:w-[18px] sm:h-[18px]" />}
              {statusText}
            </div>
            <div className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-100/50 text-xs sm:text-sm font-black shadow-sm tracking-wide">
              ID: {student.studentId}
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex flex-wrap gap-2 sm:gap-2 bg-white/50 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white shadow-sm mb-6 sm:mb-8 w-full md:w-fit mx-0 justify-center md:justify-start">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'overview' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-[#64748b] hover:bg-white hover:text-[#1e293b]'}`}
          >
            📊 Overview
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'profile' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-[#64748b] hover:bg-white hover:text-[#1e293b]'}`}
          >
            👤 My Profile
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'payments' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-[#64748b] hover:bg-white hover:text-[#1e293b]'}`}
          >
            🧾 Payment History
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'courses' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-[#64748b] hover:bg-white hover:text-[#1e293b]'}`}
          >
            📚 Courses
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'feedback' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-[#64748b] hover:bg-white hover:text-[#1e293b]'}`}
          >
            💬 Feedback
          </button>
        </div>

        {/* Advance Payment Banner */}
        {validity?.hasAdvancePayment && activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_10px_30px_rgba(16,185,129,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="flex items-start gap-3 sm:gap-4 relative z-10">
              <span className="p-2 sm:p-3 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl mt-0.5 sm:mt-0 border border-white/20 flex-shrink-0">
                <ShieldCheck size={24} className="sm:w-[28px] sm:h-[28px] animate-pulse" />
              </span>
              <div>
                <h4 className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight">Advance Payment Active ⚡</h4>
                <p className="text-xs sm:text-sm text-emerald-50 font-medium mt-1">
                  You have paid fees for <span className="font-black bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-md">{validity.monthsCovered} Month{validity.monthsCovered !== 1 ? 's' : ''}</span> in advance. 
                  Your membership validity is fully secure.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end justify-center relative z-10 bg-black/10 backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10">
              <span className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
                {validity.daysRemaining} Days Left
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-100 mt-1 uppercase tracking-wider">
                Valid until {new Date(validity.validUntilDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </motion.div>
        )}

        {/* -------------------- TAB 1: OVERVIEW -------------------- */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4 sm:gap-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Seat details card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-bold text-sm sm:text-base text-[#1e293b]">Seat Assignment</h3>
                    <span className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-50 to-indigo-50 text-[#3b82f6] rounded-lg sm:rounded-xl shadow-sm"><Clock size={18} className="sm:w-5 sm:h-5" /></span>
                  </div>
                  <div className="my-4 sm:my-6 text-center">
                    <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-2 sm:mb-3">Your Assigned Seat</p>
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full bg-gradient-to-br from-[#ffffff] to-[#f8fafc] border-4 sm:border-[6px] border-[#eff6ff] shadow-[0_10px_40px_-10px_rgba(59,130,246,0.2)] flex items-center justify-center relative group transition-all duration-300 hover:shadow-[0_10px_40px_-5px_rgba(59,130,246,0.3)] hover:scale-105 cursor-default">
                      <div className="absolute inset-0 rounded-full border border-blue-200/50 scale-[1.15] opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-out"></div>
                      <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#0f172a] to-[#3b82f6] tracking-tight">
                        {seatNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100/80 pt-3 sm:pt-4 space-y-2 relative z-10">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-[#64748b] font-semibold">Time Shift:</span>
                    <span className="font-bold text-[#1e293b] bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-xs sm:text-sm">{getCourseLabel(shiftText)}</span>
                  </div>
                  {student.customShiftHours && (
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[#64748b] font-semibold">Duration:</span>
                      <span className="font-bold text-[#1e293b] bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-xs sm:text-sm">{student.customShiftHours} Hours</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Fee details card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white p-4 sm:p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-bold text-sm sm:text-base text-[#1e293b]">Fee Details</h3>
                    <span className="p-1.5 sm:p-2 bg-[#f0fdf4] text-[#16a34a] rounded-lg sm:rounded-xl"><CreditCard size={18} className="sm:w-5 sm:h-5" /></span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 my-3 sm:my-4">
                    <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100">
                      <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-wide mb-1">Monthly Fee</p>
                      <p className="text-base sm:text-lg font-black text-[#1e293b] tracking-tight">{formatRupee(student.feeAmount || 0)}</p>
                    </div>
                    <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100">
                      <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-wide mb-1">Valid Upto</p>
                      <p className="text-xs sm:text-sm font-bold text-[#1e293b] truncate">
                        {validity?.validUntilDate 
                          ? new Date(validity.validUntilDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : lastPayment?.validUntilDate 
                            ? new Date(lastPayment.validUntilDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-green-50/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-green-100/50 text-[#16a34a]">
                      <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide mb-1">Total Paid</p>
                      <p className="text-base sm:text-lg font-black tracking-tight">{formatRupee(totalPaidAmount)}</p>
                    </div>
                    <div className={`${pendingAmount > 0 ? 'bg-red-50/80 border-red-100/50 text-red-700' : 'bg-slate-50/80 border-slate-100 text-[#1e293b]'} p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border`}>
                      <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wide mb-1 ${pendingAmount > 0 ? 'text-red-700' : 'text-[#94a3b8]'}`}>Payment Due</p>
                      <p className="text-base sm:text-lg font-black tracking-tight">{formatRupee(pendingAmount)}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100/80 pt-3 sm:pt-4 space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#64748b] font-semibold">Payment Mode:</span>
                    <span className="font-bold text-[#1e293b] capitalize">{student.paymentMode || 'Cash'}</span>
                  </div>
                  {validity?.hasAdvancePayment ? (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[#64748b] font-semibold">Advance Covered:</span>
                      <span className="font-black text-[#3b82f6]">
                        {validity.advanceMonths} Month{validity.advanceMonths !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ) : lastPayment?.isAdvancePayment && lastPayment?.monthsCovered && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[#64748b] font-semibold">Advance Covered:</span>
                      <span className="font-black text-[#3b82f6]">
                        {lastPayment.monthsCovered} Month{lastPayment.monthsCovered !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Support card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white p-4 sm:p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="font-bold text-sm sm:text-base text-[#1e293b]">Help & Support</h3>
                    <span className="p-1.5 sm:p-2 bg-purple-50 text-purple-600 rounded-lg sm:rounded-xl"><ShieldCheck size={18} className="sm:w-5 sm:h-5" /></span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-[#64748b] mb-2 sm:mb-3 leading-relaxed">
                    Need help with seat transfer, shifts, or fee corrections? Contact the admin below.
                  </p>
                  <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mb-3 sm:mb-4 shadow-sm">
                    <p className="text-[10px] sm:text-xs text-emerald-800 font-medium leading-snug">
                      <strong className="text-emerald-900 block mb-1 text-xs">📢 Stay Updated!</strong>
                      Join our WhatsApp group for <span className="font-bold">Daily Newspapers</span>, <span className="font-bold">Magazines</span>, Holiday Notices, and special Offers.
                    </p>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3 pt-2">
                  <a 
                    href="https://chat.whatsapp.com/GEryQDQLa1QJLTSZ55nq7W" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#25d366] to-[#1da851] hover:shadow-[0_5px_15px_rgba(37,211,102,0.3)] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                  >
                    <Users size={16} className="sm:w-[18px] sm:h-[18px]" /> Join WhatsApp Group
                  </a>
                  <div className="grid grid-cols-2 gap-2">
                    <a 
                      href="tel:7488252019" 
                      className="py-2 sm:py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-[#1e293b] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Phone size={12} className="sm:w-[14px] sm:h-[14px] text-blue-600" /> Call Admin
                    </a>
                    <a 
                      href="https://wa.me/917488252019" 
                      target="_blank" 
                      rel="noreferrer"
                      className="py-2 sm:py-2.5 bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/20 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-[#075e54] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <MessageCircle size={12} className="sm:w-[14px] sm:h-[14px] text-[#25d366]" /> Chat
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Payment QR Code Card */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-gradient-to-r from-[#673ab7] to-[#512da8] rounded-2xl sm:rounded-3xl shadow-lg border border-[#512da8] p-1.5 sm:p-2 flex flex-col lg:flex-row gap-2 relative overflow-hidden items-stretch mt-6"
            >
              {/* QR Code Left Side */}
              <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center w-full lg:min-w-[280px] lg:w-auto">
                 <div className="text-center mb-3 sm:mb-4 flex items-center justify-center gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#673ab7] rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm">पे</div>
                  <span className="font-black text-[#512da8] text-lg sm:text-xl tracking-wide drop-shadow-sm">Google Pay</span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Scan & Pay</p>
                <div className="bg-white p-2 sm:p-3 border-2 border-gray-100 rounded-xl sm:rounded-2xl shadow-sm mb-2 sm:mb-3">
                  <img src="/qr-code.png" alt="Payment QR" className="w-36 h-36 sm:w-48 sm:h-48 lg:w-52 lg:h-52 object-contain" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold mb-1 tracking-wide">UPI ID : 7488252019@okbizaxis</p>
                <div className="flex justify-center items-center gap-2 my-1">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3 sm:h-4" />
                </div>
              </div>

              {/* Center and Right Side Container */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 text-white">
                
                {/* Center Column: Form & Payment */}
                <div className="flex flex-col justify-center">
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-black mb-1 sm:mb-2">Galaxy Computer</h3>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed">Scan the QR code or use the deep link to pay instantly using any UPI application.</p>
                  </div>

                  <div className="mb-3 sm:mb-4 w-full">
                    <label className="text-[10px] sm:text-[11px] text-white/70 font-bold uppercase tracking-widest mb-1 sm:mb-1.5 block">Enter Amount to Pay (₹)</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder={`e.g. ${pendingAmount > 0 ? pendingAmount : (student.feeAmount || 0)}`}
                      value={customPayAmount}
                      onChange={(e) => {
                        setCustomPayAmount(e.target.value);
                        setPaymentError('');
                      }}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#512da8] transition-all font-black appearance-none text-sm sm:text-base mb-4 shadow-inner"
                    />
                    
                    <label className="text-[10px] sm:text-[11px] text-white/70 font-bold uppercase tracking-widest mb-1 sm:mb-1.5 block">UTR / Transaction Reference No. (12-Digit)</label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789012"
                      maxLength={20}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#512da8] transition-all font-black text-sm sm:text-base mb-2 shadow-inner"
                    />
                    
                    {paymentError && (
                      <p className="mt-2 text-xs font-bold text-amber-100">{paymentError}</p>
                    )}
                  </div>

                  <div className="w-full space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                      <button
                        type="button"
                        onClick={handlePaymentClick}
                        disabled={selectedPayAmount <= 0}
                        className={`flex-1 py-3 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all transform ${selectedPayAmount > 0 ? 'bg-white text-[#512da8] hover:shadow-[0_5px_20px_rgba(255,255,255,0.4)] hover:-translate-y-0.5' : 'bg-white/50 text-[#512da8]/60 cursor-not-allowed'}`}
                      >
                        <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                        Pay Online
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('7488252019@okbizaxis');
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="flex-1 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all"
                      >
                        {copiedUpi ? (
                          <><CheckCircle size={16} /> Copied!</>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            Copy UPI ID
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-white/70 font-semibold text-center mt-1">
                      Agar app nahi khulta hai, QR scan karein ya UPI ID copy karke pay karein.
                    </p>
                  </div>
                </div>

                {/* Right Column: WhatsApp Verification */}
                <div className="flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-5 lg:pt-0 lg:pl-6">
                  <div className="bg-white/10 border border-white/20 p-3 sm:p-4 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] text-[#4ade80] leading-relaxed font-bold mb-4 text-center shadow-sm">
                    "UTR / Transaction Reference No." Paste karne ke baad hi WhatsApp par message kar sakte hain. Agar aap QR/UPI ID se payment karte hain to UTR number paste karein aur WhatsApp par send karein.
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (utrNumber.length < 12) {
                        alert('Please enter the 12-digit UTR / Transaction Reference No. first.');
                      } else {
                        window.open(`https://wa.me/917488252019?text=${encodeURIComponent(`Hi, I have paid ₹${selectedPayAmount} for Student ID: ${student.studentId}.\nName: ${student.name}\nUTR No: ${utrNumber}\n\n*Please find the screenshot attached.*`)}`, '_blank');
                      }
                    }}
                    className={`w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all mb-4 border ${utrNumber.length >= 12 ? 'bg-[#25d366] text-white border-[#1da851] hover:shadow-[0_5px_20px_rgba(37,211,102,0.4)] hover:-translate-y-0.5' : 'bg-white/10 text-[#4ade80] border-white/20 hover:bg-white/20'}`}
                  >
                    <MessageCircle size={18} /> WhatsApp Screenshot & UTR
                  </button>

                  <div className="bg-white/10 border border-white/20 rounded-lg sm:rounded-xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed text-white/90 shadow-sm mt-auto">
                    <div className="flex gap-2 sm:gap-3 items-start">
                      <AlertCircle size={18} className="sm:w-5 sm:h-5 text-[#facc15] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block mb-2 text-[#facc15] text-xs sm:text-sm font-black">Important Note:</strong> 
                        <p className="mb-3 text-xs sm:text-[13px] leading-relaxed">
                          Payment ke baad apna <strong>Screenshot</strong> aur <strong>Student ID 7488252019 par Whatsapps bhejein</strong> taaki payment successful ho sake.
                        </p>
                        <p className="text-[#fecdd3] font-bold text-[11px] sm:text-[12px]">
                          Without sharing the Payment Screenshot, the payment is not valid.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>
        )}

        {/* -------------------- TAB 2: PROFILE -------------------- */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-white p-4 sm:p-6 lg:p-8">
              <h3 className="font-black text-xl sm:text-2xl text-[#0f172a] mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 border-b border-slate-100 pb-3 sm:pb-4">
                <User size={20} className="sm:w-6 sm:h-6 text-[#3b82f6]" /> Student Profile
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-8 sm:gap-x-12">
                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest mb-1">Full Name</p>
                    <p className="font-black text-base sm:text-lg text-[#1e293b]">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest mb-1">Father's Name</p>
                    <p className="font-bold text-sm sm:text-base text-[#1e293b]">{student.fatherName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest mb-1">Mother's Name</p>
                    <p className="font-bold text-sm sm:text-base text-[#1e293b]">{student.motherName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest mb-1">Course/Class</p>
                    <p className="font-bold text-sm sm:text-base text-[#1e293b]">{student.course}</p>
                  </div>
                </div>

                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest mb-1">Mobile</p>
                    <p className="font-black text-base sm:text-lg text-[#1e293b]">{student.mobile}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest mb-1">Email Address</p>
                    <p className="font-bold text-sm sm:text-base text-[#1e293b] flex items-center gap-2">
                      <Mail size={14} className="sm:w-4 sm:h-4 text-[#64748b]" /> {student.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest mb-1">Joining Date</p>
                    <p className="font-bold text-sm sm:text-base text-[#1e293b] flex items-center gap-2">
                      <Calendar size={14} className="sm:w-4 sm:h-4 text-[#64748b]" /> {formatJoiningDate(student.joiningDate || student.admissionDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest mb-1">Registered Address</p>
                    <p className="font-bold text-sm sm:text-base text-[#1e293b] flex items-start gap-2">
                      <MapPin size={14} className="sm:w-4 sm:h-4 text-[#64748b] mt-0.5 flex-shrink-0" /> {student.address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Aadhaar Details Section */}
              {(student.aadharNumber || student.aadharFront || student.aadharBack) && (
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-100">
                  <h4 className="font-bold text-base sm:text-lg text-[#0f172a] mb-4 sm:mb-6 flex items-center gap-2">
                    <ShieldCheck size={18} className="sm:w-5 sm:h-5 text-[#3b82f6]" /> KYC Details
                  </h4>
                  
                  {student.aadharNumber && (
                    <div className="mb-4 sm:mb-6">
                      <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest mb-1">Aadhaar Number</p>
                      <p className="font-black text-base sm:text-lg text-[#1e293b] tracking-widest">{student.aadharNumber}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {student.aadharFront && (
                      <div className="flex-1">
                        <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest mb-2">Aadhaar Front</p>
                        <img 
                          src={student.aadharFront} 
                          alt="Aadhaar Front" 
                          className="w-full max-w-sm rounded-lg sm:rounded-xl border-2 border-slate-200 shadow-sm object-cover" 
                        />
                      </div>
                    )}
                    {student.aadharBack && (
                      <div className="flex-1">
                        <p className="text-[10px] sm:text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest mb-2">Aadhaar Back</p>
                        <img 
                          src={student.aadharBack} 
                          alt="Aadhaar Back" 
                          className="w-full max-w-sm rounded-lg sm:rounded-xl border-2 border-slate-200 shadow-sm object-cover" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* -------------------- TAB 3: PAYMENTS -------------------- */}
        {activeTab === 'payments' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-white p-4 sm:p-6 lg:p-8">
              <h3 className="font-black text-xl sm:text-2xl text-[#0f172a] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 border-b border-slate-100 pb-3 sm:pb-4">
                <Receipt size={20} className="sm:w-6 sm:h-6 text-[#16a34a]" /> Payment History & Receipts
              </h3>

              {paymentHistory.length === 0 ? (
                <div className="text-center py-12 sm:py-16 text-[#64748b] space-y-4">
                  <Receipt size={48} className="sm:w-14 sm:h-14 mx-auto text-slate-300" />
                  <p className="font-bold text-base sm:text-lg">No payment history found</p>
                  <p className="text-xs sm:text-sm text-[#94a3b8]">Fee receipts will appear here once recorded by the admin.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card Layout (visible below sm breakpoint) */}
                  <div className="sm:hidden space-y-3">
                    {paymentHistory.map((fee: any) => (
                      <div key={fee._id} className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                            {fee.receiptNumber || 'MIGRATED'}
                          </span>
                          <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 font-bold border border-slate-200 text-[10px] capitalize">
                            {fee.paymentMode || 'cash'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wide">Date</p>
                            <p className="font-medium text-[#1e293b]">{new Date(fee.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wide">Month</p>
                            <p className="font-bold text-[#1e293b]">{fee.month}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <p className="font-black text-lg text-[#0f172a]">{formatRupee(fee.amount || 0)}</p>
                          <button
                            onClick={() => handleDownloadReceipt(fee)}
                            className="p-2 text-[#3b82f6] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download Receipt"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Table Layout (visible on sm and above) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[#64748b] border-b-2 border-slate-100">
                          <th className="font-bold uppercase tracking-wider text-[11px] pb-4 px-2">Receipt No</th>
                          <th className="font-bold uppercase tracking-wider text-[11px] pb-4 px-2">Payment Date</th>
                          <th className="font-bold uppercase tracking-wider text-[11px] pb-4 px-2">Month</th>
                          <th className="font-bold uppercase tracking-wider text-[11px] pb-4 px-2">Mode</th>
                          <th className="font-bold uppercase tracking-wider text-[11px] pb-4 px-2 text-right">Amount</th>
                          <th className="font-bold uppercase tracking-wider text-[11px] pb-4 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paymentHistory.map((fee: any) => (
                          <tr key={fee._id} className="text-[#1e293b] hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-2">
                              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                {fee.receiptNumber || 'MIGRATED'}
                              </span>
                            </td>
                            <td className="py-4 px-2 font-medium text-[#64748b]">
                              {new Date(fee.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-4 px-2 font-bold">{fee.month}</td>
                            <td className="py-4 px-2 capitalize text-xs">
                              <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 font-bold border border-slate-200">
                                {fee.paymentMode || 'cash'}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right font-black text-lg text-[#0f172a]">
                              {formatRupee(fee.amount || 0)}
                            </td>
                            <td className="py-4 px-2 text-right">
                              <button
                                onClick={() => handleDownloadReceipt(fee)}
                                className="p-1.5 text-[#3b82f6] hover:bg-blue-50 rounded-lg transition-colors"
                                title="Download Receipt"
                              >
                                <Download size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* -------------------- TAB 4: COURSES -------------------- */}
        {activeTab === 'courses' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-white p-4 sm:p-6 lg:p-8">
              <h3 className="font-black text-xl sm:text-2xl text-[#0f172a] mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 border-b border-slate-100 pb-3 sm:pb-4">
                <BookOpen size={20} className="sm:w-6 sm:h-6 text-[#3b82f6]" /> Enrolled Courses
              </h3>
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                 <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Monitor size={32} />
                 </div>
                 <div>
                    <h4 className="text-lg font-bold text-slate-800">{student.course || "No specific course"}</h4>
                    <p className="text-sm text-slate-500 mt-1">Status: <span className="text-green-600 font-semibold uppercase">{student.status}</span></p>
                    <p className="text-sm text-slate-500 mt-1">Joined: {formatJoiningDate(student.admissionDate || student.joiningDate)}</p>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* -------------------- TAB 5: FEEDBACK -------------------- */}
        {activeTab === 'feedback' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-white p-4 sm:p-6 lg:p-8">
              <h3 className="font-black text-xl sm:text-2xl text-[#0f172a] mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 border-b border-slate-100 pb-3 sm:pb-4">
                <MessageSquare size={20} className="sm:w-6 sm:h-6 text-[#3b82f6]" /> Student Feedback
              </h3>
              
              <div className="max-w-2xl">
                <p className="text-sm text-slate-600 mb-6">We value your feedback! Share your suggestions, complaints, or ideas to help us improve Galaxy.</p>
                <textarea 
                  className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 resize-none bg-white/50"
                  placeholder="Type your feedback here..."
                  id="feedback-text"
                ></textarea>
                <button 
                  onClick={() => {
                    const text = (document.getElementById('feedback-text') as HTMLTextAreaElement).value;
                    if(!text) return alert('Please write some feedback first.');
                    window.open(`https://wa.me/917488252019?text=${encodeURIComponent(`*Student Feedback*\nName: ${student.name}\nID: ${student.studentId}\nFeedback: ${text}`)}`, '_blank');
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
                >
                  <Send size={18} /> Submit Feedback
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </main>
      <ChatBot />
    </div>
  );
}

import { feeApi } from '../../lib/apiService';
import { getCourseLabel } from '../../lib/courseOptions';
import { getStudentDisplayId } from '../../lib/studentId';
import type { PaymentReceipt } from './receiptService';
import type { StudentFee } from './feeModels';

export interface PaymentRecordInput {
  studentName: string;
  studentId: string;
  course?: string;
  seatNumber?: string;
  fatherName?: string;
  studentMobile?: string;
  amount: number;
  discountAmount?: number;
  feeCreditAmount?: number;
  month: string;
  paymentMode?: string;
  joiningDate?: string;
  notes?: string;
}

export const createPaymentRecord = (input: PaymentRecordInput): PaymentReceipt => ({
  // Temporary local ID — replaced by server receiptNumber after loadData() refreshes
  id: `GalaxyPR-pending-${Date.now().toString().slice(-6)}`,
  studentName: input.studentName,
  studentId: input.studentId,
  course: input.course,
  seatNumber: input.seatNumber,
  fatherName: input.fatherName,
  studentMobile: input.studentMobile,
  amount: input.amount,
  discountAmount: input.discountAmount,
  feeCreditAmount: input.feeCreditAmount,
  month: input.month,
  paymentMode: input.paymentMode,
  date: new Date().toISOString().split('T')[0],
  joiningDate: input.joiningDate,
  notes: input.notes,
});

export const saveFeePayment = async (payment: PaymentReceipt): Promise<any> => {
  return await feeApi.createFee({
    studentDisplayId: payment.studentId,
    amount: payment.amount,
    discountAmount: payment.discountAmount || 0,
    feeCreditAmount: payment.feeCreditAmount ?? payment.amount,
    month: payment.month,
    paymentMode: payment.paymentMode || 'cash',
    notes: payment.notes
  });
};

export const mapFeeToPaymentReceipt = (fee: any): PaymentReceipt => {
  const displayId = getStudentDisplayId(fee) || fee.studentDisplayId;
  
  const paymentDateStr = fee.date
      || (fee.paymentDate
        ? new Date(fee.paymentDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]);

  let receiptId = fee.receiptNumber;
  if (!receiptId) {
    const rawId = String(fee._id || fee.id || '');
    if (rawId.startsWith('GalaxyPR')) {
      receiptId = rawId;
    } else {
      const d = new Date(paymentDateStr);
      const yy = String(d.getFullYear()).slice(-2);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const suffix = rawId.length >= 4 ? rawId.slice(-4).toUpperCase() : String(Math.floor(1000 + Math.random() * 9000));
      receiptId = `GalaxyPR${yy}${mm}${suffix}`;
    }
  }

  return {
    id: receiptId,
    rawId: fee._id ? String(fee._id) : undefined,
    studentName: fee.studentName,
    studentId: displayId,
    course: getCourseLabel(fee.course),
    seatNumber: fee.seatNumber,
    fatherName: fee.fatherName,
    studentMobile: fee.studentMobile,
    amount: Number(fee.amount) || 0,
    discountAmount: Number(fee.discountAmount) || 0,
    feeCreditAmount: Number(fee.feeCreditAmount ?? fee.amount) || 0,
    month: fee.month,
    paymentMode: fee.paymentMode,
    date: paymentDateStr,
    joiningDate: fee.joiningDate,
    notes: fee.notes,
  };
};

export const mapStudentToFeeRow = (student: any): StudentFee => ({
  id: student._id,
  name: student.name,
  studentId: getStudentDisplayId(student),
  course: getCourseLabel(student.course),
  seat: student.seatNumber || '--',
  contact: student.mobile || '',
  fatherName: student.fatherName,
  timeShift: student.timeShift,
  customShiftHours: student.customShiftHours,
  photo: student.photo,
  monthlyFee: Number(student.feeAmount) || 0,
  feeDue: 0,
  lastPaid: '-',
  status: student.status || 'active',
  joiningDate: student.joiningDate || student.admissionDate,
});

export const getStoredPayments = async (): Promise<PaymentReceipt[]> => {
  const fees = await feeApi.getFees();
  return fees.map(mapFeeToPaymentReceipt);
};

export const updateFeeStudentList = (
  students: StudentFee[],
  paidStudentId: string,
  amount: number
): StudentFee[] => {
  return students.map((student) => {
    if (student.studentId !== paidStudentId) return student;
    const nextDue = Math.max(0, student.feeDue - amount);
    return {
      ...student,
      feeDue: nextDue,
      lastPaid: new Date().toISOString().split('T')[0],
      status: nextDue > 0 ? 'active' : 'inactive',
    };
  });
};

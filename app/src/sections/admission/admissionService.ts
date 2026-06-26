import { studentApi, feeApi, dashboardApi } from '../../lib/apiService';
import type { Student } from '../students/studentDetails';
import { resolveCourseForStorage } from '../../lib/courseOptions';

export interface AdmissionFormData {
  name: string;
  fatherName: string;
  motherName?: string;
  mobile: string;
  parentMobile?: string;
  email: string;
  address: string;
  course: string;
  customCourse?: string;
  seatNumber: string;
  customSeat?: string;
  feeAmount: string;
  paidAmount: string;
  paymentMode: 'cash' | 'upi' | 'card';
  timeShift?: string;
  customShiftHours?: string;
  joiningDate: string;
  aadharNumber: string;
  photo?: string;
  aadharFront?: string;
  aadharBack?: string;
  password?: string;
}

export interface AdmissionResult {
  student: Student;
  fee: any;
  expectedFee: number;
  paidAmount: number;
  pendingAmount: number;
  message: string;
}

/**
 * Submit admission and update all sections:
 * 1. Creates student record
 * 2. Creates initial fee entry
 * 3. Updates seat assignment
 * 4. Updates dashboard statistics
 */
export const submitAdmission = async (formData: AdmissionFormData): Promise<AdmissionResult> => {
  try {
    const resolvedSeat =
      formData.seatNumber === 'other'
        ? String(formData.customSeat || '').trim()
        : String(formData.seatNumber || '').trim();

    const studentPayload = {
      name: formData.name,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      mobile: formData.mobile,
      parentMobile: formData.parentMobile || undefined,
      email: formData.email,
      address: formData.address,
      course: resolveCourseForStorage(formData.course, formData.customCourse),
      seatNumber: resolvedSeat,
      timeShift: formData.timeShift,
      customShiftHours: formData.customShiftHours
        ? Number(formData.customShiftHours)
        : undefined,
      joiningDate: formData.joiningDate,
      paymentMode: formData.paymentMode,
      feeAmount: Number(formData.feeAmount),
      aadharNumber: formData.aadharNumber,
      photo: formData.photo,
      aadharFront: formData.aadharFront,
      aadharBack: formData.aadharBack,
    };
    const paidAmount = Number(formData.paidAmount) || 0;
    
    // Step 1: Create student record
    let student;
    try {
      student = await studentApi.createStudent(studentPayload);
    } catch (error: any) {
      if (error.name === 'NetworkError') {
        throw new Error('Backend server is not running. Please start the server with: npm run dev (in server folder)');
      }
      throw new Error(`Failed to create student record: ${error.response?.data?.message || error.message}`);
    }
    
    // Step 2: Create initial fee entry for admission fee
    let feeRecord: any = null;
    if (student && student.studentId && paidAmount > 0) {
      try {
        const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
        feeRecord = await feeApi.createFee({
          studentDisplayId: student.studentId,
          studentName: student.name,
          amount: paidAmount,
          month: currentMonth,
          paymentMode: studentPayload.paymentMode || 'cash',
          notes: `Admission payment for ${student.course} course`
        });
      } catch (error: any) {
        console.warn('Fee entry creation failed, but student was created successfully', error);
        // Don't throw - fee creation failure shouldn't prevent admission
      }
    }
    
    // Step 3: Refresh dashboard stats to update overall statistics
    try {
      await dashboardApi.getStats();
    } catch (error) {
      console.warn('Dashboard stats refresh failed, but admission was successful', error);
    }
    
    return {
      student,
      fee: feeRecord,
      expectedFee: studentPayload.feeAmount,
      paidAmount,
      pendingAmount: Math.max(studentPayload.feeAmount - paidAmount, 0),
      message: `Student ${student.name} has been successfully admitted with Student ID: ${student.studentId}`
    };
  } catch (error) {
    console.error('Admission submission error:', error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to process admission'}`);
  }
};

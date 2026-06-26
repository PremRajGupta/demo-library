import Student from '../models/Student.js';
import Fee from '../models/Fee.js';
import { getSeatStats } from '../utils/seatLayout.js';
import { getCourseLabel } from '../utils/courseOptions.js';
import { getFeeForTimeShift } from '../utils/feeRules.js';
import { computeStudentFeeDue } from '../utils/feeDues.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'active' });
    const { totalSeats, occupiedSeats, availableSeats } = await getSeatStats();

    const fees = await Fee.find();
    const totalRevenue = fees.reduce((acc, fee) => acc + fee.amount, 0);

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentMonthYear = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const monthlyRevenue = fees
      .filter(fee => fee.month === currentMonth || fee.month === currentMonthYear)
      .reduce((acc, fee) => acc + fee.amount, 0);

    const activeStudents = await Student.find({ status: 'active' })
      .select('name studentId course timeShift customShiftHours feeAmount joiningDate admissionDate');

    const paymentsByStudent = fees.reduce((acc, fee) => {
      const key = fee.studentDisplayId;
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        month: fee.month,
        amount: fee.amount,
        paymentDate: fee.paymentDate,
      });
      return acc;
    }, {});

    const pendingFees = activeStudents
      .map((student) => {
        const monthlyFee = Number(student.feeAmount) || getFeeForTimeShift(student.timeShift) || 0;
        const joiningDate = student.joiningDate || student.admissionDate;
        const studentPayments = paymentsByStudent[student.studentId] || [];
        const due = computeStudentFeeDue({
          monthlyFee,
          joiningDate,
          payments: studentPayments,
          asOf: currentDate,
        });

        return {
          _id: student._id,
          name: student.name,
          studentId: student.studentId,
          course: getCourseLabel(student.course),
          timeShift: student.timeShift,
          customShiftHours: student.customShiftHours,
          monthlyFee,
          paidAmount: due.currentMonthPaid,
          pendingAmount: due.pendingAmount,
          overdueMonths: due.overdueMonths,
        };
      })
      .filter((student) => student.pendingAmount > 0)
      .sort((a, b) => b.pendingAmount - a.pendingAmount);

    const pendingFeeTotal = pendingFees.reduce((acc, student) => acc + student.pendingAmount, 0);

    const recentAdmissions = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name studentId course joiningDate admissionDate status');

    res.status(200).json({
      totalStudents,
      totalSeats,
      occupiedSeats,
      availableSeats,
      totalRevenue,
      monthlyRevenue,
      pendingFeeTotal,
      pendingFeeCount: pendingFees.length,
      pendingFees: pendingFees.slice(0, 6),
      recentAdmissions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

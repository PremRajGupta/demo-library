import Student from '../models/Student.js';
import Fee from '../models/Fee.js';
import { getCourseLabel } from '../utils/courseOptions.js';
import { getFeeForTimeShift } from '../utils/feeRules.js';
import { computeStudentFeeDue, parseDateInputValue } from '../utils/feeDues.js';

const PERIOD_LABELS = {
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  thisYear: 'This Year',
};

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const YEAR_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getDateRange = (timeRange) => {
  const now = new Date();
  let startDate;
  let endDate;

  if (timeRange === 'thisWeek') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(now.getFullYear(), now.getMonth(), diff);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (timeRange === 'lastMonth') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (timeRange === 'thisYear') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return {
    startDate,
    endDate,
    periodLabel: PERIOD_LABELS[timeRange] || PERIOD_LABELS.thisMonth,
  };
};

const formatDateRange = (startDate, endDate) => {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${startDate.toLocaleDateString('en-IN', options)} – ${endDate.toLocaleDateString('en-IN', options)}`;
};

const getPaymentDate = (fee) => new Date(fee.paymentDate || fee.createdAt);

const isWithinRange = (date, startDate, endDate) => {
  const value = new Date(date);
  return value >= startDate && value <= endDate;
};

const getWeekdayIndex = (date) => (date.getDay() === 0 ? 6 : date.getDay() - 1);

const getFeeBucketLabel = (date, timeRange) => {
  if (timeRange === 'thisWeek') {
    return WEEKDAY_LABELS[getWeekdayIndex(date)];
  }

  if (timeRange === 'thisMonth' || timeRange === 'lastMonth') {
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
  }

  return YEAR_MONTH_LABELS[date.getMonth()];
};

const buildOrderedBuckets = (timeRange, startDate, endDate) => {
  if (timeRange === 'thisWeek') {
    return [...WEEKDAY_LABELS];
  }

  if (timeRange === 'thisMonth' || timeRange === 'lastMonth') {
    const buckets = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);
    const lastDay = endDate.getDate();

    for (let day = 1; day <= lastDay; day += 1) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth(), day);
      buckets.push(getFeeBucketLabel(date, timeRange));
    }

    return buckets;
  }

  return [...YEAR_MONTH_LABELS];
};

export const getReportsData = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'thisMonth';
    const { startDate, endDate, periodLabel } = getDateRange(timeRange);
    const now = new Date();
    const asOfDate = timeRange === 'lastMonth' ? endDate : (now < endDate ? now : endDate);

    const [allStudents, allFees] = await Promise.all([
      Student.find(),
      Fee.find(),
    ]);

    const paymentsByStudent = allFees.reduce((acc, fee) => {
      const key = fee.studentDisplayId;
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        month: fee.month,
        amount: fee.amount,
        paymentDate: fee.paymentDate,
      });
      return acc;
    }, {});

    const periodFees = allFees.filter((fee) => isWithinRange(getPaymentDate(fee), startDate, endDate));
    const totalCollected = periodFees.reduce((acc, fee) => acc + (fee.amount || 0), 0);
    const totalPayments = periodFees.length;

    const admissions = allStudents.filter((student) => {
      const joinDate = new Date(student.joiningDate || student.admissionDate);
      return isWithinRange(joinDate, startDate, endDate);
    });

    const activeStudents = allStudents.filter((student) => student.status === 'active');
    let totalPending = 0;
    let fullPaid = 0;
    let partial = 0;
    let unpaid = 0;

    const studentPayments = activeStudents.map((student) => {
      const monthlyFee = Number(student.feeAmount) || getFeeForTimeShift(student.timeShift) || 0;
      const payments = paymentsByStudent[student.studentId] || [];
      const due = computeStudentFeeDue({
        monthlyFee,
        joiningDate: student.joiningDate || student.admissionDate,
        payments,
        asOf: asOfDate,
      });

      totalPending += due.pendingAmount;

      if (due.pendingAmount <= 0 && due.paidAmount > 0) {
        fullPaid += 1;
      } else if (due.paidAmount > 0) {
        partial += 1;
      } else if (monthlyFee > 0) {
        unpaid += 1;
      }

      return {
        studentId: student._id,
        studentDisplayId: student.studentId,
        name: student.name,
        paid: due.paidAmount,
        due: due.pendingAmount,
      };
    });

    const bucketOrder = buildOrderedBuckets(timeRange, startDate, endDate);
    const feeMap = Object.fromEntries(bucketOrder.map((label) => [label, { collected: 0, pending: 0 }]));

    periodFees.forEach((fee) => {
      const label = getFeeBucketLabel(getPaymentDate(fee), timeRange);
      if (!feeMap[label]) {
        feeMap[label] = { collected: 0, pending: 0 };
      }
      feeMap[label].collected += fee.amount || 0;
    });

    // Compute pending dues by date/bucket
    activeStudents.forEach((student) => {
      const monthlyFee = Number(student.feeAmount) || getFeeForTimeShift(student.timeShift) || 0;
      if (monthlyFee <= 0) return;

      const payments = paymentsByStudent[student.studentId] || [];
      const joinDate = parseDateInputValue(student.joiningDate || student.admissionDate) || asOfDate;

      // Allocate payments chronologically to billing periods
      const sortedPayments = [...payments]
        .map((p) => ({
          amount: Number(p.amount) || 0,
          paidOn: p.paymentDate ? new Date(p.paymentDate) : asOfDate,
        }))
        .filter((p) => p.amount > 0)
        .sort((a, b) => a.paidOn.getTime() - b.paidOn.getTime());

      let totalPaidCredit = sortedPayments.reduce((sum, p) => sum + p.amount, 0);

      const BILLING_MS = 30 * 24 * 60 * 60 * 1000;
      // We calculate billing periods from joiningDate up to asOfDate
      let periodIndex = 0;
      while (true) {
        const periodStart = new Date(joinDate.getTime() + periodIndex * BILLING_MS);
        if (periodStart > asOfDate) break;

        const periodCharge = monthlyFee;
        const paidForPeriod = Math.min(totalPaidCredit, periodCharge);
        totalPaidCredit = Math.max(totalPaidCredit - periodCharge, 0);
        const pendingForPeriod = periodCharge - paidForPeriod;

        // If the period started within our selected time range, add its pending amount to the bucket
        if (isWithinRange(periodStart, startDate, endDate) && pendingForPeriod > 0) {
          const label = getFeeBucketLabel(periodStart, timeRange);
          if (feeMap[label]) {
            feeMap[label].pending += pendingForPeriod;
          }
        }

        periodIndex += 1;
      }
    });

    const feeData = bucketOrder.map((label) => ({
      month: label,
      collected: feeMap[label]?.collected || 0,
      pending: feeMap[label]?.pending || 0,
    }));

    const courseMap = {};
    admissions.forEach((student) => {
      const course = getCourseLabel(student.course) || 'Other';
      courseMap[course] = (courseMap[course] || 0) + 1;
    });

    const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#ec4899'];
    const admissionData = Object.keys(courseMap).map((course, index) => ({
      name: course,
      value: courseMap[course],
      color: colors[index % colors.length],
    }));

    const admissionDetails = Object.keys(courseMap).map((course) => {
      const studentsInCourse = admissions
        .filter((student) => (getCourseLabel(student.course) || 'Other') === course)
        .map((student) => ({
          studentDisplayId: student.studentId,
          name: student.name,
          joiningDate: student.joiningDate || student.admissionDate,
          contact: student.mobile || student.parentMobile || '',
        }));

      return {
        course,
        count: studentsInCourse.length,
        students: studentsInCourse,
      };
    });

    const expiredCount = allStudents.filter((student) => student.status === 'expired').length;

    const reportCards = [
      {
        title: 'Fee Collection Report',
        iconName: 'IndianRupee',
        color: 'blue',
        stat: `₹${totalCollected.toLocaleString('en-IN')}`,
        subtitle: `Collected in ${periodLabel.toLowerCase()}`,
        trend: `${totalPayments} payment${totalPayments === 1 ? '' : 's'}`,
      },
      {
        title: 'Pending Fees Report',
        iconName: 'TrendingUp',
        color: 'yellow',
        stat: `₹${totalPending.toLocaleString('en-IN')}`,
        subtitle: `Outstanding as of ${asOfDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
        trend: `${partial + unpaid} student${partial + unpaid === 1 ? '' : 's'} due`,
      },
      {
        title: 'Admission Report',
        iconName: 'Users',
        color: 'green',
        stat: admissions.length.toString(),
        subtitle: `New admissions in ${periodLabel.toLowerCase()}`,
        trend: admissions.length > 0 ? `${Object.keys(courseMap).length} course${Object.keys(courseMap).length === 1 ? '' : 's'}` : 'No admissions',
      },
      {
        title: 'Student Status Report',
        iconName: 'Calendar',
        color: 'red',
        stat: expiredCount.toString(),
        subtitle: 'Expired accounts (all time)',
        trend: `${fullPaid} fully paid`,
      },
    ];

    res.status(200).json({
      feeData,
      admissionData,
      admissionDetails,
      reportCards,
      studentPayments,
      summary: {
        periodLabel,
        dateRange: formatDateRange(startDate, endDate),
        totalCollected,
        totalPending,
        totalAdmissions: admissions.length,
        totalPayments,
        expiredCount,
        paymentStatus: { fullPaid, partial, unpaid },
      },
    });
  } catch (error) {
    console.error('Error fetching reports data:', error);
    res.status(500).json({ message: 'Error fetching reports data', error: error.message });
  }
};

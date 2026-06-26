import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TopHeader from '../components/layout/TopHeader';
import QuickActionCard from '../components/QuickActionCard';
import { Users, Armchair, IndianRupee, AlertTriangle, Plus, Wallet, Grid3X3, Check, ReceiptText } from 'lucide-react';
import { dashboardApi } from '../lib/apiService';
import { getTimeShiftLabel } from '../lib/feeRules';
import { getCourseLabel } from '../lib/courseOptions';

const quickActions = [
  { label: 'Admission', icon: Plus, path: '/admission' },
  { label: 'Collect Fees', icon: Wallet, path: '/fees' },
  { label: 'Assign Seat', icon: Grid3X3, path: '/seat-map' },
  { label: 'Attendance', icon: Check, path: '/students' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification] = useState('');

  const fetchStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStatsData(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [location]);

  const openFeesPayModal = (studentId: string) => {
    navigate('/fees', { state: { openPayForStudentId: studentId } });
  };

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  const stats = [
    { label: 'Total Students', value: String(statsData?.totalStudents || 0), icon: Users, color: 'blue' as const },
    { label: 'Seats Occupied', value: String(statsData?.occupiedSeats || 0), icon: Armchair, color: 'green' as const },
    { label: 'Fees Collected', value: `₹${(statsData?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'yellow' as const },
    { label: 'Available Seats', value: String(statsData?.availableSeats || 0), icon: AlertTriangle, color: 'red' as const },
  ];
  const pendingFees = statsData?.pendingFees || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

  return (
    <div>
      <TopHeader />

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 px-6 py-3 bg-[#22c55e] text-white text-sm font-medium rounded-lg shadow-lg"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[10px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] cursor-default"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${
                  stat.color === 'blue' ? 'bg-[#dbeafe]' :
                  stat.color === 'green' ? 'bg-[#dcfce7]' :
                  stat.color === 'yellow' ? 'bg-[#fef9c3]' : 'bg-[#fee2e2]'
                } rounded-full flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={
                    stat.color === 'blue' ? 'text-[#3b82f6]' :
                    stat.color === 'green' ? 'text-[#22c55e]' :
                    stat.color === 'yellow' ? 'text-[#eab308]' : 'text-[#ef4444]'
                  } size={22} />
                </div>
                <div>
                  <p className="text-2xl sm:text-[32px] font-bold text-[#1e293b] leading-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-[#64748b]">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-7">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.label}
                label={action.label}
                icon={action.icon}
                path={action.path}
              />
            ))}
          </div>
        </motion.div>

        {/* Pending Fee */}
        <motion.div variants={itemVariants} className="mb-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h2 className="text-lg font-semibold text-[#1e293b]">Pending Fee</h2>
            <div className="text-left sm:text-right">
              <p className="text-xs text-[#64748b]">Total Pending</p>
              <p className="text-xl font-bold text-[#dc2626]">
                Rs. {(statsData?.pendingFeeTotal || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
            {pendingFees.length > 0 ? (
              <div className="divide-y divide-[#e2e8f0]">
                {pendingFees.map((student: any) => (
                  <div key={student.studentId} className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-4">
                    <div className="w-10 h-10 bg-[#fee2e2] rounded-full flex items-center justify-center flex-shrink-0">
                      <ReceiptText className="text-[#dc2626]" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#1e293b] truncate">{student.name}</p>
                      <p className="text-sm text-[#64748b]">
                        {student.studentId} - {getCourseLabel(student.course)} - {getTimeShiftLabel(student.timeShift, student.customShiftHours)}
                        {(student.overdueMonths ?? 0) > 1 && (
                          <span className="text-[#dc2626]"> · {student.overdueMonths} months due</span>
                        )}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-sm sm:min-w-[330px]">
                      <div>
                        <p className="text-xs text-[#64748b]">Monthly</p>
                        <p className="font-semibold text-[#1e293b]">Rs. {student.monthlyFee.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748b]">Paid</p>
                        <p className="font-semibold text-[#16a34a]">Rs. {student.paidAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748b]">Pending</p>
                        <p className="font-semibold text-[#dc2626]">Rs. {student.pendingAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openFeesPayModal(student.studentId)}
                      className="w-full sm:w-auto px-4 py-2 bg-[#0369a1] text-white text-sm font-semibold rounded-lg hover:bg-[#075985] transition-colors"
                    >
                      Collect
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <ReceiptText className="mx-auto mb-3 text-[#22c55e]" size={28} />
                <p className="font-semibold text-[#1e293b]">No pending fee</p>
                <p className="text-sm text-[#64748b] mt-1">All active students are paid for this month.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

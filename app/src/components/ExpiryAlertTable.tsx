import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard } from 'lucide-react';

interface ExpiryAlert {
  id: string;
  name: string;
  studentId: string;
  seat: string;
  daysLeft: number;
  status: 'expired' | 'active' | 'pending';
  feeDue?: number;
}

interface ExpiryAlertTableProps {
  alerts: ExpiryAlert[];
  onPay?: (studentId: string) => void;
}

export default function ExpiryAlertTable({ alerts, onPay }: ExpiryAlertTableProps) {
  const navigate = useNavigate();
  const [notification, setNotification] = useState('');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-[#3b82f6]', 'bg-[#22c55e]', 'bg-[#eab308]', 'bg-[#ef4444]', 'bg-[#8b5cf6]'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handlePay = (alert: ExpiryAlert) => {
    if (onPay) {
      // If onPay prop is provided (Dashboard), use it
      onPay(alert.studentId);
    } else {
      // Otherwise navigate to fee collection (standalone usage)
      navigate('/fees');
      showNotification(`Navigating to fee collection for ${alert.name}`);
    }
  };

  return (
    <div className="bg-white rounded-[10px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] relative">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 right-4 z-50 px-4 py-2 bg-[#22c55e] text-white text-sm font-medium rounded-lg shadow-lg"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-[#1e293b]">Expiry Alerts</h2>
        <button
          onClick={() => navigate('/fees')}
          className="text-sm text-[#3b82f6] hover:underline font-medium"
        >
          Manage All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="pb-3 text-sm font-medium text-[#64748b]">Student</th>
              <th className="pb-3 text-sm font-medium text-[#64748b]">Seat</th>
              <th className="pb-3 text-sm font-medium text-[#64748b]">Days Left</th>
              <th className="pb-3 text-sm font-medium text-[#64748b]">Status</th>
              <th className="pb-3 text-sm font-medium text-[#64748b]">Fee Due</th>
              <th className="pb-3 text-sm font-medium text-[#64748b]">Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#94a3b8]">
                  No expiry alerts!
                </td>
              </tr>
            ) : (
              alerts.map((alert, index) => (
                <motion.tr
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#f8fafc] transition-colors duration-100"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${getAvatarColor(alert.name)} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-xs font-semibold">
                          {getInitials(alert.name)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1e293b]">{alert.name}</p>
                        <p className="text-xs text-[#94a3b8]">ID: {alert.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-semibold text-[#1e293b]">{alert.seat}</td>
                  <td className="py-4 text-sm text-[#1e293b]">{alert.daysLeft > 0 ? alert.daysLeft : '--'}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#f97316]">Overdue</span>
                      <span className="px-2.5 py-1 bg-[#fee2e2] text-[#ef4444] text-[10px] font-semibold rounded-md uppercase">
                        Expired
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-bold text-[#ef4444]">
                      ₹{(alert.feeDue || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => handlePay(alert)}
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
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopHeader from '../components/layout/TopHeader';
import { MessageSquare, Check, X } from 'lucide-react';
import { requestApi } from '../lib/apiService';

interface Request {
  id: string;
  requestDate: string;
  studentName: string;
  studentId: string;
  requestType: 'seat_change' | 'leave' | 'other';
  details: string;
  status: 'pending' | 'approved' | 'rejected';
}

const typeLabels = {
  seat_change: 'Seat Change',
  leave: 'Leave',
  other: 'Other',
};

const typeColors = {
  seat_change: 'bg-[#dbeafe] text-[#3b82f6]',
  leave: 'bg-[#fef9c3] text-[#eab308]',
  other: 'bg-[#f3f4f6] text-[#6b7280]',
};

const statusConfig: Record<string, any> = {
  pending: { bg: 'bg-[#fef9c3]', text: 'text-[#eab308]', label: 'Pending' },
  approved: { bg: 'bg-[#dcfce7]', text: 'text-[#22c55e]', label: 'Approved' },
  rejected: { bg: 'bg-[#fee2e2]', text: 'text-[#ef4444]', label: 'Rejected' },
};

export default function Requests() {
  const location = useLocation();
  const [requests, setRequests] = useState<Request[]>([]);

  const fetchRequests = async () => {
    try {
      const data = await requestApi.getRequests();
      setRequests(data.map((r: any) => ({
        ...r,
        id: r._id,
        requestDate: new Date(r.createdAt).toISOString().split('T')[0],
        studentName: r.student?.name || 'Unknown',
        studentId: r.student?.studentId || 'Unknown'
      })));
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [location]);

  const handleApprove = async (id: string) => {
    try {
      await requestApi.updateRequestStatus(id, 'approved');
      fetchRequests();
    } catch (error) {
      console.error("Failed to approve request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await requestApi.updateRequestStatus(id, 'rejected');
      fetchRequests();
    } catch (error) {
      console.error("Failed to reject request");
    }
  };

  return (
    <div>
      <TopHeader />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="page-card">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 bg-[#fef9c3] rounded-lg flex items-center justify-center">
              <MessageSquare className="text-[#eab308]" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1e293b]">Requests</h2>
              <p className="text-sm text-[#64748b]">Manage student requests</p>
            </div>
          </div>

          <div className="table-scroll">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#e2e8f0]">
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Request Date</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Student</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Type</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Details</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Status</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request, index) => {
                  const status = statusConfig[request.status];
                  return (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.3 }}
                      className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#f8fafc] transition-colors duration-100"
                    >
                      <td className="py-4 text-sm text-[#64748b]">{request.requestDate}</td>
                      <td className="py-4">
                        <div>
                          <p className="text-sm font-medium text-[#1e293b]">{request.studentName}</p>
                          <p className="text-xs text-[#94a3b8]">{request.studentId}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 ${typeColors[request.requestType]} text-xs font-semibold rounded-md`}>
                          {typeLabels[request.requestType]}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-[#1e293b] max-w-xs truncate">{request.details}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 ${status.bg} ${status.text} text-xs font-semibold rounded-md`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4">
                        {request.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="p-1.5 bg-[#dcfce7] text-[#22c55e] rounded-md hover:bg-[#bbf7d0] transition-colors"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="p-1.5 bg-[#fee2e2] text-[#ef4444] rounded-md hover:bg-[#fecaca] transition-colors"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-[#94a3b8]">-</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

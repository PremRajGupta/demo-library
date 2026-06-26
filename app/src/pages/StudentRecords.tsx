import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import TopHeader from '../components/layout/TopHeader';
import { Users, Search, Eye, Pencil, Trash2, X, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInitials, getAvatarColor } from '../sections/students/students';
import { studentApi } from '../lib/apiService';
import { getCourseLabel } from '../lib/courseOptions';
import { getStudentDisplayId } from '../lib/studentId';
import { formatJoiningDate } from '../lib/formatDate';

const statusConfig = {
  active: { bg: 'bg-[#dcfce7]', text: 'text-[#22c55e]', label: 'Active' },
  inactive: { bg: 'bg-[#f3f4f6]', text: 'text-[#6b7280]', label: 'Inactive' },
  expired: { bg: 'bg-[#fee2e2]', text: 'text-[#ef4444]', label: 'Expired' },
};

export default function StudentRecords() {
  const [studentList, setStudentList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingStudent, setViewingStudent] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch students whenever location changes (e.g., after edit/delete)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentApi.getStudents();
        const mappedData = data.map((s: any) => ({
          ...s,
          id: s._id,
          seat: s.seatNumber || '--',
          contact: s.mobile,
          parentContact: s.parentMobile || 'N/A',
          studentId: getStudentDisplayId(s),
          course: getCourseLabel(s.course),
          joiningDate: formatJoiningDate(s.joiningDate || s.admissionDate),
        }));
        mappedData.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        setStudentList(mappedData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [location]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  const handleView = (student: any) => {
    setViewingStudent(student);
  };

  const handleEdit = (id: string) => {
    navigate(`/students/edit/${id}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await studentApi.deleteStudent(id);
      const updated = studentList.filter((s) => s.id !== id);
      setStudentList(updated);
      showNotification(`${name} deleted successfully!`);
    } catch (error) {
      showNotification(`Failed to delete ${name}`);
    }
  };

  const handleToggleInactive = async (student: any) => {
    try {
      const newStatus = student.status === 'inactive' ? 'active' : 'inactive';
      const updateData: any = { status: newStatus };

      if (newStatus === 'inactive') {
        updateData['seatNumber'] = null;
      }

      await studentApi.updateStudent(student.id, updateData);

      const updated = studentList.map((s) =>
        s.id === student.id
          ? {
              ...s,
              status: newStatus,
              seat: newStatus === 'inactive' ? '--' : s.seat
            }
          : s
      );
      setStudentList(updated);

      const action = newStatus === 'inactive' ? 'marked as inactive' : 'marked as active';
      showNotification(`${student.name} ${action}. Seat freed.`);
    } catch (error) {
      showNotification(`Failed to update ${student.name} status`);
    }
  };

  const handleDownloadPdf = (student: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Student Record', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    let y = 40;
    
    const drawRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value || 'N/A'), 60, y);
      y += 10;
    };
    
    drawRow('Name', student.name);
    drawRow('Student ID', student.studentId);
    drawRow('Course', student.course);
    drawRow('Seat Number', student.seat);
    drawRow("Father's Name", student.fatherName || student.father || 'N/A');
    drawRow("Mother's Name", student.motherName || student.mother || 'N/A');
    drawRow('Contact', student.contact);
    drawRow('Parent Contact', student.parentMobile || 'N/A');
    drawRow('Time Shift', student.timeShift || student.shift || 'N/A');
    drawRow('Email', student.email || student.emailAddress || 'N/A');
    drawRow('Joining Date', student.joiningDate);
    drawRow('Status', statusConfig[student.status as keyof typeof statusConfig]?.label || (student.status || 'N/A'));
    
    doc.setFont('helvetica', 'bold');
    doc.text('Address:', 20, y);
    doc.setFont('helvetica', 'normal');
    const addressLines = doc.splitTextToSize(String(student.address || 'N/A'), 120);
    doc.text(addressLines, 60, y);
    y += addressLines.length * 7 + 5;
    
    const addImageSafe = (imgData: string, label: string, w: number, h: number) => {
      if (y + h + 20 > 280) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, y);
      try {
        doc.addImage(imgData, 20, y + 5, w, h);
      } catch(e) {
         doc.setFont('helvetica', 'normal');
         doc.text('(Image data unavailable)', 20, y + 10);
      }
      y += h + 15;
    };

    if (student.photo) addImageSafe(student.photo, 'Photo', 40, 40);
    if (student.aadharFront) addImageSafe(student.aadharFront, 'Aadhar Front', 80, 50);
    if (student.aadharBack) addImageSafe(student.aadharBack, 'Aadhar Back', 80, 50);

    doc.save(`${student.name.replace(/\\s+/g, '_')}_Record.pdf`);
  };

  const filteredStudents = studentList.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? s.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div>
        <TopHeader />
        <div className="p-8 text-center text-[#64748b]">Loading student records...</div>
      </div>
    );
  }

  return (
    <div>
      <TopHeader />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#22c55e] text-white text-sm font-medium rounded-lg shadow-lg"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
                <h3 className="text-lg font-semibold text-[#1e293b]">Student Details</h3>
                <button onClick={() => setViewingStudent(null)} className="text-[#64748b] hover:text-[#0f172a] transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center gap-4 mb-6">
                  {viewingStudent.photo ? (
                    <img src={viewingStudent.photo} alt={viewingStudent.name} className="w-16 h-16 rounded-full object-cover border border-[#e2e8f0]" />
                  ) : (
                    <div className={`w-16 h-16 ${getAvatarColor(viewingStudent.name)} rounded-full flex items-center justify-center text-xl text-white font-bold`}>
                      {getInitials(viewingStudent.name)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-[#1e293b]">{viewingStudent.name}</h4>
                    <p className="text-sm text-[#64748b]">{viewingStudent.studentId}</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 ${statusConfig[viewingStudent.status as keyof typeof statusConfig]?.bg} ${statusConfig[viewingStudent.status as keyof typeof statusConfig]?.text} text-xs font-semibold rounded-md`}>
                      {statusConfig[viewingStudent.status as keyof typeof statusConfig]?.label}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#64748b] mb-1">Father's Name</p>
                    <p className="font-medium text-[#1e293b]">{viewingStudent.fatherName || viewingStudent.father || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b] mb-1">Mother's Name</p>
                    <p className="font-medium text-[#1e293b]">{viewingStudent.motherName || viewingStudent.mother || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b] mb-1">Parent Contact</p>
                    <p className="font-medium text-[#1e293b]">{viewingStudent.parentMobile || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b] mb-1">Contact</p>
                    <p className="font-medium text-[#1e293b]">{viewingStudent.contact}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b] mb-1">Course</p>
                    <p className="font-medium text-[#1e293b]">{viewingStudent.course}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b] mb-1">Seat Number</p>
                    <p className="font-medium text-[#1e293b]">{viewingStudent.seat}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b] mb-1">Time Shift</p>
                    <p className="font-medium text-[#1e293b]">{viewingStudent.timeShift || viewingStudent.shift || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b] mb-1">Email</p>
                    <p className="font-medium text-[#1e293b]">{viewingStudent.email || viewingStudent.emailAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b] mb-1">Portal Password</p>
                    <p className="font-mono font-semibold text-[#3b82f6]">{viewingStudent.password || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b] mb-1">Joining Date</p>
                    <p className="font-medium text-[#1e293b]">{viewingStudent.joiningDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#64748b] mb-1">Address</p>
                    <p className="font-medium text-[#1e293b]">{viewingStudent.address || 'N/A'}</p>
                  </div>
                </div>

                {(viewingStudent.aadharFront || viewingStudent.aadharBack) && (
                  <div className="mt-6">
                    <p className="text-[#64748b] text-sm mb-3 font-medium">Aadhar Documents</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {viewingStudent.aadharFront && (
                        <div>
                          <p className="text-xs text-[#94a3b8] mb-1">Front</p>
                          <img src={viewingStudent.aadharFront} alt="Aadhar Front" className="w-full h-auto rounded border border-[#e2e8f0]" />
                        </div>
                      )}
                      {viewingStudent.aadharBack && (
                        <div>
                          <p className="text-xs text-[#94a3b8] mb-1">Back</p>
                          <img src={viewingStudent.aadharBack} alt="Aadhar Back" className="w-full h-auto rounded border border-[#e2e8f0]" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-between gap-3">
                <button
                  onClick={() => handleDownloadPdf(viewingStudent)}
                  className="px-4 py-2 text-sm font-medium text-[#3b82f6] bg-[#eff6ff] rounded-lg hover:bg-[#dbeafe] transition-colors flex items-center gap-2"
                >
                  <Download size={16} /> Download
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const id = viewingStudent.id;
                      setViewingStudent(null);
                      handleEdit(id);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors"
                  >
                    Edit Student
                  </button>
                  <button
                    onClick={() => setViewingStudent(null)}
                    className="px-4 py-2 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="page-card">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 bg-[#dbeafe] rounded-lg flex items-center justify-center">
              <Users className="text-[#3b82f6]" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1e293b]">Student Records</h2>
              <p className="text-sm text-[#64748b]">Complete student database</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-0 sm:min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full pl-9 pr-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all text-sm"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-all text-sm bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-scroll">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#e2e8f0]">
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Student</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Portal Password</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Course</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Seat</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Contact</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Joining Date</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Status</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b] text-center">Mark Inactive</th>
                  <th className="pb-3 text-sm font-medium text-[#64748b]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-sm text-[#64748b]">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student, index) => {
                    const status = statusConfig[student.status as keyof typeof statusConfig];
                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                        className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#f8fafc] transition-colors duration-100"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 ${getAvatarColor(student.name)} rounded-full flex items-center justify-center`}>
                              <span className="text-white text-xs font-semibold">{getInitials(student.name)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1e293b]">{student.name}</p>
                              <p className="text-xs text-[#94a3b8]">{student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm font-mono font-medium text-[#3b82f6]">{student.password || 'N/A'}</td>
                        <td className="py-4 text-sm text-[#1e293b]">{student.course}</td>
                        <td className="py-4 text-sm text-[#64748b]">{student.seat}</td>
                        <td className="py-4 text-sm text-[#64748b]">{student.contact}</td>
                        <td className="py-4 text-sm text-[#64748b]">{student.joiningDate}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 ${status?.bg || ''} ${status?.text || ''} text-xs font-semibold rounded-md`}>
                            {status?.label || student.status || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <input
                            type="checkbox"
                            checked={student.status === 'inactive'}
                            onChange={() => handleToggleInactive(student)}
                            className="w-4 h-4 cursor-pointer accent-[#3b82f6]"
                            title={student.status === 'inactive' ? 'Mark as Active' : 'Mark as Inactive'}
                          />
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleView(student)}
                              className="p-1.5 text-[#3b82f6] hover:bg-[#dbeafe] rounded-md transition-colors"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(student.id)}
                              className="p-1.5 text-[#eab308] hover:bg-[#fef9c3] rounded-md transition-colors"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id, student.name)}
                              className="p-1.5 text-[#ef4444] hover:bg-[#fee2e2] rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t border-[#e2e8f0]">
              <p className="text-sm text-[#64748b]">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredStudents.length)} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm text-[#64748b] border border-[#e2e8f0] rounded-md hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {/* Generate page numbers dynamically */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      currentPage === page 
                        ? 'text-white bg-[#3b82f6]' 
                        : 'text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc]'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm text-[#64748b] border border-[#e2e8f0] rounded-md hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

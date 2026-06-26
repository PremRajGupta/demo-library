import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopHeader from '../components/layout/TopHeader';
import { FileText, Download, FileSpreadsheet, TrendingUp, Users, IndianRupee, Calendar, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { reportApi } from '../lib/apiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const colorMap = {
  blue: { bg: 'bg-[#dbeafe]', icon: 'text-[#3b82f6]' },
  green: { bg: 'bg-[#dcfce7]', icon: 'text-[#22c55e]' },
  yellow: { bg: 'bg-[#fef9c3]', icon: 'text-[#eab308]' },
  red: { bg: 'bg-[#fee2e2]', icon: 'text-[#ef4444]' },
};

const iconMap: Record<string, typeof FileText> = {
  IndianRupee,
  Users,
  Calendar,
  TrendingUp,
};

const PERIOD_OPTIONS = [
  { value: 'thisWeek', label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear', label: 'This Year' },
];

type ReportSummary = {
  periodLabel: string;
  dateRange: string;
  totalCollected: number;
  totalPending: number;
  totalAdmissions: number;
  totalPayments: number;
  expiredCount: number;
  paymentStatus: { fullPaid: number; partial: number; unpaid: number };
};

const defaultSummary: ReportSummary = {
  periodLabel: 'This Month',
  dateRange: '',
  totalCollected: 0,
  totalPending: 0,
  totalAdmissions: 0,
  totalPayments: 0,
  expiredCount: 0,
  paymentStatus: { fullPaid: 0, partial: 0, unpaid: 0 },
};

type AdmissionStudent = {
  studentDisplayId: string;
  name: string;
  joiningDate: string;
  contact: string;
};

type AdmissionDetail = {
  course: string;
  count: number;
  students: AdmissionStudent[];
};

const formatReportDate = (value: string | Date) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

const escapeCsvCell = (value: unknown) => {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export default function Reports() {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState<{ month: string; collected: number }[]>([]);
  const [admissionData, setAdmissionData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [admissionDetails, setAdmissionDetails] = useState<AdmissionDetail[]>([]);
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [summary, setSummary] = useState<ReportSummary>(defaultSummary);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await reportApi.getReportsData(dateRange);
      setFeeData(data.feeData || []);
      setAdmissionData(data.admissionData || []);
      setAdmissionDetails(data.admissionDetails || []);
      setReportCards(data.reportCards || []);
      setSummary(data.summary || defaultSummary);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      showNotification('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  const getAdmissionExportRows = () => {
    const rows: (string | number)[][] = [];

    admissionDetails.forEach((group) => {
      group.students.forEach((student) => {
        rows.push([
          group.course,
          student.studentDisplayId,
          student.name,
          formatReportDate(student.joiningDate),
          student.contact || '-',
        ]);
      });
    });

    return rows;
  };

  const getReportData = (title: string) => {
    if (title === 'Fee Collection Report') {
      return {
        columns: ['Period', 'Collected (₹)'],
        rows: feeData.map((item) => [item.month, item.collected]),
      };
    }

    if (title === 'Pending Fees Report') {
      return {
        columns: ['Metric', 'Value'],
        rows: [
          ['Total Pending', summary.totalPending],
          ['Fully Paid Students', summary.paymentStatus.fullPaid],
          ['Partially Paid Students', summary.paymentStatus.partial],
          ['Unpaid Students', summary.paymentStatus.unpaid],
        ],
      };
    }

    if (title === 'Admission Report') {
      const rows = getAdmissionExportRows();
      return {
        columns: ['Course', 'Student ID', 'Student Name', 'Joining Date', 'Contact'],
        rows: rows.length > 0 ? rows : [['No admissions in this period', '-', '-', '-', '-']],
      };
    }

    const card = reportCards.find((c) => c.title === title);
    return {
      columns: ['Metric', 'Value'],
      rows: [[card?.subtitle || 'Data', card?.stat || 'N/A']],
    };
  };

  const handlePDF = (title: string) => {
    showNotification(`Generating PDF: ${title}...`);
    try {
      const doc = new jsPDF();
      doc.text(title, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US')}`, 14, 22);
      if (summary.dateRange) {
        doc.text(`Period: ${summary.periodLabel} (${summary.dateRange})`, 14, 28);
      }

      const data = getReportData(title);
      autoTable(doc, {
        startY: summary.dateRange ? 34 : 28,
        head: [data.columns],
        body: data.rows,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save(`${title.replace(/\s+/g, '_')}_${dateRange}.pdf`);
    } catch (e) {
      console.error(e);
      showNotification('Error generating PDF');
    }
  };

  const handleExcel = (title: string) => {
    showNotification(`Generating Excel: ${title}...`);
    try {
      const data = getReportData(title);
      const csvContent = [
        data.columns.map(escapeCsvCell).join(','),
        ...data.rows.map((row) => row.map(escapeCsvCell).join(',')),
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      showNotification('Error generating Excel');
    }
  };

  const chartData = feeData.length > 0 ? feeData : [{ month: 'No Data', collected: 0, pending: 0 }];
  const selectedPeriod = PERIOD_OPTIONS.find((option) => option.value === dateRange)?.label || 'This Month';

  return (
    <div>
      <TopHeader />

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 z-50 px-4 py-3 bg-[#3b82f6] text-white text-sm font-medium rounded-lg shadow-lg"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="page-card mb-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#dbeafe] rounded-lg flex items-center justify-center">
                <FileText className="text-[#3b82f6]" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#1e293b]">Reports</h2>
                <p className="text-sm text-[#64748b]">
                  {loading ? 'Loading analytics...' : `${summary.periodLabel} · ${summary.dateRange}`}
                </p>
              </div>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-all text-sm bg-white"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Collected', value: `₹${summary.totalCollected.toLocaleString('en-IN')}`, color: 'text-[#3b82f6]' },
            { label: 'Pending', value: `₹${summary.totalPending.toLocaleString('en-IN')}`, color: 'text-[#f59e0b]' },
            { label: 'Admissions', value: summary.totalAdmissions.toString(), color: 'text-[#22c55e]' },
            { label: 'Payments', value: summary.totalPayments.toString(), color: 'text-[#6366f1]' },
            { label: 'Fully Paid', value: summary.paymentStatus.fullPaid.toString(), color: 'text-[#22c55e]' },
            { label: 'Due / Unpaid', value: (summary.paymentStatus.partial + summary.paymentStatus.unpaid).toString(), color: 'text-[#ef4444]' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-[10px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <p className="text-xs text-[#64748b] mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{loading ? '—' : stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          {loading ? (
            <div className="col-span-full py-10 text-center text-[#64748b]">Loading report cards...</div>
          ) : (
            reportCards.map((card, index) => {
              const colors = colorMap[card.color as keyof typeof colorMap] || colorMap.blue;
              const Icon = iconMap[card.iconName] || FileText;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                  className="page-card"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={colors.icon} size={20} />
                    </div>
                    {card.trend && (
                      <span className="text-xs font-medium text-[#64748b] flex items-center gap-1">
                        <Clock size={12} />
                        {card.trend}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-[#1e293b] mb-1">{card.stat}</p>
                  <p className="text-sm text-[#64748b] mb-4">{card.subtitle}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePDF(card.title)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#3b82f6] bg-[#dbeafe] rounded-md hover:bg-[#bfdbfe] transition-colors"
                    >
                      <Download size={14} />
                      PDF
                    </button>
                    <button
                      onClick={() => handleExcel(card.title)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#22c55e] bg-[#dcfce7] rounded-md hover:bg-[#bbf7d0] transition-colors"
                    >
                      <FileSpreadsheet size={14} />
                      Excel
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="page-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1e293b]">Fee Collection</h3>
              <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded-md">{selectedPeriod}</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-[#64748b]">Loading chart...</div>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} interval={dateRange === 'thisYear' ? 0 : 'preserveStartEnd'} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name]}
                  />
                  <Bar dataKey="collected" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Collected" />
                  <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
                </BarChart>
              )}
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[#eff6ff] rounded-lg">
                <p className="text-xs text-[#64748b]">Total Collected</p>
                <p className="text-sm font-bold text-[#3b82f6]">₹{summary.totalCollected.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center p-3 bg-[#fffbeb] rounded-lg">
                <p className="text-xs text-[#64748b]">Total Pending</p>
                <p className="text-sm font-bold text-[#f59e0b]">₹{summary.totalPending.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="page-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1e293b]">Admission Distribution</h3>
              <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded-md">{summary.totalAdmissions} total</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-[#64748b]">Loading chart...</div>
              ) : admissionData.length > 0 ? (
                <PieChart>
                  <Pie data={admissionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4}>
                    {admissionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#64748b]">
                  <Users size={32} className="mb-2 opacity-40" />
                  <p className="text-sm">No admissions in {selectedPeriod.toLowerCase()}</p>
                </div>
              )}
            </ResponsiveContainer>
            {!loading && admissionData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {admissionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-[#64748b]">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

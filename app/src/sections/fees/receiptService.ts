import S from '../../lib/strings';
import { formatJoiningDate } from '../../lib/formatDate';
import { APP_LOGO_SRC } from '../../lib/brand';

export interface PaymentReceipt {
  id: string;
  rawId?: string;
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
  date: string;
  joiningDate?: string;
  notes?: string;
}

const loadImageAsDataUrl = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load logo');
  }
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read logo image'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read logo image'));
    reader.readAsDataURL(blob);
  });
};

const normalizeReceiptText = (text?: string) => {
  if (!text) return '';
  let normalized = String(text);
  normalized = normalized.replace(/&nbsp;|&#160;/gi, ' ');
  normalized = normalized.replace(/&amp;/gi, '&');
  normalized = normalized.replace(/<[^>]+>/g, '');
  normalized = normalized.replace(/&(?=[A-Za-z0-9])/g, '');
  normalized = normalized.replace(/\s{2,}/g, ' ');
  return normalized.trim();
};

export const generateReceiptPDF = async (payment: PaymentReceipt, logoUrl?: string) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const bodyWidth = pageWidth - margin * 2;
  const title = S.receiptTitle;
  let cursorY = 20;

  doc.setFillColor(26, 43, 74);
  doc.rect(0, 0, pageWidth, 28, 'F');

  if (logoUrl) {
    try {
      const logoData = await loadImageAsDataUrl(logoUrl);
      doc.addImage(logoData, 'PNG', margin, 6, 14, 14);
    } catch (error) {
      console.warn('Receipt logo load failed:', error);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(S.appName, margin + 20, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    [S.receiptOwnerName, S.receiptOwnerContact, S.receiptOwnerAddress],
    pageWidth - margin,
    12,
    {
      align: 'right',
      maxWidth: pageWidth - margin - (margin + 20),
      lineHeightFactor: 1.1,
    }
  );

  doc.setFontSize(9);
  doc.text(S.receiptSubtitle, margin + 20, 26);

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt No: ${payment.id}`, margin, 47);
  doc.text(`Date: ${payment.date}`, pageWidth - margin, 47, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, 52, pageWidth - margin, 52);

  cursorY = 58;
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, cursorY - 4, bodyWidth, 68, 2, 2, 'F');
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Details', margin + 2, cursorY + 2);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${payment.studentName}`, margin + 2, cursorY + 10);
  doc.text(`Student ID: ${payment.studentId}`, margin + 2, cursorY + 16);
  doc.text(`Father's Name: ${payment.fatherName || 'N/A'}`, margin + 2, cursorY + 22);
  doc.text(`Mobile: ${payment.studentMobile || 'N/A'}`, margin + 2, cursorY + 28);
  doc.text(`Seat Number: ${payment.seatNumber || 'N/A'}`, margin + 2, cursorY + 34);
  doc.text(`Course: ${payment.course || 'N/A'}`, margin + 2, cursorY + 40);
  doc.text(`Joining Date: ${formatJoiningDate(payment.joiningDate)}`, margin + 2, cursorY + 46);

  cursorY += 74;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, cursorY - 4, bodyWidth, 62, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Summary', margin + 2, cursorY + 2);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const paymentSummaryLines = [
    `Amount Paid: Rs. ${payment.amount.toFixed(2)}`,
    `For Month: ${payment.month}`,
  ];

  if ((payment.discountAmount || 0) > 0) {
    paymentSummaryLines.push(`Discount: Rs. ${(payment.discountAmount || 0).toFixed(2)}`);
    paymentSummaryLines.push(`Final Payment: Rs. ${(payment.feeCreditAmount ?? payment.amount).toFixed(2)}`);
  }

  if (payment.paymentMode) {
    paymentSummaryLines.push(`Payment Mode: ${payment.paymentMode}`);
  }

  if (payment.notes) {
    const cleanedNotes = normalizeReceiptText(payment.notes);
    const noteLines = doc.splitTextToSize(`Notes: ${cleanedNotes}`, bodyWidth - 16);
    paymentSummaryLines.push(...noteLines);
  }

  paymentSummaryLines.forEach((line, index) => {
    doc.text(line, margin + 2, cursorY + 10 + index * 5);
  });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(14);
  doc.text(`Rs. ${payment.amount.toFixed(2)}`, pageWidth - margin, cursorY + 16, { align: 'right' });

  cursorY += 73;
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(S.receiptThankYou, margin, cursorY);

  doc.save(S.receiptFileName(payment.studentId, payment.id));
};

export const getDefaultReceiptLogo = () => APP_LOGO_SRC;

export const generatePaginatedReceiptsPDF = async (payments: PaymentReceipt[], logoUrl?: string) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const bodyWidth = pageWidth - margin * 2;
  const recordsPerPage = 8;
  const totalPages = Math.ceil(payments.length / recordsPerPage);

  let logoData: string | undefined;
  if (logoUrl) {
    try {
      logoData = await loadImageAsDataUrl(logoUrl);
    } catch (error) {
      console.warn('Receipt logo load failed:', error);
    }
  }

  // Generate header for each page
  const addPageHeader = (pageNum: number) => {
    doc.setFillColor(26, 43, 74);
    doc.rect(0, 0, pageWidth, 20, 'F');

    if (logoData) {
      doc.addImage(logoData, 'PNG', margin, 4, 10, 10);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(S.appName, margin + 12, 10);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, 10, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, 22, pageWidth - margin, 22);
  };

  // Generate table header
  const addTableHeader = (startY: number) => {
    const colWidths = [15, 25, 20, 18, 15, 20, 20];
    const headers = ['Rcpt No', 'Student Name', 'Student ID', 'Amount', 'Month', 'Mode', 'Date'];
    let xPos = margin;

    doc.setFillColor(249, 250, 251);
    doc.rect(margin, startY - 5, bodyWidth, 8, 'F');
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    headers.forEach((header, idx) => {
      doc.text(header, xPos + 1, startY + 1);
      xPos += colWidths[idx];
    });

    doc.setLineWidth(0.3);
    doc.line(margin, startY + 3, pageWidth - margin, startY + 3);
  };

  // Process payments in pages
  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) {
      doc.addPage();
    }

    addPageHeader(pageIdx + 1);
    addTableHeader(30);

    const startIdx = pageIdx * recordsPerPage;
    const endIdx = Math.min(startIdx + recordsPerPage, payments.length);
    const pagePayments = payments.slice(startIdx, endIdx);

    const colWidths = [15, 25, 20, 18, 15, 20, 20];
    let yPos = 36;
    const rowHeight = 7;

    pagePayments.forEach((payment, idx) => {
      const xPos = margin;
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      const values = [
        payment.id.substring(0, 10),
        payment.studentName.substring(0, 20),
        payment.studentId.substring(0, 15),
        `Rs. ${payment.amount.toFixed(0)}`,
        payment.month.substring(0, 12),
        (payment.paymentMode || 'Cash').substring(0, 8),
        payment.date.substring(0, 10),
      ];

      let colXPos = xPos;
      values.forEach((value, colIdx) => {
        const maxWidth = colWidths[colIdx] - 2;
        const truncated = doc.splitTextToSize(value, maxWidth)[0] || '';
        doc.text(truncated, colXPos + 1, yPos + 2);
        colXPos += colWidths[colIdx];
      });

      yPos += rowHeight;

      // Add separator line
      if (idx < pagePayments.length - 1) {
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(margin, yPos - 1, pageWidth - margin, yPos - 1);
      }
    });

    // Add footer with totals
    const footerY = pageHeight - 20;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    const pageTotal = pagePayments.reduce((sum, p) => sum + p.amount, 0);
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Page Total: Rs. ${pageTotal.toFixed(2)}`, pageWidth - margin, footerY + 8, { align: 'right' });

    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, footerY + 8);
  }

  const fileName = `receipts_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

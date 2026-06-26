import S from './strings';

export interface PaymentReceipt {
  id: string;
  studentName: string;
  studentId: string;
  course?: string;
  amount: number;
  month: string;
  paymentMode?: string;
  date: string;
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

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(S.receiptSubtitle, margin + 20, 21);

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
  doc.roundedRect(margin, cursorY - 4, bodyWidth, 34, 2, 2, 'F');
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Details', margin + 2, cursorY + 2);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${payment.studentName}`, margin + 2, cursorY + 10);
  doc.text(`Student ID: ${payment.studentId}`, margin + 2, cursorY + 16);
  if (payment.course) {
    doc.text(`Course: ${payment.course}`, margin + 2, cursorY + 22);
  }

  cursorY += 44;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, cursorY - 4, bodyWidth, 46, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Summary', margin + 2, cursorY + 2);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const paymentSummaryLines = [
    `Amount Paid: Rs. ${payment.amount.toFixed(2)}`,
    `For Month: ${payment.month}`,
  ];
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

  cursorY += 57;
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(S.receiptThankYou, margin, cursorY);

  doc.save(S.receiptFileName(payment.studentId, payment.id));
};

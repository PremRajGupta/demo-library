const S = {
  appName: 'Demo Library',
  appShort: 'Galaxy',
  receiptTitle: 'Library Fee Receipt',
  receiptSubtitle: 'Library Management System',
  receiptOwnerName: 'Aman Kumar',
  receiptOwnerContact: '+91 7488252019',
  receiptOwnerAddress: 'DhiraBigha Sugaon Road, Tehtar, Bihar',
  receiptThankYou: 'Thank you for your payment. Please keep this receipt for your records.',
  receiptFileName: (studentId: string, id: string) => `${studentId}-${id}.pdf`,

  // FeeCollection UI
  totalDueLabel: 'Total Due Fees',
  payCollectedMsg: (amount: number, name: string) => `₹${amount} collected from ${name}!`,
  fillFieldsError: 'Please fill all required fields!',
  invalidAmountError: 'Please enter a valid amount!',
  exceedAmountError: "Payment amount cannot exceed due amount!",
  paymentRecordedReceiptFailed: 'Payment recorded but receipt generation failed.',

  // PdfGenerator
  pdfPageTitle: 'Paid Fee Receipts',
  pdfPageSubtitle: 'Receipt Generator',
  pdfEmpty: 'No paid fee receipts found. Record payments from Fee Collection first.',
  searchPlaceholder: 'Search by name, student ID, or month',
  downloadButton: 'Download',
  receiptDownloadSuccess: 'Receipt downloaded successfully.',
  receiptDownloadFailed: 'Failed to generate receipt. Try again.',

  // Sidebar labels (simple)
  sidebar: {
    dashboard: 'Dashboard',
    admission: 'Admission',
    fees: 'Fees',
    receipts: 'Receipts',
    seatMap: 'Seat Map',
    seatMatrix: 'Seat Matrix',
    requests: 'Requests',
    students: 'Students',
    reports: 'Reports',
    website: 'Website',
  }
} as const;

export default S;

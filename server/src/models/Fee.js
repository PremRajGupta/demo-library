import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  organizationId: { type: String, required: true },
  branchId: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentDisplayId: { type: String, required: true }, // The string ID (e.g., STU1234)
  studentName: { type: String, required: true },
  receiptNumber: { type: String }, // e.g. GalaxyPR260501
  amount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  feeCreditAmount: { type: Number },
  month: { type: String, required: true },
  paymentMode: { type: String, enum: ['cash', 'upi', 'card'], default: 'cash' },
  notes: { type: String },
  paymentDate: { type: Date, default: Date.now },
  // Advance payment tracking
  isAdvancePayment: { type: Boolean, default: false }, // Is this an advance payment?
  monthlyFee: { type: Number }, // Monthly fee amount for calculating validity
  monthsCovered: { type: Number }, // How many months this advance covers
  validUntilDate: { type: Date }, // Date until payment is valid
  advanceStartDate: { type: Date }, // When does the advance validity start?
}, {
  timestamps: true
});

// Indexes for efficient queries
feeSchema.index({ organizationId: 1, branchId: 1 });
feeSchema.index({ studentDisplayId: 1, branchId: 1 });
feeSchema.index({ branchId: 1, createdAt: -1 });
feeSchema.index({ month: 1, branchId: 1 });
feeSchema.index({ receiptNumber: 1 }, { unique: true, sparse: true });

export default mongoose.model('Fee', feeSchema);

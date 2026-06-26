import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  organizationId: { type: String, required: true },
  branchId: { type: String, required: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  studentName: { type: String, default: null },
  assignedDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null }
}, {
  timestamps: true
});

// Composite unique index: each branch has unique seats
seatSchema.index({ seatNumber: 1, branchId: 1, organizationId: 1 }, { unique: true });
seatSchema.index({ branchId: 1, status: 1 });
seatSchema.index({ organizationId: 1, branchId: 1 });

export default mongoose.model('Seat', seatSchema);

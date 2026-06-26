import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  organizationId: { type: String, required: true },
  branchId: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentDisplayId: { type: String, required: true },
  studentName: { type: String, required: true },
  requestType: { type: String, enum: ['seat_change', 'leave', 'other'], required: true },
  details: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
requestSchema.index({ organizationId: 1, branchId: 1 });
requestSchema.index({ branchId: 1, status: 1 });
requestSchema.index({ branchId: 1, createdAt: -1 });

export default mongoose.model('Request', requestSchema);

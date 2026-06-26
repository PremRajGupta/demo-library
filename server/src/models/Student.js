import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true }, // e.g., STUrimpi_4827
  organizationId: { type: String, required: true }, // Which organization
  branchId: { type: String, required: true }, // Which branch
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String },
  mobile: {
    type: String,
    required: true,
    validate: {
      validator: (value) => /^\d{10}$/.test(String(value || '')),
      message: 'Mobile number must be exactly 10 digits.',
    },
  },
  parentMobile: {
    type: String,
    validate: {
      validator: (value) => !value || /^\d{10}$/.test(String(value)),
      message: 'Parent mobile number must be exactly 10 digits.',
    },
  },
  email: { type: String, required: true },
  address: { type: String, required: true },
  course: { type: String, required: true },
  seatNumber: { type: String },
  timeShift: { type: String }, // 4hours, 6hours, 8hours, 12hours, 24hours, night, other
  customShiftHours: { type: Number }, // hours when timeShift is "other"
  feeAmount: { type: Number, required: true },
  paymentMode: { type: String },
  aadharNumber: {
    type: String,
    validate: {
      validator: (value) => !value || /^\d{12}$/.test(String(value)),
      message: 'Aadhaar number must be exactly 12 digits.',
    },
  },
  // Cloudinary image storage
  photo: { type: String }, // Cloudinary URL
  photoPublicId: { type: String }, // For deletion from Cloudinary
  aadharFront: { type: String }, // Cloudinary URL
  aadharFrontPublicId: { type: String },
  aadharBack: { type: String }, // Cloudinary URL
  aadharBackPublicId: { type: String },
  joiningDate: { type: Date, default: Date.now },
  admissionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
  password: { type: String }
}, {
  timestamps: true
});

// Indexes for fast queries
studentSchema.index({ organizationId: 1, branchId: 1 });
studentSchema.index({ studentId: 1, organizationId: 1 }, { unique: true });
studentSchema.index({ email: 1, organizationId: 1 });
studentSchema.index({ branchId: 1, status: 1 });
studentSchema.index({ createdAt: -1 });

export default mongoose.model('Student', studentSchema);

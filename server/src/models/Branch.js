import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  branchId: { type: String, required: true }, // branch-delhi-central
  organizationId: { type: String, required: true }, // Which organization
  name: { type: String, required: true }, // Delhi Central
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  pincode: { type: String },
  
  // Contact info
  phone: { type: String },
  email: { type: String },
  manager: { type: String }, // Branch manager name
  managerPhone: { type: String },
  
  // Capacity
  totalSeats: { type: Number, default: 100 },
  occupiedSeats: { type: Number, default: 0 },
  
  // Settings
  operatingHours: {
    opening: { type: String }, // "09:00"
    closing: { type: String }  // "21:00"
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'under_maintenance'], 
    default: 'active' 
  },
  
  // Metadata
  studentCount: { type: Number, default: 0 },
  monthlyFeeCollected: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Ensure unique branchId per organization
branchSchema.index({ branchId: 1, organizationId: 1 }, { unique: true });
branchSchema.index({ organizationId: 1 });
branchSchema.index({ city: 1 });

export default mongoose.model('Branch', branchSchema);

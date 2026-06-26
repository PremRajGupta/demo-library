import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  organizationId: { type: String, required: true, unique: true }, // galaxy-lib-001
  name: { type: String, required: true }, // Demo Library
  email: { type: String, required: true },
  phone: { type: String },
  website: { type: String },
  address: { type: String },
  city: { type: String },
  
  // Cloudinary settings
  cloudinaryFolder: { type: String }, // For organizing images
  
  // Subscription settings
  subscriptionPlan: { 
    type: String, 
    enum: ['starter', 'professional', 'enterprise'], 
    default: 'starter' 
  },
  maxBranches: { type: Number, default: 1 },
  maxStudents: { type: Number, default: 1000 },
  maxStorage: { type: Number, default: 5 }, // GB
  
  // Features
  features: {
    multipleWebsites: { type: Boolean, default: false },
    mobileApp: { type: Boolean, default: false },
    advancedReporting: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false }
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  
  // Admin info
  adminEmail: { type: String },
  adminPhone: { type: String }
}, {
  timestamps: true
});

organizationSchema.index({ organizationId: 1 });
organizationSchema.index({ email: 1 });

export default mongoose.model('Organization', organizationSchema);

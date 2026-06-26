import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  apiKey: { type: String, required: true, unique: true }, // sk_live_abc123...
  organizationId: { type: String, required: true },
  
  // Client info
  clientName: { type: String }, // "Main Website", "Mobile App", etc.
  clientType: { 
    type: String, 
    enum: ['web', 'mobile_ios', 'mobile_android', 'admin', 'third_party'],
    required: true 
  },
  
  // Permissions
  permissions: [{ type: String }], // ['students:read', 'fees:write', 'seats:read']
  
  // Rate limiting
  rateLimit: { type: Number, default: 1000 }, // requests per hour
  ratePeriod: { type: String, enum: ['minute', 'hour', 'day'], default: 'hour' },
  
  // Allowed domains/IPs
  allowedDomains: [{ type: String }],
  allowedIPs: [{ type: String }],
  
  // Status
  isActive: { type: Boolean, default: true },
  isRevoked: { type: Boolean, default: false },
  
  // Usage tracking
  requestCount: { type: Number, default: 0 },
  lastUsedAt: { type: Date },
  
  // Expiry
  expiresAt: { type: Date } // null = never expires
}, {
  timestamps: true
});

apiKeySchema.index({ apiKey: 1 });
apiKeySchema.index({ organizationId: 1 });
apiKeySchema.index({ clientType: 1 });

export default mongoose.model('ApiKey', apiKeySchema);

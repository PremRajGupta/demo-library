import mongoose from 'mongoose';

const publicStatsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'landing', unique: true },
    visitorCount: { type: Number, default: 300 },
    admissionBaseOffset: { type: Number, default: 300 },
    totalAdmissionsEver: { type: Number, default: 300 },
  },
  { timestamps: true }
);

export default mongoose.model('PublicStats', publicStatsSchema);

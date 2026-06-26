import mongoose from 'mongoose';

const pageVisitSchema = new mongoose.Schema(
  {
    visitorKey: { type: String, required: true },
    visitDate: { type: String, required: true },
  },
  { timestamps: true }
);

pageVisitSchema.index({ visitorKey: 1, visitDate: 1 }, { unique: true });

export default mongoose.model('PageVisit', pageVisitSchema);

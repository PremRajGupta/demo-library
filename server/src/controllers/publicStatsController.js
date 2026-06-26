import Student from '../models/Student.js';
import PublicStats from '../models/PublicStats.js';
import PageVisit from '../models/PageVisit.js';
import { getSeatStats } from '../utils/seatLayout.js';

const DEFAULT_BASE = 600;

const getOrCreatePublicStats = async () => {
  let doc = await PublicStats.findOne({ key: 'landing' });
  if (!doc) {
    doc = await PublicStats.create({
      key: 'landing',
      visitorCount: DEFAULT_BASE,
      admissionBaseOffset: DEFAULT_BASE,
    });
  } else if (doc.visitorCount < DEFAULT_BASE) {
    doc.visitorCount = DEFAULT_BASE;
    doc.admissionBaseOffset = DEFAULT_BASE;
    await doc.save();
    
    // Clear old page visits from storage to save space
    await PageVisit.deleteMany({});
  }
  return doc;
};

const getClientKey = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  return `${ip}::${ua.slice(0, 80)}`;
};

export const getPublicStats = async (req, res) => {
  try {
    const publicStats = await getOrCreatePublicStats();
    const base = publicStats.admissionBaseOffset ?? DEFAULT_BASE;

    const [activeStudents, totalStudents, seatStats] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      Student.countDocuments(),
      getSeatStats(),
    ]);

    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      visitorCount: publicStats.visitorCount ?? base,
      totalAdmissions: publicStats.totalAdmissionsEver ?? base,
      activeStudents,
      totalStudents,
      admissionBaseOffset: base,
      availableSeats: seatStats.availableSeats,
      occupiedSeats: seatStats.occupiedSeats,
      totalSeats: seatStats.totalSeats,
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ message: 'Error fetching public stats', error: error.message });
  }
};

export const recordPublicVisit = async (req, res) => {
  try {
    const publicStats = await getOrCreatePublicStats();
    const visitDate = new Date().toISOString().slice(0, 10);
    const visitorKey = getClientKey(req);

    const existing = await PageVisit.findOne({ visitorKey, visitDate });
    if (!existing) {
      await PageVisit.create({ visitorKey, visitDate });
      publicStats.visitorCount = (publicStats.visitorCount ?? DEFAULT_BASE) + 1;
      await publicStats.save();
    }

    const base = publicStats.admissionBaseOffset ?? DEFAULT_BASE;
    const activeStudents = await Student.countDocuments({ status: 'active' });
    const seatStats = await getSeatStats();

    res.status(200).json({
      visitorCount: publicStats.visitorCount,
      totalAdmissions: publicStats.totalAdmissionsEver ?? base,
      activeStudents,
      availableSeats: seatStats.availableSeats,
      occupiedSeats: seatStats.occupiedSeats,
      totalSeats: seatStats.totalSeats,
    });
  } catch (error) {
    console.error('Error recording visit:', error);
    res.status(500).json({ message: 'Error recording visit', error: error.message });
  }
};

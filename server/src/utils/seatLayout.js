import Seat from '../models/Seat.js';
import Student from '../models/Student.js';

export const SEAT_COLUMNS = ['A', 'B', 'C', 'D', 'G', 'N', 'Ex'];

export const SEAT_CONFIG = {
  A: 25,
  B: 25,
  C: 20,
  D: 20,
  G: 20,
  N: 60,
  Ex: 30
};

export const TOTAL_SEAT_CAPACITY = 200;

export const generateAllSeatNumbers = () => {
  const seats = [];
  for (const column of SEAT_COLUMNS) {
    const count = SEAT_CONFIG[column] || 0;
    for (let row = 1; row <= count; row += 1) {
      seats.push(`${column}${row}`);
    }
  }
  return seats;
};

const LIBRARY_SEAT_SET = new Set(generateAllSeatNumbers());

export const isLibrarySeatNumber = (seatNumber) => {
  const normalized = String(seatNumber || '').trim();
  return LIBRARY_SEAT_SET.has(normalized);
};

/** Occupied = active students holding a valid library seat (source of truth for admission). */
export const getOccupiedSeatNumbers = async () => {
  const occupied = new Set();

  const students = await Student.find({
    status: 'active',
    seatNumber: { $exists: true, $nin: ['', '--', null, 'other'] },
  }).select('seatNumber');

  students.forEach((student) => {
    const seat = String(student.seatNumber).trim();
    if (isLibrarySeatNumber(seat)) {
      occupied.add(seat);
    }
  });

  return occupied;
};

export const getSeatStats = async () => {
  const occupied = await getOccupiedSeatNumbers();
  const occupiedSeats = occupied.size;
  const totalSeats = TOTAL_SEAT_CAPACITY;
  const availableSeats = Math.max(totalSeats - occupiedSeats, 0);

  return { totalSeats, occupiedSeats, availableSeats };
};

export const getAvailableSeatNumbers = async () => {
  const occupied = await getOccupiedSeatNumbers();
  return generateAllSeatNumbers().filter((seatNumber) => !occupied.has(seatNumber));
};

export const isSeatAvailable = async (seatNumber) => {
  const normalized = String(seatNumber || '').trim();
  if (!normalized || normalized === '--') return true;
  if (!isLibrarySeatNumber(normalized)) return true;
  const occupied = await getOccupiedSeatNumbers();
  return !occupied.has(normalized);
};

/** Keep Seat collection in sync with active student assignments. */
export const syncSeatRecordForAssignment = async ({
  seatNumber,
  organizationId,
  branchId,
  studentId,
  studentName,
  status,
}) => {
  const normalized = String(seatNumber || '').trim();
  if (!isLibrarySeatNumber(normalized)) return;

  if (status === 'available') {
    await Seat.findOneAndUpdate(
      { seatNumber: normalized, organizationId, branchId },
      {
        status: 'available',
        studentId: null,
        studentName: null,
        assignedDate: null,
        expiryDate: null,
      },
      { upsert: true, new: true }
    );
    return;
  }

  await Seat.findOneAndUpdate(
    { seatNumber: normalized, organizationId, branchId },
    {
      status: 'occupied',
      studentId,
      studentName,
      assignedDate: new Date(),
    },
    { upsert: true, new: true }
  );
};

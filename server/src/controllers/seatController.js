import mongoose from 'mongoose';
import Seat from '../models/Seat.js';
import Student from '../models/Student.js';
import { getAvailableSeatNumbers, getSeatStats } from '../utils/seatLayout.js';

export const getAvailableSeats = async (req, res) => {
  try {
    const [seats, stats] = await Promise.all([getAvailableSeatNumbers(), getSeatStats()]);
    res.status(200).json({ ...stats, seats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available seats', error: error.message });
  }
};

export const getSeats = async (req, res) => {
  try {
    const seats = await Seat.find();
    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seats', error: error.message });
  }
};

export const updateSeatStatus = async (req, res) => {
  try {
    const { status, studentDisplayId } = req.body;
    const seatId = req.params.id; // Either _id or seatNumber

    let updateData = { status };

    if (status === 'occupied' && studentDisplayId) {
      const student = await Student.findOne({ studentId: studentDisplayId });
      if (student) {
        updateData.studentId = student._id;
        updateData.studentName = student.name;
        updateData.assignedDate = new Date();
      }
    } else if (status === 'available') {
      updateData.studentId = null;
      updateData.studentName = null;
      updateData.assignedDate = null;
      updateData.expiryDate = null;
    }

    const updatedSeat = await Seat.findOneAndUpdate(
      { $or: [{ _id: mongoose.Types.ObjectId.isValid(seatId) ? seatId : null }, { seatNumber: seatId }] },
      updateData,
      { new: true, upsert: true } // Creates seat if it doesn't exist
    );

    res.status(200).json(updatedSeat);
  } catch (error) {
    res.status(400).json({ message: 'Error updating seat', error: error.message });
  }
};

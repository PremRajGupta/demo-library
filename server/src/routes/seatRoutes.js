import express from 'express';
import { getSeats, getAvailableSeats, updateSeatStatus } from '../controllers/seatController.js';

const router = express.Router();

router.get('/available', getAvailableSeats);
router.get('/', getSeats);
router.put('/:id', updateSeatStatus);

export default router;

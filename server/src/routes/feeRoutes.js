import express from 'express';
import { getFees, createFee, updateFee, markAdvancePayment, getStudentPaymentValidity } from '../controllers/feeController.js';

const router = express.Router();

// Student payment validity routes (must come before :id routes)
router.get('/student/:studentDisplayId/validity', getStudentPaymentValidity);

router.get('/', getFees);
router.post('/', createFee);
router.put('/:id', updateFee);

// Advance payment routes
router.post('/:id/mark-advance', markAdvancePayment);

export default router;

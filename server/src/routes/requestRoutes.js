import express from 'express';
import { getRequests, updateRequestStatus } from '../controllers/requestController.js';

const router = express.Router();

router.get('/', getRequests);
router.put('/:id', updateRequestStatus);

export default router;

import express from 'express';
import { updateSiteContent } from '../controllers/siteContentController.js';

const router = express.Router();

router.put('/', updateSiteContent);

export default router;

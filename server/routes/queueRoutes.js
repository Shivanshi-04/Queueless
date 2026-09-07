import express from 'express';
import { getQueueStats, resetQueueData } from '../controllers/queueController.js';

const router = express.Router();

router.get('/stats', getQueueStats);
router.post('/reset', resetQueueData);

export default router;

import express from 'express';
import {
  getCounters,
  createCounter,
  updateCounterStatus,
  deleteCounter,
  callNext,
  recallToken,
  startService,
  completeService,
  markNoShow,
} from '../controllers/counterController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCounters);
router.post('/', optionalAuth, createCounter);
router.patch('/:id', updateCounterStatus);
router.patch('/:id/status', updateCounterStatus);
router.delete('/:id', deleteCounter);
router.post('/:id/call-next', callNext);
router.post('/:id/recall', recallToken);
router.post('/:id/start-service', startService);
router.post('/:id/complete', completeService);
router.post('/:id/no-show', markNoShow);

export default router;

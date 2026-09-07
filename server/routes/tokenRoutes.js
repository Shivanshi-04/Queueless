import express from 'express';
import {
  getTokens,
  createToken,
  getMyTokens,
  getTokenById,
  cancelToken,
} from '../controllers/tokenController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getTokens);
router.post('/', optionalAuth, createToken);
router.get('/my', protect, getMyTokens);
router.get('/:id', getTokenById);
router.delete('/:id', optionalAuth, cancelToken);

export default router;

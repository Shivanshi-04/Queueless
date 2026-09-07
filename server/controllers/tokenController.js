import Token from '../models/Token.js';
import Counter from '../models/Counter.js';
import { emitQueueEvent } from '../utils/socket.js';

// Priority prefix map
const PRIORITY_PREFIXES = {
  urgent: 'E',
  vip: 'V',
  senior_disabled: 'S',
  regular: 'A',
};

// Priority numerical weight for in-memory sorting
const PRIORITY_WEIGHTS = {
  urgent: 4,
  vip: 3,
  senior_disabled: 2,
  regular: 1,
};

// Helper: Calculate wait estimate in minutes
const calculateEstimatedWait = async (serviceId, priority) => {
  const activeCounters = await Counter.find({
    status: 'active',
    supportedServiceIds: serviceId,
  });

  const avgCounterTime =
    activeCounters.length > 0
      ? activeCounters.reduce((acc, c) => acc + (c.averageServiceMinutes || 5), 0) / activeCounters.length
      : 5;

  const effectiveCapacity = Math.max(1, activeCounters.length);

  // Count waiting tokens with equal or higher priority
  const higherOrEqualPriority = Object.keys(PRIORITY_WEIGHTS).filter(
    (p) => PRIORITY_WEIGHTS[p] >= (PRIORITY_WEIGHTS[priority] || 1)
  );

  const waitingAhead = await Token.countDocuments({
    status: 'waiting',
    serviceId,
    priority: { $in: higherOrEqualPriority },
  });

  return Math.max(2, Math.round(((waitingAhead + 1) * avgCounterTime) / effectiveCapacity));
};

// @desc    Get all tokens (with optional filters)
// @route   GET /api/tokens
// @access  Public
export const getTokens = async (req, res) => {
  try {
    const { status, serviceId, priority } = req.query;
    const filter = {};

    if (status) {
      if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }

    if (serviceId) {
      filter.serviceId = serviceId;
    }

    if (priority) {
      filter.priority = priority;
    }

    const tokens = await Token.find(filter)
      .populate('counterId', 'name code staffName status')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: tokens.length,
      data: tokens,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tokens.',
      error: error.message,
    });
  }
};

// @desc    Create a new queue token
// @route   POST /api/tokens
// @access  Public / Optional Auth
export const createToken = async (req, res) => {
  try {
    const {
      customerName,
      contact,
      serviceId,
      serviceName,
      priority = 'regular',
      notes = '',
    } = req.body;

    if (!customerName || !serviceId || !serviceName) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, serviceId, and serviceName are required.',
      });
    }

    // Generate unique token number
    const prefix = PRIORITY_PREFIXES[priority] || 'A';
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const countToday = await Token.countDocuments({
      createdAt: { $gte: todayStart },
      priority,
    });

    const tokenSeq = 101 + countToday;
    const tokenNumber = `${prefix}-${tokenSeq}`;

    // Calculate dynamic estimated wait
    const estimatedWaitMins = await calculateEstimatedWait(serviceId, priority);

    const token = await Token.create({
      tokenNumber,
      customerName,
      contact: contact || '',
      serviceId,
      serviceName,
      priority,
      status: 'waiting',
      notes,
      estimatedWaitMins,
      userId: req.user ? req.user._id : null,
    });

    // Broadcast socket event
    emitQueueEvent('queue:token_created', token);
    emitQueueEvent('queue:sync', { type: 'token_created', token });

    return res.status(201).json({
      success: true,
      data: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create token.',
      error: error.message,
    });
  }
};

// @desc    Get tokens belonging to logged-in user
// @route   GET /api/tokens/my
// @access  Private
export const getMyTokens = async (req, res) => {
  try {
    const tokens = await Token.find({ userId: req.user._id })
      .populate('counterId', 'name code staffName status')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: tokens.length,
      data: tokens,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user tokens.',
      error: error.message,
    });
  }
};

// @desc    Get single token by ID
// @route   GET /api/tokens/:id
// @access  Public
export const getTokenById = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id)
      .populate('counterId', 'name code staffName status');

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found.',
      });
    }

    // Calculate live position in queue if waiting
    let queuePosition = null;
    if (token.status === 'waiting') {
      const allWaiting = await Token.find({ status: 'waiting' });
      // Sort using priority weight DESC, then createdAt ASC
      allWaiting.sort((a, b) => {
        const weightDiff = (PRIORITY_WEIGHTS[b.priority] || 1) - (PRIORITY_WEIGHTS[a.priority] || 1);
        if (weightDiff !== 0) return weightDiff;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      queuePosition = allWaiting.findIndex((t) => t._id.toString() === token._id.toString()) + 1;
    }

    return res.json({
      success: true,
      data: token,
      queuePosition: queuePosition || 1,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching token.',
      error: error.message,
    });
  }
};

// @desc    Cancel / delete token
// @route   DELETE /api/tokens/:id
// @access  Public / Protected
export const cancelToken = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found.',
      });
    }

    token.status = 'cancelled';
    await token.save();

    // If counter was serving this token, release it
    if (token.counterId) {
      await Counter.findByIdAndUpdate(token.counterId, {
        currentServingTokenId: null,
      });
    }

    emitQueueEvent('queue:sync', { type: 'token_cancelled', tokenId: token._id });

    return res.json({
      success: true,
      message: 'Token cancelled successfully.',
      data: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel token.',
      error: error.message,
    });
  }
};

import Counter from '../models/Counter.js';
import Token from '../models/Token.js';
import { emitQueueEvent } from '../utils/socket.js';

const PRIORITY_WEIGHTS = {
  urgent: 4,
  vip: 3,
  senior_disabled: 2,
  regular: 1,
};

// @desc    Get all counters
// @route   GET /api/counters
// @access  Public
export const getCounters = async (req, res) => {
  try {
    const counters = await Counter.find()
      .populate('currentServingTokenId')
      .sort({ code: 1 });

    return res.json({
      success: true,
      count: counters.length,
      data: counters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve counters.',
      error: error.message,
    });
  }
};

// @desc    Create new counter
// @route   POST /api/counters
// @access  Protected (Admin / LoungeManager)
export const createCounter = async (req, res) => {
  try {
    const { name, code, staffName, supportedServiceIds, averageServiceMinutes } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and Code are required.',
      });
    }

    const existing = await Counter.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Counter with code ${code.toUpperCase()} already exists.`,
      });
    }

    const counter = await Counter.create({
      name,
      code: code.toUpperCase().trim(),
      staffName: staffName || '',
      supportedServiceIds: supportedServiceIds || ['general', 'billing', 'consultation', 'vip_services'],
      averageServiceMinutes: averageServiceMinutes || 5,
    });

    emitQueueEvent('queue:sync', { type: 'counter_created', counter });

    return res.status(201).json({
      success: true,
      data: counter,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create counter.',
      error: error.message,
    });
  }
};

// @desc    Update counter status
// @route   PATCH /api/counters/:id/status
// @access  Public / Staff
export const updateCounterStatus = async (req, res) => {
  try {
    const { status, staffName } = req.body;

    const counter = await Counter.findById(req.params.id);
    if (!counter) {
      return res.status(404).json({
        success: false,
        message: 'Counter not found.',
      });
    }

    if (status) counter.status = status;
    if (staffName !== undefined) counter.staffName = staffName;

    await counter.save();
    await counter.populate('currentServingTokenId');

    emitQueueEvent('queue:sync', { type: 'counter_status_updated', counter });

    return res.json({
      success: true,
      data: counter,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update counter status.',
      error: error.message,
    });
  }
};

// @desc    Call next token for counter
// @route   POST /api/counters/:id/call-next
// @access  Public / Staff
export const callNext = async (req, res) => {
  try {
    const counter = await Counter.findById(req.params.id);
    if (!counter) {
      return res.status(404).json({
        success: false,
        message: 'Counter not found.',
      });
    }

    if (counter.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot call next token because counter is currently ${counter.status}.`,
      });
    }

    // Find all waiting tokens that match this counter's supported services
    const candidateTokens = await Token.find({
      status: 'waiting',
      serviceId: { $in: counter.supportedServiceIds },
    });

    if (candidateTokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No waiting tokens in queue matching this counter’s services.',
      });
    }

    // Sort by priority weight DESC, then createdAt ASC
    candidateTokens.sort((a, b) => {
      const weightDiff = (PRIORITY_WEIGHTS[b.priority] || 1) - (PRIORITY_WEIGHTS[a.priority] || 1);
      if (weightDiff !== 0) return weightDiff;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const nextToken = candidateTokens[0];

    // Update token
    nextToken.status = 'called';
    nextToken.counterId = counter._id;
    nextToken.counterName = counter.name;
    nextToken.staffName = counter.staffName || 'Staff';
    nextToken.calledAt = new Date();
    nextToken.estimatedWaitMins = 0;
    await nextToken.save();

    // Update counter
    counter.currentServingTokenId = nextToken._id;
    await counter.save();
    await counter.populate('currentServingTokenId');

    const payload = {
      token: nextToken,
      counter,
      message: `Token ${nextToken.tokenNumber} called to ${counter.name}`,
    };

    // Emit live call event for audio announcements and screens
    emitQueueEvent('queue:token_called', payload);
    emitQueueEvent('queue:sync', { type: 'token_called', ...payload });

    return res.json({
      success: true,
      message: `Called token ${nextToken.tokenNumber}`,
      data: {
        token: nextToken,
        counter,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to call next token.',
      error: error.message,
    });
  }
};

// @desc    Recall current token (broadcast reminder alert)
// @route   POST /api/counters/:id/recall
// @access  Public / Staff
export const recallToken = async (req, res) => {
  try {
    const counter = await Counter.findById(req.params.id).populate('currentServingTokenId');
    if (!counter) {
      return res.status(404).json({
        success: false,
        message: 'Counter not found.',
      });
    }

    if (!counter.currentServingTokenId) {
      return res.status(400).json({
        success: false,
        message: 'No token is currently assigned to this counter.',
      });
    }

    const token = counter.currentServingTokenId;

    const payload = {
      token,
      counter,
      recallTime: new Date(),
      message: `Recall: Token ${token.tokenNumber}, please proceed to ${counter.name}`,
    };

    emitQueueEvent('queue:token_recalled', payload);

    return res.json({
      success: true,
      message: `Recalled token ${token.tokenNumber}`,
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to recall token.',
      error: error.message,
    });
  }
};

// @desc    Start service for current token
// @route   POST /api/counters/:id/start-service
// @access  Public / Staff
export const startService = async (req, res) => {
  try {
    const counter = await Counter.findById(req.params.id);
    if (!counter || !counter.currentServingTokenId) {
      return res.status(400).json({
        success: false,
        message: 'No token currently active at this counter to start service.',
      });
    }

    const token = await Token.findById(counter.currentServingTokenId);
    if (!token) {
      counter.currentServingTokenId = null;
      await counter.save();
      return res.status(404).json({
        success: false,
        message: 'Assigned token not found.',
      });
    }

    token.status = 'in_service';
    token.serviceStartedAt = new Date();
    await token.save();

    await counter.populate('currentServingTokenId');

    emitQueueEvent('queue:sync', { type: 'service_started', token, counter });

    return res.json({
      success: true,
      message: `Service started for token ${token.tokenNumber}`,
      data: { token, counter },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to start service.',
      error: error.message,
    });
  }
};

// @desc    Complete service for current token
// @route   POST /api/counters/:id/complete
// @access  Public / Staff
export const completeService = async (req, res) => {
  try {
    const counter = await Counter.findById(req.params.id);
    if (!counter || !counter.currentServingTokenId) {
      return res.status(400).json({
        success: false,
        message: 'No token currently at this counter to complete.',
      });
    }

    const token = await Token.findById(counter.currentServingTokenId);
    if (token) {
      token.status = 'completed';
      token.completedAt = new Date();
      await token.save();
    }

    counter.servedCountToday = (counter.servedCountToday || 0) + 1;
    counter.currentServingTokenId = null;
    await counter.save();

    emitQueueEvent('queue:sync', {
      type: 'service_completed',
      tokenId: token ? token._id : null,
      counterId: counter._id,
    });

    return res.json({
      success: true,
      message: `Service completed for token ${token ? token.tokenNumber : ''}`,
      data: { token, counter },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to complete service.',
      error: error.message,
    });
  }
};

// @desc    Mark current token as no-show
// @route   POST /api/counters/:id/no-show
// @access  Public / Staff
export const markNoShow = async (req, res) => {
  try {
    const counter = await Counter.findById(req.params.id);
    if (!counter || !counter.currentServingTokenId) {
      return res.status(400).json({
        success: false,
        message: 'No token currently at this counter to mark as no-show.',
      });
    }

    const token = await Token.findById(counter.currentServingTokenId);
    if (token) {
      token.status = 'no_show';
      token.completedAt = new Date();
      await token.save();
    }

    counter.currentServingTokenId = null;
    await counter.save();

    emitQueueEvent('queue:sync', {
      type: 'no_show',
      tokenId: token ? token._id : null,
      counterId: counter._id,
    });

    return res.json({
      success: true,
      message: `Marked token ${token ? token.tokenNumber : ''} as no-show`,
      data: { token, counter },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark as no-show.',
      error: error.message,
    });
  }
};

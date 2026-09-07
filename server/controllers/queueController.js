import Token from '../models/Token.js';
import Counter from '../models/Counter.js';
import { seedDatabase } from '../config/db.js';
import { emitQueueEvent } from '../utils/socket.js';

// @desc    Get comprehensive queue and lounge stats
// @route   GET /api/queue/stats
// @access  Public
export const getQueueStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      waitingCount,
      calledCount,
      inServiceCount,
      completedTodayCount,
      noShowTodayCount,
      counters,
      completedTokens,
    ] = await Promise.all([
      Token.countDocuments({ status: 'waiting' }),
      Token.countDocuments({ status: 'called' }),
      Token.countDocuments({ status: 'in_service' }),
      Token.countDocuments({ status: 'completed', updatedAt: { $gte: todayStart } }),
      Token.countDocuments({ status: 'no_show', updatedAt: { $gte: todayStart } }),
      Counter.find().populate('currentServingTokenId'),
      Token.find({ status: 'completed', completedAt: { $exists: true } }),
    ]);

    // Compute average wait time in minutes for completed tokens
    let totalWaitMins = 0;
    let validWaitCount = 0;

    let totalServiceMins = 0;
    let validServiceCount = 0;

    completedTokens.forEach((t) => {
      if (t.calledAt && t.createdAt) {
        const wait = (new Date(t.calledAt) - new Date(t.createdAt)) / 60000;
        if (wait >= 0 && wait < 300) {
          totalWaitMins += wait;
          validWaitCount++;
        }
      }
      if (t.completedAt && t.serviceStartedAt) {
        const serv = (new Date(t.completedAt) - new Date(t.serviceStartedAt)) / 60000;
        if (serv >= 0 && serv < 180) {
          totalServiceMins += serv;
          validServiceCount++;
        }
      }
    });

    const avgWaitMinutes = validWaitCount > 0 ? Math.round(totalWaitMins / validWaitCount) : 4;
    const avgServiceMinutes = validServiceCount > 0 ? Math.round(totalServiceMins / validServiceCount) : 6;

    // Breakdown by priority
    const priorityBreakdown = {
      urgent: await Token.countDocuments({ status: 'waiting', priority: 'urgent' }),
      vip: await Token.countDocuments({ status: 'waiting', priority: 'vip' }),
      senior_disabled: await Token.countDocuments({ status: 'waiting', priority: 'senior_disabled' }),
      regular: await Token.countDocuments({ status: 'waiting', priority: 'regular' }),
    };

    const activeCountersCount = counters.filter((c) => c.status === 'active').length;

    return res.json({
      success: true,
      data: {
        waitingCount,
        servingCount: calledCount + inServiceCount,
        calledCount,
        inServiceCount,
        completedTodayCount,
        noShowTodayCount,
        activeCountersCount,
        totalCountersCount: counters.length,
        avgWaitMinutes,
        avgServiceMinutes,
        priorityBreakdown,
        counters,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to compute queue statistics.',
      error: error.message,
    });
  }
};

// @desc    Reset and re-seed queue demo data
// @route   POST /api/queue/reset
// @access  Public / Admin
export const resetQueueData = async (req, res) => {
  try {
    await seedDatabase(true);
    emitQueueEvent('queue:sync', { type: 'data_reset', message: 'Demo data reseeded' });

    return res.json({
      success: true,
      message: 'Queue system successfully reset and re-seeded with demo data.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reset queue data.',
      error: error.message,
    });
  }
};

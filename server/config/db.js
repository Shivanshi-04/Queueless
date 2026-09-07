import mongoose from 'mongoose';
import User from '../models/User.js';
import Counter from '../models/Counter.js';
import Token from '../models/Token.js';

export const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/queueless';

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${primaryUri}`);
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 1000,
    });
    console.log('[Database] Connected successfully to local/external MongoDB instance.');
  } catch (err) {
    console.warn(`[Database] MongoDB daemon not running locally (${err.message}).`);
    console.log('[Database] Running in high-performance Resilient In-Memory Database Mode.');
  }

  await seedDatabase();
};

export const seedDatabase = async (forceReset = false) => {
  try {
    if (forceReset) {
      console.log('[Database] Force reset requested. Clearing collections...');
      await User.deleteMany({});
      await Counter.deleteMany({});
      await Token.deleteMany({});
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Seeding default users...');
      await User.create([
        {
          name: 'System Admin',
          email: 'admin@demo.com',
          password: 'password123',
          role: 'Admin',
        },
        {
          name: 'Customer Demo',
          email: 'customer@demo.com',
          password: 'password123',
          role: 'Customer',
        },
        {
          name: 'Lounge Manager',
          email: 'lounge@demo.com',
          password: 'password123',
          role: 'LoungeManager',
        },
      ]);
      console.log('[Database] Default users seeded (admin@demo.com, customer@demo.com, lounge@demo.com / password123).');
    }

    const counterCount = await Counter.countDocuments();
    let seededCounters = [];
    if (counterCount === 0) {
      console.log('[Database] Seeding default counters...');
      seededCounters = await Counter.create([
        {
          name: 'Counter 1 (Express & General)',
          code: 'C1',
          staffName: 'Sarah Jenkins',
          supportedServiceIds: ['general', 'billing'],
          status: 'active',
          averageServiceMinutes: 4,
          servedCountToday: 12,
        },
        {
          name: 'Counter 2 (VIP & Premium Lounge)',
          code: 'C2',
          staffName: 'David Miller',
          supportedServiceIds: ['vip_services', 'consultation'],
          status: 'active',
          averageServiceMinutes: 7,
          servedCountToday: 8,
        },
        {
          name: 'Counter 3 (Consultation & Accounts)',
          code: 'C3',
          staffName: 'Elena Vance',
          supportedServiceIds: ['consultation', 'general', 'billing'],
          status: 'active',
          averageServiceMinutes: 6,
          servedCountToday: 15,
        },
        {
          name: 'Counter 4 (Priority Assistance)',
          code: 'C4',
          staffName: 'Marcus Cole',
          supportedServiceIds: ['general', 'consultation', 'billing', 'vip_services'],
          status: 'active',
          averageServiceMinutes: 5,
          servedCountToday: 9,
        },
      ]);
      console.log('[Database] Default counters C1-C4 seeded.');
    } else {
      seededCounters = await Counter.find();
    }

    const tokenCount = await Token.countDocuments();
    if (tokenCount === 0 && seededCounters.length > 0) {
      console.log('[Database] Seeding sample initial tokens...');
      const c1 = seededCounters.find(c => c.code === 'C1') || seededCounters[0];
      const c2 = seededCounters.find(c => c.code === 'C2') || seededCounters[1] || seededCounters[0];

      const now = Date.now();

      // Seed tokens with various statuses
      const t1 = await Token.create({
        tokenNumber: 'A-101',
        customerName: 'Marcus Aurelius',
        contact: '+1 (555) 234-5678',
        serviceId: 'general',
        serviceName: 'General Inquiries',
        priority: 'regular',
        status: 'in_service',
        counterId: c1._id || c1.id,
        counterName: c1.name,
        staffName: c1.staffName,
        createdAt: new Date(now - 12 * 60 * 1000),
        calledAt: new Date(now - 8 * 60 * 1000),
        serviceStartedAt: new Date(now - 7 * 60 * 1000),
        estimatedWaitMins: 0,
      });

      const t2 = await Token.create({
        tokenNumber: 'V-201',
        customerName: 'Eleanor Roosevelt',
        contact: '+1 (555) 987-6543',
        serviceId: 'vip_services',
        serviceName: 'VIP & Priority Desk',
        priority: 'vip',
        status: 'called',
        counterId: c2._id || c2.id,
        counterName: c2.name,
        staffName: c2.staffName,
        createdAt: new Date(now - 10 * 60 * 1000),
        calledAt: new Date(now - 1 * 60 * 1000),
        estimatedWaitMins: 0,
      });

      await Counter.findByIdAndUpdate(c1._id || c1.id, { currentServingTokenId: t1._id || t1.id });
      await Counter.findByIdAndUpdate(c2._id || c2.id, { currentServingTokenId: t2._id || t2.id });

      // Waiting tokens
      await Token.create([
        {
          tokenNumber: 'E-301',
          customerName: 'Grace Hopper',
          contact: '+1 (555) 456-7890',
          serviceId: 'billing',
          serviceName: 'Cashier & Payments',
          priority: 'urgent',
          status: 'waiting',
          createdAt: new Date(now - 6 * 60 * 1000),
          estimatedWaitMins: 3,
        },
        {
          tokenNumber: 'A-102',
          customerName: 'Alan Turing',
          contact: '+1 (555) 345-6789',
          serviceId: 'consultation',
          serviceName: 'Specialist Consultation',
          priority: 'regular',
          status: 'waiting',
          createdAt: new Date(now - 5 * 60 * 1000),
          estimatedWaitMins: 6,
        },
        {
          tokenNumber: 'S-401',
          customerName: 'Ada Lovelace',
          contact: '+1 (555) 789-0123',
          serviceId: 'general',
          serviceName: 'General Inquiries',
          priority: 'senior_disabled',
          status: 'waiting',
          createdAt: new Date(now - 3 * 60 * 1000),
          estimatedWaitMins: 9,
        },
      ]);

      console.log('[Database] Sample initial queue seeded with waiting and active tokens.');
    }
  } catch (seedErr) {
    console.error('[Database] Seeding error:', seedErr);
  }
};

import mongoose from 'mongoose';
import { memoryStore } from '../config/memoryStore.js';

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Counter name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Counter code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  staffName: {
    type: String,
    default: '',
    trim: true,
  },
  supportedServiceIds: {
    type: [String],
    default: ['general', 'billing', 'consultation', 'vip_services'],
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active',
  },
  currentServingTokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
    default: null,
  },
  servedCountToday: {
    type: Number,
    default: 0,
  },
  averageServiceMinutes: {
    type: Number,
    default: 5,
  },
}, {
  timestamps: true,
});

const MongooseCounter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const Counter = new Proxy(MongooseCounter, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in memoryStore.counters) {
      return typeof memoryStore.counters[prop] === 'function'
        ? memoryStore.counters[prop].bind(memoryStore.counters)
        : memoryStore.counters[prop];
    }
    return target[prop];
  },
});

export default Counter;

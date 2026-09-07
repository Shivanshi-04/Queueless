import mongoose from 'mongoose';
import { memoryStore } from '../config/memoryStore.js';

const tokenSchema = new mongoose.Schema({
  tokenNumber: {
    type: String,
    required: [true, 'Token number is required'],
    trim: true,
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  contact: {
    type: String,
    default: '',
    trim: true,
  },
  serviceId: {
    type: String,
    required: [true, 'Service ID is required'],
    trim: true,
  },
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },
  priority: {
    type: String,
    enum: ['regular', 'senior_disabled', 'vip', 'urgent'],
    default: 'regular',
  },
  status: {
    type: String,
    enum: ['waiting', 'called', 'in_service', 'completed', 'cancelled', 'no_show'],
    default: 'waiting',
  },
  counterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counter',
    default: null,
  },
  counterName: {
    type: String,
    default: '',
  },
  staffName: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
  estimatedWaitMins: {
    type: Number,
    default: 0,
  },
  calledAt: {
    type: Date,
    default: null,
  },
  serviceStartedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

tokenSchema.index({ status: 1, priority: 1, createdAt: 1 });

const MongooseToken = mongoose.models.Token || mongoose.model('Token', tokenSchema);

const Token = new Proxy(MongooseToken, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in memoryStore.tokens) {
      return typeof memoryStore.tokens[prop] === 'function'
        ? memoryStore.tokens[prop].bind(memoryStore.tokens)
        : memoryStore.tokens[prop];
    }
    return target[prop];
  },
});

export default Token;

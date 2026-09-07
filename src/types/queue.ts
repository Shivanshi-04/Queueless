export type PriorityLevel = 'regular' | 'senior_disabled' | 'vip' | 'urgent';

export type TokenStatus = 'waiting' | 'called' | 'in_service' | 'completed' | 'cancelled' | 'no_show';

export type CounterStatus = 'active' | 'paused' | 'closed';

export interface ServiceTypeDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  prefix: string;
  avgDurationMins: number;
  iconName: string;
  badgeColor: string;
}

export interface Token {
  id: string;
  tokenNumber: string;
  customerName: string;
  contact: string;
  serviceId: string;
  serviceName: string;
  priority: PriorityLevel;
  status: TokenStatus;
  counterId?: string;
  counterName?: string;
  staffName?: string;
  createdAt: number;
  calledAt?: number;
  serviceStartedAt?: number;
  completedAt?: number;
  estimatedWaitMins: number;
  notes?: string;
}

export interface Counter {
  id: string;
  name: string;
  code: string;
  staffName: string;
  supportedServiceIds: string[]; // Service IDs supported, or ['*']
  status: CounterStatus;
  currentServingTokenId?: string;
  servedCountToday: number;
  averageServiceMinutes: number;
}

export interface QueueStats {
  totalWaiting: number;
  totalServing: number;
  totalCompletedToday: number;
  avgWaitMinutes: number;
  avgServiceMinutes: number;
  activeCountersCount: number;
}

export interface QueueLog {
  id: string;
  timestamp: number;
  action: 'token_created' | 'token_called' | 'service_started' | 'token_completed' | 'token_cancelled' | 'token_noshow' | 'token_recalled';
  tokenNumber: string;
  customerName: string;
  counterName?: string;
  message: string;
}

export type ActiveView = 'customer' | 'admin' | 'lounge';

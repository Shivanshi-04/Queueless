import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type {
  Counter,
  CounterStatus,
  PriorityLevel,
  QueueLog,
  QueueStats,
  ServiceTypeDefinition,
  Token,
} from '../types/queue';
import { INITIAL_COUNTERS, INITIAL_TOKENS, SERVICE_TYPES } from '../services/mockData';
import { audioService } from '../services/audioService';
import { estimateWaitTime, findNextTokenForCounter } from '../services/queueEngine';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

interface QueueContextType {
  tokens: Token[];
  counters: Counter[];
  services: ServiceTypeDefinition[];
  logs: QueueLog[];
  activeCustomerTokenId: string | null;
  lastCalledToken: Token | null;
  isSimulating: boolean;
  isMuted: boolean;
  stats: QueueStats;
  generateToken: (data: {
    customerName: string;
    contact: string;
    serviceId: string;
    priority: PriorityLevel;
    notes?: string;
  }) => Promise<Token>;
  callNext: (counterId: string) => Promise<Token | null>;
  recallToken: (counterId: string) => Promise<void>;
  startService: (counterId: string) => Promise<void>;
  completeService: (counterId: string) => Promise<void>;
  markNoShow: (counterId: string) => Promise<void>;
  cancelToken: (tokenId: string) => Promise<void>;
  transferToken: (tokenId: string, targetServiceId: string) => Promise<void>;
  updateCounterStatus: (counterId: string, status: CounterStatus) => Promise<void>;
  updateCounterServices: (counterId: string, serviceIds: string[]) => Promise<void>;
  updateCounterStaff: (counterId: string, staffName: string) => Promise<void>;
  updateCounterName: (counterId: string, name: string) => Promise<void>;
  deleteCounter: (counterId: string) => Promise<void>;
  addNewCounter: (name: string, staffName: string, serviceIds: string[]) => Promise<void>;
  setActiveCustomerToken: (tokenId: string | null) => void;
  toggleSimulation: () => void;
  toggleMute: () => void;
  injectSampleCustomer: () => Promise<Token>;
  resetQueueData: () => Promise<void>;
  refreshQueue: () => Promise<void>;
}

const STORAGE_KEY_TOKENS = 'queueless_tokens_v1';
const STORAGE_KEY_COUNTERS = 'queueless_counters_v1';
const STORAGE_KEY_LOGS = 'queueless_logs_v1';
const STORAGE_KEY_ACTIVE_TOKEN = 'queueless_active_customer_token';

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<Token[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TOKENS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tokens from localStorage', e);
      }
    }
    return INITIAL_TOKENS;
  });

  const [counters, setCounters] = useState<Counter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COUNTERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse counters from localStorage', e);
      }
    }
    return INITIAL_COUNTERS;
  });

  const [logs, setLogs] = useState<QueueLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse logs from localStorage', e);
      }
    }
    return [
      {
        id: 'log-1',
        timestamp: Date.now() - 30 * 60 * 1000,
        action: 'token_completed',
        tokenNumber: 'B-098',
        customerName: 'Hannah Abbott',
        counterName: 'Counter 2',
        message: 'Completed Cashier & Billing service',
      },
    ];
  });

  const [activeCustomerTokenId, setActiveCustomerTokenId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_TOKEN) || 't-104';
  });

  const [lastCalledToken, setLastCalledToken] = useState<Token | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sync to localStorage as backup
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COUNTERS, JSON.stringify(counters));
  }, [counters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (activeCustomerTokenId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_TOKEN, activeCustomerTokenId);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_TOKEN);
    }
  }, [activeCustomerTokenId]);

  const addLog = useCallback(
    (
      action: QueueLog['action'],
      tokenNumber: string,
      customerName: string,
      message: string,
      counterName?: string
    ) => {
      const newLog: QueueLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
        action,
        tokenNumber,
        customerName,
        counterName,
        message,
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    },
    []
  );

  // Map backend MongoDB Token model to frontend Token interface
  const normalizeToken = (t: any): Token => {
    return {
      id: t._id || t.id,
      tokenNumber: t.tokenNumber,
      customerName: t.customerName,
      contact: t.contact || '',
      serviceId: t.serviceId,
      serviceName: t.serviceName,
      priority: t.priority,
      status: t.status,
      counterId: t.counterId?._id || t.counterId || undefined,
      counterName: t.counterName || t.counterId?.name || undefined,
      staffName: t.staffName || t.counterId?.staffName || undefined,
      createdAt: typeof t.createdAt === 'string' ? new Date(t.createdAt).getTime() : (t.createdAt || Date.now()),
      calledAt: t.calledAt ? (typeof t.calledAt === 'string' ? new Date(t.calledAt).getTime() : t.calledAt) : undefined,
      serviceStartedAt: t.serviceStartedAt ? (typeof t.serviceStartedAt === 'string' ? new Date(t.serviceStartedAt).getTime() : t.serviceStartedAt) : undefined,
      completedAt: t.completedAt ? (typeof t.completedAt === 'string' ? new Date(t.completedAt).getTime() : t.completedAt) : undefined,
      estimatedWaitMins: t.estimatedWaitMins || 5,
      notes: t.notes || '',
    };
  };

  // Map backend MongoDB Counter model to frontend Counter interface
  const normalizeCounter = (c: any): Counter => {
    return {
      id: c._id || c.id,
      name: c.name,
      code: c.code,
      staffName: c.staffName || '',
      supportedServiceIds: c.supportedServiceIds || ['*'],
      status: c.status || 'active',
      currentServingTokenId: c.currentServingTokenId?._id || c.currentServingTokenId || undefined,
      servedCountToday: c.servedCountToday || 0,
      averageServiceMinutes: c.averageServiceMinutes || 5,
    };
  };

  // Fetch live state from backend
  const refreshQueue = useCallback(async () => {
    try {
      const [tokensRes, countersRes] = await Promise.all([
        api.get('/tokens'),
        api.get('/counters'),
      ]);

      if (tokensRes.data?.tokens) {
        const fetchedTokens: Token[] = tokensRes.data.tokens.map(normalizeToken);
        setTokens(fetchedTokens);
      }

      if (countersRes.data?.counters) {
        const fetchedCounters: Counter[] = countersRes.data.counters.map(normalizeCounter);
        setCounters(fetchedCounters);
      }
    } catch (err) {
      console.warn('Backend offline or unreachable, using local queue storage.');
    }
  }, []);

  // Initial load & WebSocket Realtime listener setup
  useEffect(() => {
    refreshQueue();

    const socket = getSocket();

    const handleQueueSync = (data: any) => {
      console.log('⚡ Socket event received: queue:sync', data);
      if (data?.tokens) {
        setTokens(data.tokens.map(normalizeToken));
      }
      if (data?.counters) {
        setCounters(data.counters.map(normalizeCounter));
      }
      if (data?.token) {
        const normToken = normalizeToken(data.token);
        setTokens((prev) => {
          const exists = prev.some((t) => t.id === normToken.id);
          if (exists) {
            return prev.map((t) => (t.id === normToken.id ? normToken : t));
          }
          return [normToken, ...prev];
        });
      }
      if (data?.counter) {
        const normCounter = normalizeCounter(data.counter);
        setCounters((prev) =>
          prev.map((c) => (c.id === normCounter.id ? normCounter : c))
        );
      }
    };

    const handleTokenCalled = (data: any) => {
      console.log('⚡ Socket event received: queue:token_called', data);
      const token = data.token ? normalizeToken(data.token) : null;
      if (token) {
        setLastCalledToken(token);
        if (!isMuted) {
          audioService.playChime();
        }
        addLog(
          'token_called',
          token.tokenNumber,
          token.customerName,
          `Called to ${token.counterName || 'Counter'}`,
          token.counterName
        );
      }
      refreshQueue();
    };

    const handleTokenCreated = (data: any) => {
      console.log('⚡ Socket event received: queue:token_created', data);
      const token = data.token ? normalizeToken(data.token) : null;
      if (token) {
        addLog(
          'token_created',
          token.tokenNumber,
          token.customerName,
          `Joined queue for ${token.serviceName}`
        );
      }
      refreshQueue();
    };

    const handleTokenRecalled = (data: any) => {
      console.log('⚡ Socket event received: queue:token_recalled', data);
      const token = data.token ? normalizeToken(data.token) : null;
      if (token) {
        setLastCalledToken(token);
        if (!isMuted) {
          audioService.playChime();
        }
        addLog(
          'token_recalled',
          token.tokenNumber,
          token.customerName,
          `Re-announced at ${token.counterName || 'Counter'}`,
          token.counterName
        );
      }
    };

    socket.on('queue:sync', handleQueueSync);
    socket.on('queue:token_called', handleTokenCalled);
    socket.on('queue:token_created', handleTokenCreated);
    socket.on('queue:token_recalled', handleTokenRecalled);
    socket.on('queue:state_synced', refreshQueue);

    return () => {
      socket.off('queue:sync', handleQueueSync);
      socket.off('queue:token_called', handleTokenCalled);
      socket.off('queue:token_created', handleTokenCreated);
      socket.off('queue:token_recalled', handleTokenRecalled);
      socket.off('queue:state_synced', refreshQueue);
    };
  }, [refreshQueue, isMuted, addLog]);

  // Generate Token
  const generateToken = useCallback(
    async (data: {
      customerName: string;
      contact: string;
      serviceId: string;
      priority: PriorityLevel;
      notes?: string;
    }): Promise<Token> => {
      const service = SERVICE_TYPES.find((s) => s.id === data.serviceId) || SERVICE_TYPES[0];

      try {
        const response = await api.post('/tokens', {
          customerName: data.customerName.trim(),
          contact: data.contact.trim(),
          serviceId: service.id,
          serviceName: service.name,
          priority: data.priority,
          notes: data.notes?.trim(),
        });

        if (response.data?.token) {
          const newToken = normalizeToken(response.data.token);
          setTokens((prev) => [newToken, ...prev]);
          setActiveCustomerTokenId(newToken.id);
          addLog('token_created', newToken.tokenNumber, newToken.customerName, `Joined queue for ${service.name}`);
          audioService.playClick();
          return newToken;
        }
      } catch (err) {
        console.warn('Backend API call failed, generating in-memory token fallback.');
      }

      // Local fallback
      const serviceTokens = tokens.filter((t) => t.serviceId === data.serviceId);
      const nextSeq = 100 + (serviceTokens.length % 900) + 1;
      const prefix = data.priority === 'vip' ? 'V' : data.priority === 'urgent' ? 'U' : service.prefix;
      const tokenNumber = `${prefix}-${nextSeq}`;

      const newToken: Token = {
        id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        tokenNumber,
        customerName: data.customerName.trim(),
        contact: data.contact.trim(),
        serviceId: service.id,
        serviceName: service.name,
        priority: data.priority,
        status: 'waiting',
        createdAt: Date.now(),
        estimatedWaitMins: 8,
        notes: data.notes?.trim(),
      };

      newToken.estimatedWaitMins = estimateWaitTime(newToken, [...tokens, newToken], counters, SERVICE_TYPES);

      setTokens((prev) => [...prev, newToken]);
      setActiveCustomerTokenId(newToken.id);

      addLog('token_created', tokenNumber, newToken.customerName, `Joined queue for ${service.name}`);
      audioService.playClick();

      return newToken;
    },
    [tokens, counters, addLog]
  );

  // Call Next Token
  const callNext = useCallback(
    async (counterId: string): Promise<Token | null> => {
      try {
        const response = await api.post(`/counters/${counterId}/call-next`);
        if (response.data?.token) {
          const called = normalizeToken(response.data.token);
          setLastCalledToken(called);
          if (!isMuted) {
            audioService.playChime();
          }
          await refreshQueue();
          return called;
        }
      } catch (err) {
        console.warn('Backend API call failed, using local queue fallback for callNext.');
      }

      // Local fallback
      const counter = counters.find((c) => c.id === counterId);
      if (!counter || counter.status !== 'active') return null;

      const nextToken = findNextTokenForCounter(counter, tokens);
      if (!nextToken) return null;

      const now = Date.now();

      const updatedTokens = tokens.map((t) => {
        if (counter.currentServingTokenId && t.id === counter.currentServingTokenId && t.status === 'in_service') {
          return {
            ...t,
            status: 'completed' as const,
            completedAt: now,
          };
        }
        if (t.id === nextToken.id) {
          return {
            ...t,
            status: 'called' as const,
            counterId: counter.id,
            counterName: counter.name,
            staffName: counter.staffName,
            calledAt: now,
            serviceStartedAt: now,
          };
        }
        return t;
      });

      setTokens(updatedTokens);

      setCounters((prev) =>
        prev.map((c) => {
          if (c.id === counterId) {
            return {
              ...c,
              currentServingTokenId: nextToken.id,
            };
          }
          return c;
        })
      );

      const calledTokenWithCounter: Token = {
        ...nextToken,
        status: 'called',
        counterId: counter.id,
        counterName: counter.name,
        staffName: counter.staffName,
        calledAt: now,
      };

      setLastCalledToken(calledTokenWithCounter);

      if (!isMuted) {
        audioService.playChime();
      }

      addLog(
        'token_called',
        nextToken.tokenNumber,
        nextToken.customerName,
        `Called to ${counter.name}`,
        counter.name
      );

      return calledTokenWithCounter;
    },
    [counters, tokens, isMuted, refreshQueue, addLog]
  );

  // Recall current token
  const recallToken = useCallback(
    async (counterId: string) => {
      try {
        await api.post(`/counters/${counterId}/recall`);
      } catch (err) {
        console.warn('Backend recall failed, using local chime.');
      }

      const counter = counters.find((c) => c.id === counterId);
      if (!counter || !counter.currentServingTokenId) return;

      const token = tokens.find((t) => t.id === counter.currentServingTokenId);
      if (!token) return;

      setLastCalledToken(token);
      if (!isMuted) {
        audioService.playChime();
      }

      addLog(
        'token_recalled',
        token.tokenNumber,
        token.customerName,
        `Re-announced at ${counter.name}`,
        counter.name
      );
    },
    [counters, tokens, isMuted, addLog]
  );

  // Start service
  const startService = useCallback(
    async (counterId: string) => {
      try {
        await api.post(`/counters/${counterId}/start-service`);
        await refreshQueue();
      } catch (err) {
        console.warn('Backend start-service failed, using local update.');
      }

      const counter = counters.find((c) => c.id === counterId);
      if (!counter || !counter.currentServingTokenId) return;

      setTokens((prev) =>
        prev.map((t) => {
          if (t.id === counter.currentServingTokenId) {
            return {
              ...t,
              status: 'in_service',
              serviceStartedAt: Date.now(),
            };
          }
          return t;
        })
      );
    },
    [counters, refreshQueue]
  );

  // Complete service
  const completeService = useCallback(
    async (counterId: string) => {
      try {
        await api.post(`/counters/${counterId}/complete`);
        await refreshQueue();
      } catch (err) {
        console.warn('Backend complete-service failed, using local update.');
      }

      const counter = counters.find((c) => c.id === counterId);
      if (!counter || !counter.currentServingTokenId) return;

      const tokenId = counter.currentServingTokenId;
      const token = tokens.find((t) => t.id === tokenId);

      setTokens((prev) =>
        prev.map((t) => {
          if (t.id === tokenId) {
            return {
              ...t,
              status: 'completed',
              completedAt: Date.now(),
            };
          }
          return t;
        })
      );

      setCounters((prev) =>
        prev.map((c) => {
          if (c.id === counterId) {
            return {
              ...c,
              currentServingTokenId: undefined,
              servedCountToday: c.servedCountToday + 1,
            };
          }
          return c;
        })
      );

      if (token) {
        addLog(
          'token_completed',
          token.tokenNumber,
          token.customerName,
          `Completed service at ${counter.name}`,
          counter.name
        );
      }
    },
    [counters, tokens, refreshQueue, addLog]
  );

  // Mark No Show
  const markNoShow = useCallback(
    async (counterId: string) => {
      try {
        await api.post(`/counters/${counterId}/no-show`);
        await refreshQueue();
      } catch (err) {
        console.warn('Backend no-show failed, using local update.');
      }

      const counter = counters.find((c) => c.id === counterId);
      if (!counter || !counter.currentServingTokenId) return;

      const tokenId = counter.currentServingTokenId;
      const token = tokens.find((t) => t.id === tokenId);

      setTokens((prev) =>
        prev.map((t) => {
          if (t.id === tokenId) {
            return {
              ...t,
              status: 'no_show',
              completedAt: Date.now(),
            };
          }
          return t;
        })
      );

      setCounters((prev) =>
        prev.map((c) => {
          if (c.id === counterId) {
            return {
              ...c,
              currentServingTokenId: undefined,
            };
          }
          return c;
        })
      );

      if (token) {
        addLog(
          'token_noshow',
          token.tokenNumber,
          token.customerName,
          `Marked as No-Show at ${counter.name}`,
          counter.name
        );
      }
    },
    [counters, tokens, refreshQueue, addLog]
  );

  // Cancel Token
  const cancelToken = useCallback(
    async (tokenId: string) => {
      try {
        await api.delete(`/tokens/${tokenId}`);
        await refreshQueue();
      } catch (err) {
        console.warn('Backend cancel-token failed, using local update.');
      }

      const token = tokens.find((t) => t.id === tokenId);
      if (!token) return;

      setTokens((prev) =>
        prev.map((t) => {
          if (t.id === tokenId) {
            return { ...t, status: 'cancelled' };
          }
          return t;
        })
      );

      addLog('token_cancelled', token.tokenNumber, token.customerName, 'Cancelled by user/operator');
    },
    [tokens, refreshQueue, addLog]
  );

  // Transfer Token
  const transferToken = useCallback(
    async (tokenId: string, targetServiceId: string) => {
      const targetService = SERVICE_TYPES.find((s) => s.id === targetServiceId);
      if (!targetService) return;

      setTokens((prev) =>
        prev.map((t) => {
          if (t.id === tokenId) {
            return {
              ...t,
              serviceId: targetService.id,
              serviceName: targetService.name,
              status: 'waiting',
              counterId: undefined,
              counterName: undefined,
            };
          }
          return t;
        })
      );
    },
    []
  );

  // Update Counter Status
  const updateCounterStatus = useCallback(
    async (counterId: string, status: CounterStatus) => {
      setCounters((prev) =>
        prev.map((c) => (c.id === counterId ? { ...c, status } : c))
      );
      try {
        await api.patch(`/counters/${counterId}/status`, { status });
      } catch (err) {}
    },
    []
  );

  // Update Counter Services
  const updateCounterServices = useCallback(
    async (counterId: string, serviceIds: string[]) => {
      setCounters((prev) =>
        prev.map((c) => (c.id === counterId ? { ...c, supportedServiceIds: serviceIds } : c))
      );
      try {
        await api.patch(`/counters/${counterId}/status`, { supportedServiceIds: serviceIds });
      } catch (err) {}
    },
    []
  );

  // Update Counter Staff
  const updateCounterStaff = useCallback(
    async (counterId: string, staffName: string) => {
      setCounters((prev) =>
        prev.map((c) => (c.id === counterId ? { ...c, staffName } : c))
      );
      try {
        await api.patch(`/counters/${counterId}/status`, { staffName });
      } catch (err) {}
    },
    []
  );

  // Update Counter Name
  const updateCounterName = useCallback(
    async (counterId: string, name: string) => {
      setCounters((prev) =>
        prev.map((c) => (c.id === counterId ? { ...c, name } : c))
      );
      try {
        await api.patch(`/counters/${counterId}`, { name });
      } catch (err) {}
    },
    []
  );

  // Delete Counter
  const deleteCounter = useCallback(
    async (counterId: string) => {
      // Optimistic local state update
      setCounters((prev) => prev.filter((c) => c.id !== counterId));

      // If deleted counter had an active token, release it
      setTokens((prev) =>
        prev.map((t) => {
          if (t.counterId === counterId && (t.status === 'called' || t.status === 'in_service')) {
            return {
              ...t,
              status: 'waiting',
              counterId: undefined,
              counterName: undefined,
              staffName: undefined,
            };
          }
          return t;
        })
      );

      try {
        await api.delete(`/counters/${counterId}`);
      } catch (err) {
        console.warn('Backend delete-counter notice:', err);
      }
    },
    []
  );

  // Add New Counter
  const addNewCounter = useCallback(
    async (name: string, staffName: string, serviceIds: string[]) => {
      const code = `C${counters.length + 1}`;
      const tempId = `c-${Date.now()}`;
      const newCounter: Counter = {
        id: tempId,
        name,
        code,
        staffName,
        supportedServiceIds: serviceIds,
        status: 'active',
        servedCountToday: 0,
        averageServiceMinutes: 5,
      };

      // Immediate optimistic update
      setCounters((prev) => [...prev, newCounter]);

      try {
        const response = await api.post('/counters', {
          name,
          code,
          staffName,
          supportedServiceIds: serviceIds,
        });
        if (response.data?.data?._id || response.data?.data?.id) {
          const realId = response.data.data._id || response.data.data.id;
          setCounters((prev) =>
            prev.map((c) => (c.id === tempId ? { ...c, id: realId } : c))
          );
        }
      } catch (err) {
        console.warn('Backend create-counter notice:', err);
      }
    },
    [counters.length]
  );

  // Simulation & Audio toggles
  const toggleSimulation = useCallback(() => {
    setIsSimulating((prev) => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Quick Inject sample customer
  const injectSampleCustomer = useCallback(async (): Promise<Token> => {
    const names = ['Emma Watson', 'James Holden', 'Mei Chen', 'Carlos Santana', 'Zoya Khan', 'Liam O’Connor'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const services = SERVICE_TYPES.map((s) => s.id);
    const randomService = services[Math.floor(Math.random() * services.length)];
    const priorities: PriorityLevel[] = ['regular', 'regular', 'senior_disabled', 'vip', 'urgent'];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];

    return await generateToken({
      customerName: randomName,
      contact: `+1 (555) 019-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: randomService,
      priority: randomPriority,
      notes: 'Automated simulated customer check-in',
    });
  }, [generateToken]);

  // Reset Queue Data
  const resetQueueData = useCallback(async () => {
    try {
      await api.post('/queue/reset');
      await refreshQueue();
    } catch (err) {}

    setTokens(INITIAL_TOKENS);
    setCounters(INITIAL_COUNTERS);
    setActiveCustomerTokenId(null);
    setLastCalledToken(null);
    localStorage.removeItem(STORAGE_KEY_TOKENS);
    localStorage.removeItem(STORAGE_KEY_COUNTERS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_TOKEN);
  }, [refreshQueue]);

  // Derived Stats
  const stats: QueueStats = useMemo(() => {
    const waitingTokens = tokens.filter((t) => t.status === 'waiting');
    const servingTokens = tokens.filter((t) => t.status === 'in_service' || t.status === 'called');
    const completedToday = tokens.filter((t) => t.status === 'completed');
    const activeCounters = counters.filter((c) => c.status === 'active');

    const totalWaitSum = waitingTokens.reduce((acc, t) => acc + (t.estimatedWaitMins || 5), 0);
    const avgWait = waitingTokens.length > 0 ? Math.round(totalWaitSum / waitingTokens.length) : 0;

    const avgService =
      activeCounters.length > 0
        ? Math.round(
            activeCounters.reduce((acc, c) => acc + c.averageServiceMinutes, 0) / activeCounters.length
          )
        : 6;

    return {
      totalWaiting: waitingTokens.length,
      totalServing: servingTokens.length,
      totalCompletedToday: completedToday.length,
      avgWaitMinutes: avgWait,
      avgServiceMinutes: avgService,
      activeCountersCount: activeCounters.length,
    };
  }, [tokens, counters]);

  return (
    <QueueContext.Provider
      value={{
        tokens,
        counters,
        services: SERVICE_TYPES,
        logs,
        activeCustomerTokenId,
        lastCalledToken,
        isSimulating,
        isMuted,
        stats,
        generateToken,
        callNext,
        recallToken,
        startService,
        completeService,
        markNoShow,
        cancelToken,
        transferToken,
        updateCounterStatus,
        updateCounterServices,
        updateCounterStaff,
        updateCounterName,
        deleteCounter,
        addNewCounter,
        setActiveCustomerToken: setActiveCustomerTokenId,
        toggleSimulation,
        toggleMute,
        injectSampleCustomer,
        resetQueueData,
        refreshQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};

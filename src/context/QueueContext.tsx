import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import type {
  Counter,
  CounterStatus,
  PriorityLevel,
  QueueLog,
  QueueStats,
  ServiceTypeDefinition,
  Token,
} from '../types/queue';
import { INITIAL_TOKENS, SERVICE_TYPES } from '../services/mockData';
import { audioService } from '../services/audioService';
import { estimateWaitTime } from '../services/queueEngine';
// Legacy Socket.IO import kept commented out to prevent unused-variable errors
// import { getSocket } from '../services/socket';
import { supabase } from '../lib/supabaseClient';

interface QueueContextType {
  tokens: Token[];
  counters: Counter[];
  services: ServiceTypeDefinition[];
  logs: QueueLog[];
  activeCustomerTokenId: string | null;
  customerTokenIds: string[];
  customerTokens: Token[];
  addCustomerToken: (tokenId: string) => void;
  removeCustomerToken: (tokenId: string) => void;
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
const STORAGE_KEY_CUSTOMER_TOKENS = 'queueless_customer_tokens_list_v1';

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

  const [counters, setCounters] = useState<Counter[]>([]);

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

  const [customerTokenIds, setCustomerTokenIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOMER_TOKENS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch { }
    }
    const single = localStorage.getItem(STORAGE_KEY_ACTIVE_TOKEN) || 't-104';
    return single ? [single] : ['t-104'];
  });

  const [lastCalledToken, setLastCalledToken] = useState<Token | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Refs to provide latest values inside Supabase Realtime listeners without channel teardown
  const tokensRef = useRef<Token[]>(tokens);
  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);

  const countersRef = useRef<Counter[]>(counters);
  useEffect(() => {
    countersRef.current = counters;
  }, [counters]);

  const isMutedRef = useRef<boolean>(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Sync to localStorage as backup
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
  }, [tokens]);

  // Clear any legacy mock counters saved in localStorage
  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY_COUNTERS);
  }, []);

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOMER_TOKENS, JSON.stringify(customerTokenIds));
  }, [customerTokenIds]);

  const addCustomerToken = useCallback((tokenId: string) => {
    setCustomerTokenIds((prev) => Array.from(new Set([tokenId, ...prev])));
    setActiveCustomerTokenId(tokenId);
  }, []);

  const removeCustomerToken = useCallback((tokenId: string) => {
    setCustomerTokenIds((prev) => {
      const next = prev.filter((id) => id !== tokenId);
      return next;
    });
    setActiveCustomerTokenId((prev) => (prev === tokenId ? null : prev));
  }, []);

  const handleSetActiveCustomerToken = useCallback((tokenId: string | null) => {
    setActiveCustomerTokenId(tokenId);
    if (tokenId) {
      setCustomerTokenIds((prev) => Array.from(new Set([tokenId, ...prev])));
    }
  }, []);

  const customerTokens = useMemo(() => {
    return tokens.filter((t) => customerTokenIds.includes(t.id));
  }, [tokens, customerTokenIds]);

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

  // Helper to parse dates/timestamps into epoch milliseconds
  const parseTimestamp = (val: any): number | undefined => {
    if (!val) return undefined;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = new Date(val).getTime();
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  // Map backend MongoDB Token model or Supabase public.tokens row to frontend Token interface
  const normalizeToken = (t: any): Token => {
    const sId = t.service_id || t.serviceId;
    const matchingService = SERVICE_TYPES.find((s) => s.id === sId);

    return {
      id: t.id || t._id,
      tokenNumber: t.token_number || t.tokenNumber,
      customerName: t.customer_name || t.customerName,
      contact: t.contact || '',
      serviceId: sId,
      serviceName: t.serviceName || t.service_name || matchingService?.name || sId || 'General Service',
      priority: t.priority,
      status: t.status,
      counterId: t.counter_id || t.counterId?._id || t.counterId || undefined,
      counterName: t.counterName || t.counterId?.name || undefined,
      staffName: t.staffName || t.counterId?.staffName || undefined,
      createdAt: parseTimestamp(t.created_at) || parseTimestamp(t.createdAt) || Date.now(),
      calledAt: parseTimestamp(t.called_at) || parseTimestamp(t.calledAt) || undefined,
      serviceStartedAt: parseTimestamp(t.service_started_at) || parseTimestamp(t.serviceStartedAt) || undefined,
      completedAt: parseTimestamp(t.completed_at) || parseTimestamp(t.completedAt) || undefined,
      estimatedWaitMins: t.estimated_wait_mins ?? t.estimatedWaitMins ?? 5,
      notes: t.notes || '',
    };
  };

  // Map backend MongoDB Counter model or Supabase public.counters row to frontend Counter interface
  const normalizeCounter = (c: any): Counter => {
    let supportedServiceIds: string[] = ['*'];
    if (Array.isArray(c.counter_services) && c.counter_services.length > 0) {
      supportedServiceIds = c.counter_services.map((cs: any) => cs.service_id || cs);
    } else if (Array.isArray(c.supportedServiceIds) && c.supportedServiceIds.length > 0) {
      supportedServiceIds = c.supportedServiceIds;
    } else if (Array.isArray(c.counter_services)) {
      supportedServiceIds = c.counter_services.map((cs: any) => cs.service_id || cs);
    }

    return {
      id: c.id || c._id,
      name: c.name,
      code: c.code,
      staffName: c.staff_name ?? c.staffName ?? '',
      supportedServiceIds,
      status: c.status || 'active',
      currentServingTokenId: c.current_serving_token_id || c.currentServingTokenId?._id || c.currentServingTokenId || undefined,
      servedCountToday: c.served_count_today ?? c.servedCountToday ?? 0,
      averageServiceMinutes: c.average_service_minutes ?? c.averageServiceMinutes ?? 5,
    };
  };

  // Fetch live state: Tokens and Counters directly from Supabase Cloud
  const refreshQueue = useCallback(async () => {
    try {
      // 1. Query tokens directly from Supabase Cloud
      const { data: tokenRows, error: tokenError } = await supabase
        .from('tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (tokenError) {
        console.error('[SUPABASE TOKEN FETCH ERROR]', tokenError);
      } else if (tokenRows) {
        const fetchedTokens: Token[] = tokenRows.map(normalizeToken);
        setTokens(fetchedTokens);
      }

      // 2. Query counters directly from Supabase Cloud
      const { data: counterRows, error: counterError } = await supabase
        .from('counters')
        .select(`
          *,
          counter_services (
            service_id
          )
        `)
        .order('code', { ascending: true });

      let rows = counterRows;

      if (counterError) {
        console.warn('[SUPABASE COUNTERS NESTED QUERY ERROR]', counterError.message);
        // Fallback: fetch counters and counter_services separately if nested selection fails
        const { data: separateCounters, error: sepError } = await supabase
          .from('counters')
          .select('*')
          .order('code', { ascending: true });

        if (sepError) {
          console.error('[SUPABASE COUNTERS SEPARATE FETCH ERROR]', sepError);
        } else if (separateCounters) {
          const { data: servicesData } = await supabase
            .from('counter_services')
            .select('counter_id, service_id');

          rows = separateCounters.map((cntr) => {
            const matchedServices = (servicesData || [])
              .filter((cs) => cs.counter_id === cntr.id)
              .map((cs) => ({ service_id: cs.service_id }));
            return {
              ...cntr,
              counter_services: matchedServices,
            };
          });
        }
      }

      if (rows) {
        const fetchedCounters: Counter[] = rows.map(normalizeCounter);
        setCounters(fetchedCounters);
      }
    } catch (err) {
      console.warn('Error during refreshQueue:', err);
    }
  }, []);

  // Initial load, Auth State Change & Supabase Realtime listener setup
  useEffect(() => {
    refreshQueue();

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refreshQueue();
      }
    });

    // Single Supabase Realtime channel for queue state synchronization
    const channel = supabase
      .channel('queue_realtime')
      // --- Tokens Realtime CDC ---
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tokens' },
        (payload) => {
          if (!payload.new) return;
          const normToken = normalizeToken(payload.new);
          const counter = countersRef.current.find((c) => c.id === normToken.counterId);
          const enrichedToken: Token = {
            ...normToken,
            counterName: normToken.counterName || counter?.name,
            staffName: normToken.staffName || counter?.staffName,
          };

          console.log('⚡ [Supabase Realtime] Token inserted:', enrichedToken.tokenNumber);

          addLog(
            'token_created',
            enrichedToken.tokenNumber,
            enrichedToken.customerName,
            `Joined queue for ${enrichedToken.serviceName}`
          );

          setTokens((prev) => {
            const exists = prev.some((t) => t.id === enrichedToken.id);
            if (exists) {
              return prev.map((t) => (t.id === enrichedToken.id ? enrichedToken : t));
            }
            return [enrichedToken, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tokens' },
        (payload) => {
          if (!payload.new) return;
          const normToken = normalizeToken(payload.new);
          const counter = countersRef.current.find((c) => c.id === normToken.counterId);
          const enrichedToken: Token = {
            ...normToken,
            counterName: normToken.counterName || counter?.name,
            staffName: normToken.staffName || counter?.staffName,
          };

          console.log('⚡ [Supabase Realtime] Token updated:', enrichedToken.tokenNumber, enrichedToken.status);

          // Detect transition to status === 'called'
          const prevToken = tokensRef.current.find((t) => t.id === enrichedToken.id);
          const wasCalled = prevToken ? prevToken.status === 'called' : (payload.old?.status === 'called');
          const isNowCalled = enrichedToken.status === 'called';

          if (isNowCalled && !wasCalled) {
            setLastCalledToken(enrichedToken);
            if (!isMutedRef.current) {
              audioService.playChime();
            }
            addLog(
              'token_called',
              enrichedToken.tokenNumber,
              enrichedToken.customerName,
              `Called to ${enrichedToken.counterName || 'Counter'}`,
              enrichedToken.counterName
            );
          }

          setTokens((prev) => {
            const exists = prev.some((t) => t.id === enrichedToken.id);
            if (exists) {
              return prev.map((t) => (t.id === enrichedToken.id ? enrichedToken : t));
            }
            return [enrichedToken, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tokens' },
        (payload) => {
          const deletedId = payload.old?.id;
          console.log('⚡ [Supabase Realtime] Token deleted:', deletedId);
          if (deletedId) {
            setTokens((prev) => prev.filter((t) => t.id !== deletedId));
            setLastCalledToken((prev) => (prev?.id === deletedId ? null : prev));
          }
        }
      )
      // --- Counters Realtime CDC ---
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'counters' },
        (payload) => {
          if (!payload.new) return;
          const normCounter = normalizeCounter(payload.new);
          console.log('⚡ [Supabase Realtime] Counter inserted:', normCounter.code);

          setCounters((prev) => {
            if (prev.some((c) => c.id === normCounter.id)) {
              return prev.map((c) => (c.id === normCounter.id ? normCounter : c));
            }
            return [...prev, normCounter];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'counters' },
        (payload) => {
          if (!payload.new) return;
          console.log('⚡ [Supabase Realtime] Counter updated:', payload.new.code, payload.new.status);

          setCounters((prev) => {
            const existing = prev.find((c) => c.id === payload.new.id);
            const norm = normalizeCounter(payload.new);
            // Preserve existing counter-service mappings loaded by refreshQueue() if not in realtime payload
            const preservedServices =
              payload.new.counter_services || payload.new.supportedServiceIds
                ? norm.supportedServiceIds
                : (existing?.supportedServiceIds ?? norm.supportedServiceIds);

            const updatedCounter: Counter = {
              ...norm,
              supportedServiceIds: preservedServices,
            };

            if (existing) {
              return prev.map((c) => (c.id === updatedCounter.id ? updatedCounter : c));
            }
            return [...prev, updatedCounter];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'counters' },
        (payload) => {
          const deletedId = payload.old?.id;
          console.log('⚡ [Supabase Realtime] Counter deleted:', deletedId);
          if (deletedId) {
            setCounters((prev) => prev.filter((c) => c.id !== deletedId));
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ Supabase Realtime connected on channel: queue_realtime');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Supabase Realtime channel error:', err);
        } else if (status === 'TIMED_OUT') {
          console.warn('⚠️ Supabase Realtime channel timed out');
        } else if (status === 'CLOSED') {
          console.log('⚡ Supabase Realtime channel closed');
        }
      });

    return () => {
      authSub.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [refreshQueue, addLog]);

  // Generate Token (Supabase Cloud)
  const generateToken = useCallback(
    async (data: {
      customerName: string;
      contact: string;
      serviceId: string;
      priority: PriorityLevel;
      notes?: string;
    }): Promise<Token> => {
      // 1. Authenticated user check
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to create a token.');
      }

      // 2. Resolve service definition from SERVICE_TYPES
      const service = SERVICE_TYPES.find((s) => s.id === data.serviceId) || SERVICE_TYPES[0];

      // 3. Resolve service prefix
      // Preserve existing service prefixes:
      // account_services → A, cashier_billing → B, vip_services → V, tech_support → T, express_drop → E
      // VIP priority → V, Urgent priority → U
      let prefix = 'A';
      switch (service.id) {
        case 'account_services':
          prefix = 'A';
          break;
        case 'cashier_billing':
          prefix = 'B';
          break;
        case 'vip_services':
          prefix = 'V';
          break;
        case 'tech_support':
          prefix = 'T';
          break;
        case 'express_drop':
          prefix = 'E';
          break;
        default:
          prefix = service.prefix || 'A';
          break;
      }

      if (data.priority === 'vip') {
        prefix = 'V';
      } else if (data.priority === 'urgent') {
        prefix = 'U';
      }

      // 4. Generate next sequence number based on existing tokens currently loaded in QueueContext
      const matchingTokens = tokens.filter((t) => t.tokenNumber && t.tokenNumber.startsWith(`${prefix}-`));
      const nextSeq = 100 + (matchingTokens.length % 900) + 1;
      let tokenNumber = `${prefix}-${nextSeq}`;

      if (tokens.some((t) => t.tokenNumber === tokenNumber)) {
        const maxSeq = matchingTokens.reduce((max, t) => {
          const parts = t.tokenNumber.split('-');
          const num = parseInt(parts[1], 10);
          return !isNaN(num) && num > max ? num : max;
        }, 100);
        tokenNumber = `${prefix}-${maxSeq + 1}`;
      }

      // 5. Calculate estimated wait time
      const tempToken: Token = {
        id: 'temp',
        tokenNumber,
        customerName: data.customerName.trim(),
        contact: data.contact.trim(),
        serviceId: service.id,
        serviceName: service.name,
        priority: data.priority,
        status: 'waiting',
        createdAt: Date.now(),
        estimatedWaitMins: service.avgDurationMins || 5,
        notes: data.notes?.trim() || '',
      };
      const estimatedWaitMins =
        estimateWaitTime(tempToken, [...tokens, tempToken], counters, SERVICE_TYPES) || service.avgDurationMins || 5;

      // 6. Insert directly into Supabase public.tokens
      const { data: insertedToken, error: insertError } = await supabase
        .from('tokens')
        .insert({
          token_number: tokenNumber,
          customer_name: data.customerName.trim(),
          contact: data.contact.trim(),
          user_id: user.id,
          service_id: service.id,
          priority: data.priority,
          status: 'waiting',
          notes: data.notes?.trim() || '',
          estimated_wait_mins: estimatedWaitMins,
        })
        .select()
        .single();

      if (insertError || !insertedToken) {
        console.error('[SUPABASE TOKEN CREATE ERROR]', insertError);
        throw new Error(insertError?.message || 'Failed to create token in Supabase');
      }

      // 7. Convert returned Supabase row into frontend Token interface
      const newToken = normalizeToken(insertedToken);

      // 8. Update context state
      setTokens((prev) => [newToken, ...prev]);
      setCustomerTokenIds((prev) => Array.from(new Set([newToken.id, ...prev])));
      setActiveCustomerTokenId(newToken.id);

      addLog('token_created', newToken.tokenNumber, newToken.customerName, `Joined queue for ${service.name}`);
      audioService.playClick();

      return newToken;
    },
    [tokens, counters, addLog]
  );

  // Call Next Token (Supabase RPC: public.call_next_token)
  const callNext = useCallback(
    async (counterId: string): Promise<Token | null> => {
      // 1. Invoke Supabase RPC
      const { data, error } = await supabase.rpc('call_next_token', {
        p_counter_id: counterId,
      });

      if (error) {
        console.error('[SUPABASE CALL NEXT ERROR]', error);
        throw error;
      }

      // 2. RPC returns a SETOF public.tokens (array of rows)
      const row = Array.isArray(data) ? data[0] : data;

      // If there is no row, no waiting token is eligible for this counter
      if (!row) {
        return null;
      }

      // 3. Normalize returned Supabase token
      const normalizedToken = normalizeToken(row);

      // 4. Enrich token with counter details (counterName, staffName) from loaded counters
      const counter = counters.find((c) => c.id === counterId);
      const called: Token = {
        ...normalizedToken,
        counterId: counter?.id ?? normalizedToken.counterId,
        counterName: counter?.name ?? normalizedToken.counterName,
        staffName: counter?.staffName ?? normalizedToken.staffName,
      };

      // 5. Update lastCalledToken
      setLastCalledToken(called);

      // 6. Play audio chime if not muted
      if (!isMuted) {
        audioService.playChime();
      }

      // 7. Add token_called log
      addLog(
        'token_called',
        called.tokenNumber,
        called.customerName,
        `Called to ${called.counterName || 'Counter'}`,
        called.counterName
      );

      // 8. Update local React state immediately
      setTokens((prev) => {
        const exists = prev.some((t) => t.id === called.id);
        if (exists) {
          return prev.map((t) => (t.id === called.id ? called : t));
        }
        return [called, ...prev];
      });

      // 9. Call refreshQueue() so React state gets authoritative Supabase state
      await refreshQueue();

      // 10. Return the enriched called token
      return called;
    },
    [counters, isMuted, refreshQueue, addLog]
  );

  // Recall current token
  const recallToken = useCallback(
    async (counterId: string) => {
      // 1. Find currently active token for this counter
      const token = tokens.find(
        (t) =>
          t.counterId === counterId &&
          (t.status === 'called' || t.status === 'in_service')
      );

      // 2. If no active token exists, return safely
      if (!token) return;

      const counter = counters.find((c) => c.id === counterId);

      // 3. Update lastCalledToken to trigger announcement / highlight
      setLastCalledToken(token);

      // 4. Play audio chime if not muted
      if (!isMuted) {
        audioService.playChime();
      }

      // 5. Audit log
      addLog(
        'token_recalled',
        token.tokenNumber,
        token.customerName,
        `Re-announced at ${counter?.name || 'Counter'}`,
        counter?.name
      );
    },
    [counters, tokens, isMuted, addLog]
  );

  // Complete service (Supabase Cloud: public.tokens & public.counters)
  const completeService = useCallback(
    async (counterId: string) => {
      // 1. Find currently active token for this counter
      const activeToken = tokens.find(
        (t) =>
          t.counterId === counterId &&
          (t.status === 'called' || t.status === 'in_service')
      );

      // 2. If no active token exists, do nothing
      if (!activeToken) {
        return;
      }

      const counter = counters.find((c) => c.id === counterId);
      const nowIso = new Date().toISOString();

      // 3. Update token in Supabase
      const { error: tokenError } = await supabase
        .from('tokens')
        .update({
          status: 'completed',
          completed_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', activeToken.id);

      if (tokenError) {
        console.error('[SUPABASE COMPLETE SERVICE ERROR]', tokenError);
        return;
      }

      // 4. Update counter served count in Supabase if counter exists
      if (counter) {
        const nextServed = (counter.servedCountToday || 0) + 1;
        const { error: counterError } = await supabase
          .from('counters')
          .update({
            served_count_today: nextServed,
          })
          .eq('id', counterId);

        if (counterError) {
          console.warn('[SUPABASE COUNTER SERVED COUNT UPDATE NOTICE]', counterError);
        }
      }

      // 5. Optimistic React state updates
      setTokens((prev) =>
        prev.map((t) => {
          if (t.id === activeToken.id) {
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
              servedCountToday: (c.servedCountToday || 0) + 1,
            };
          }
          return c;
        })
      );

      // 6. Audit log
      addLog(
        'token_completed',
        activeToken.tokenNumber,
        activeToken.customerName,
        `Completed service at ${counter?.name || 'Counter'}`,
        counter?.name
      );

      // 7. Authoritative refresh from Supabase
      await refreshQueue();
    },
    [counters, tokens, refreshQueue, addLog]
  );

  // Mark No Show (Supabase Cloud: public.tokens)
  const markNoShow = useCallback(
    async (counterId: string) => {
      // 1. Find currently active token for this counter
      const token = tokens.find(
        (t) =>
          t.counterId === counterId &&
          (t.status === 'called' || t.status === 'in_service')
      );

      // 2. If no active token exists, return safely
      if (!token) {
        return;
      }

      const counter = counters.find((c) => c.id === counterId);
      const nowIso = new Date().toISOString();

      // 3. Update token in Supabase
      const { error: tokenError } = await supabase
        .from('tokens')
        .update({
          status: 'no_show',
          completed_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', token.id);

      if (tokenError) {
        console.error('[SUPABASE MARK NO-SHOW ERROR]', tokenError);
        return;
      }

      // 4. Authoritative refresh from Supabase
      await refreshQueue();

      // 5. Audit log
      addLog(
        'token_noshow',
        token.tokenNumber,
        token.customerName,
        `Marked as No-Show at ${counter?.name || 'Counter'}`,
        counter?.name
      );
    },
    [counters, tokens, refreshQueue, addLog]
  );

  // Cancel Token
  const cancelToken = useCallback(
    async (tokenId: string) => {
      const token = tokens.find((t) => t.id === tokenId);
      if (!token) return;

      const { error } = await supabase
        .from('tokens')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', tokenId);

      if (error) {
        console.error('[SUPABASE CANCEL TOKEN ERROR]', error);
        return;
      }

      await refreshQueue();
      addLog('token_cancelled', token.tokenNumber, token.customerName, 'Cancelled by user/operator');
    },
    [tokens, refreshQueue, addLog]
  );

  // Transfer Token (Supabase Cloud: public.tokens)
  const transferToken = useCallback(
    async (tokenId: string, targetServiceId: string) => {
      const token = tokens.find((t) => t.id === tokenId);
      if (!token) return;

      const targetService = SERVICE_TYPES.find((s) => s.id === targetServiceId);
      if (!targetService) return;

      const nowIso = new Date().toISOString();

      const { error } = await supabase
        .from('tokens')
        .update({
          service_id: targetServiceId,
          status: 'waiting',
          counter_id: null,
          updated_at: nowIso,
        })
        .eq('id', tokenId);

      if (error) {
        console.error('[SUPABASE TRANSFER TOKEN ERROR]', error);
        return;
      }

      await refreshQueue();
    },
    [tokens, refreshQueue]
  );

  // Update Counter Status (Supabase Cloud)
  const updateCounterStatus = useCallback(
    async (counterId: string, status: CounterStatus) => {
      setCounters((prev) =>
        prev.map((c) => (c.id === counterId ? { ...c, status } : c))
      );
      try {
        const { error } = await supabase
          .from('counters')
          .update({ status })
          .eq('id', counterId);

        if (error) {
          console.warn('[SUPABASE UPDATE COUNTER STATUS ERROR]', error);
        }
      } catch (err) {
        console.warn('Supabase update counter status error:', err);
      }
    },
    []
  );

  // Update Counter Services (Supabase Cloud)
  const updateCounterServices = useCallback(
    async (counterId: string, serviceIds: string[]) => {
      setCounters((prev) =>
        prev.map((c) => (c.id === counterId ? { ...c, supportedServiceIds: serviceIds } : c))
      );
      try {
        await supabase
          .from('counter_services')
          .delete()
          .eq('counter_id', counterId);

        const validServiceIds = serviceIds.filter((sId) => sId && sId !== '*');
        if (validServiceIds.length > 0) {
          const serviceRows = validServiceIds.map((sId) => ({
            counter_id: counterId,
            service_id: sId,
          }));
          await supabase.from('counter_services').insert(serviceRows);
        }
      } catch (err) {
        console.warn('Supabase update counter services error:', err);
      }
    },
    []
  );

  // Update Counter Staff (Supabase Cloud)
  const updateCounterStaff = useCallback(
    async (counterId: string, staffName: string) => {
      setCounters((prev) =>
        prev.map((c) => (c.id === counterId ? { ...c, staffName } : c))
      );
      try {
        const { error } = await supabase
          .from('counters')
          .update({ staff_name: staffName })
          .eq('id', counterId);

        if (error) {
          console.warn('[SUPABASE UPDATE COUNTER STAFF ERROR]', error);
        }
      } catch (err) {
        console.warn('Supabase update counter staff error:', err);
      }
    },
    []
  );

  // Update Counter Name (Supabase Cloud)
  const updateCounterName = useCallback(
    async (counterId: string, name: string) => {
      setCounters((prev) =>
        prev.map((c) => (c.id === counterId ? { ...c, name } : c))
      );
      try {
        const { error } = await supabase
          .from('counters')
          .update({ name })
          .eq('id', counterId);

        if (error) {
          console.warn('[SUPABASE UPDATE COUNTER NAME ERROR]', error);
        }
      } catch (err) {
        console.warn('Supabase update counter name error:', err);
      }
    },
    []
  );

  // Delete Counter (Supabase Cloud)
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
        await supabase
          .from('counter_services')
          .delete()
          .eq('counter_id', counterId);

        const { error } = await supabase
          .from('counters')
          .delete()
          .eq('id', counterId);

        if (error) {
          console.warn('[SUPABASE DELETE COUNTER ERROR]', error);
        }
      } catch (err) {
        console.warn('Supabase delete-counter notice:', err);
      }
    },
    []
  );

  // Add New Counter (Supabase Cloud: public.counters & public.counter_services)
  const addNewCounter = useCallback(
    async (name: string, staffName: string, serviceIds: string[]) => {
      // Calculate next counter code (e.g. C1, C2, C3...)
      const existingCodes = counters.map((c) => {
        const match = c.code.match(/^C-?(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxNum = existingCodes.length > 0 ? Math.max(...existingCodes, 0) : 0;
      const code = `C${maxNum + 1}`;

      // 1. Insert into Supabase public.counters (Supabase generates authentic UUID)
      const { data: insertedCounter, error: insertError } = await supabase
        .from('counters')
        .insert({
          code,
          name: name.trim(),
          staff_name: staffName.trim(),
          status: 'active',
          served_count_today: 0,
          average_service_minutes: 5,
        })
        .select()
        .single();

      if (insertError || !insertedCounter) {
        console.error('[SUPABASE COUNTER CREATE ERROR]', insertError);
        throw new Error(insertError?.message || 'Failed to create counter in Supabase');
      }

      // 2. Persist service mappings in public.counter_services if specific services are specified
      const validServiceIds = serviceIds.filter((sId) => sId && sId !== '*');
      if (validServiceIds.length > 0) {
        const serviceRows = validServiceIds.map((sId) => ({
          counter_id: insertedCounter.id,
          service_id: sId,
        }));
        const { error: servicesError } = await supabase
          .from('counter_services')
          .insert(serviceRows);

        if (servicesError) {
          console.warn('[SUPABASE COUNTER SERVICES INSERT ERROR]', servicesError);
        }
      }

      // 3. Immediately reflect in local state and refresh
      const createdCounter: Counter = {
        id: insertedCounter.id,
        name: insertedCounter.name,
        code: insertedCounter.code,
        staffName: insertedCounter.staff_name || '',
        supportedServiceIds: serviceIds.length > 0 ? serviceIds : ['*'],
        status: insertedCounter.status || 'active',
        servedCountToday: insertedCounter.served_count_today ?? 0,
        averageServiceMinutes: insertedCounter.average_service_minutes ?? 5,
      };

      setCounters((prev) => [...prev.filter((c) => c.id !== createdCounter.id), createdCounter]);
      await refreshQueue();
    },
    [counters, refreshQueue]
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
    const { error } = await supabase.rpc('reset_queue_data');

    if (error) {
      console.error('[SUPABASE RESET QUEUE ERROR]', error);
      return;
    }

    setActiveCustomerTokenId(null);
    setCustomerTokenIds([]);
    setLastCalledToken(null);
    localStorage.removeItem(STORAGE_KEY_TOKENS);
    localStorage.removeItem(STORAGE_KEY_COUNTERS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_TOKEN);
    localStorage.removeItem(STORAGE_KEY_CUSTOMER_TOKENS);
    await refreshQueue();
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
        customerTokenIds,
        customerTokens,
        addCustomerToken,
        removeCustomerToken,
        lastCalledToken,
        isSimulating,
        isMuted,
        stats,
        generateToken,
        callNext,
        recallToken,
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
        setActiveCustomerToken: handleSetActiveCustomerToken,
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

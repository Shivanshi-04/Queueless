import type { Counter, PriorityLevel, ServiceTypeDefinition, Token } from '../types/queue';

const PRIORITY_WEIGHTS: Record<PriorityLevel, number> = {
  urgent: 400,
  vip: 300,
  senior_disabled: 200,
  regular: 100,
};

/**
 * Returns numeric priority score
 */
export function getPriorityScore(priority: PriorityLevel): number {
  return PRIORITY_WEIGHTS[priority] || 100;
}

/**
 * Sorts tokens according to priority hierarchy and FIFO time
 */
export function sortTokensByPriority(tokens: Token[]): Token[] {
  return [...tokens].sort((a, b) => {
    const scoreA = getPriorityScore(a.priority);
    const scoreB = getPriorityScore(b.priority);

    if (scoreA !== scoreB) {
      return scoreB - scoreA; // higher priority first
    }
    return a.createdAt - b.createdAt; // earlier arrival first
  });
}

/**
 * Finds next best token for a specific counter based on supported services and priority
 */
export function findNextTokenForCounter(counter: Counter, allTokens: Token[]): Token | undefined {
  const waitingTokens = allTokens.filter((t) => t.status === 'waiting');

  const eligibleTokens = waitingTokens.filter((t) => {
    if (counter.supportedServiceIds.includes('*')) return true;
    return counter.supportedServiceIds.includes(t.serviceId);
  });

  const sorted = sortTokensByPriority(eligibleTokens);
  return sorted[0];
}

/**
 * Computes exact position in line for a customer
 */
export function calculateQueuePosition(targetTokenId: string, allTokens: Token[]): {
  position: number;
  peopleAhead: number;
  totalWaitingInService: number;
} {
  const targetToken = allTokens.find((t) => t.id === targetTokenId);
  if (!targetToken) {
    return { position: 0, peopleAhead: 0, totalWaitingInService: 0 };
  }

  if (targetToken.status !== 'waiting') {
    return { position: 0, peopleAhead: 0, totalWaitingInService: 0 };
  }

  // Filter tokens in the same service category
  const waitingInService = allTokens.filter(
    (t) => t.status === 'waiting' && t.serviceId === targetToken.serviceId
  );
  const sorted = sortTokensByPriority(waitingInService);
  const index = sorted.findIndex((t) => t.id === targetTokenId);

  const position = index >= 0 ? index + 1 : 0;
  const peopleAhead = Math.max(0, position - 1);

  return {
    position,
    peopleAhead,
    totalWaitingInService: waitingInService.length,
  };
}

/**
 * Computes estimated wait time in minutes
 */
export function estimateWaitTime(
  token: Token,
  allTokens: Token[],
  counters: Counter[],
  services: ServiceTypeDefinition[]
): number {
  if (token.status === 'in_service' || token.status === 'called') return 0;
  if (token.status === 'completed' || token.status === 'cancelled') return 0;

  const service = services.find((s) => s.id === token.serviceId);
  const avgDuration = service ? service.avgDurationMins : 8;

  // Active counters that can handle this service
  const activeCounters = counters.filter(
    (c) =>
      c.status === 'active' &&
      (c.supportedServiceIds.includes('*') || c.supportedServiceIds.includes(token.serviceId))
  ).length;

  const effectiveCounters = Math.max(1, activeCounters);

  const { peopleAhead } = calculateQueuePosition(token.id, allTokens);

  // Priority adjustment multiplier
  let priorityDiscount = 1.0;
  if (token.priority === 'urgent') priorityDiscount = 0.3;
  else if (token.priority === 'vip') priorityDiscount = 0.5;
  else if (token.priority === 'senior_disabled') priorityDiscount = 0.7;

  const rawMinutes = Math.ceil(((peopleAhead + 1) * avgDuration * priorityDiscount) / effectiveCounters);
  return Math.max(1, rawMinutes);
}

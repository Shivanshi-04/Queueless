import React from 'react';
import { useQueue } from '../../context/QueueContext';
import type { Counter, PriorityLevel } from '../../types/queue';
import { PriorityBadge } from '../common/Badge';
import {
  PhoneCall,
  Bell,
  CheckCircle,
  UserX,
  Clock,
  User,
  Power,
  Layers,
  Coffee,
} from 'lucide-react';

interface CounterControlGridProps {
  onOpenCounterManager: () => void;
}

export const CounterControlGrid: React.FC<CounterControlGridProps> = ({ onOpenCounterManager }) => {
  const {
    counters,
    tokens,
    services,
    callNext,
    recallToken,
    completeService,
    markNoShow,
    updateCounterStatus,
  } = useQueue();

  const getServingToken = (counter: Counter) => {
    if (!counter.currentServingTokenId) return null;
    return tokens.find((t) => t.id === counter.currentServingTokenId) || null;
  };

  const getNextCandidate = (counter: Counter) => {
    const waitingTokens = tokens.filter((t) => t.status === 'waiting');
    const eligible = waitingTokens.filter((t) => {
      if (counter.supportedServiceIds.includes('*')) return true;
      return counter.supportedServiceIds.includes(t.serviceId);
    });
    return eligible.sort((a, b) => {
      const pWeights: Record<PriorityLevel, number> = { urgent: 400, vip: 300, senior_disabled: 200, regular: 100 };
      if (pWeights[a.priority] !== pWeights[b.priority]) {
        return pWeights[b.priority] - pWeights[a.priority];
      }
      return a.createdAt - b.createdAt;
    })[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Active Service Counters</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700">
              {counters.filter((c) => c.status === 'active').length}/{counters.length} Active
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Control live counter desks, call next priority customers, and manage service throughput.
          </p>
        </div>

        <button
          onClick={onOpenCounterManager}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Manage Desks & Staff</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {counters.map((counter) => {
          const servingToken = getServingToken(counter);
          const nextCandidate = getNextCandidate(counter);
          const isServing = servingToken !== null;
          const isPaused = counter.status === 'paused';
          const isClosed = counter.status === 'closed';

          return (
            <div
              key={counter.id}
              className={`glass-panel rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                isServing
                  ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : isPaused
                  ? 'border-amber-500/40 bg-slate-900/80'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
                        {counter.code}
                      </span>
                      <h3 className="font-bold text-slate-100 text-sm">{counter.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{counter.staffName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {counter.status === 'active' ? (
                      <button
                        onClick={() => updateCounterStatus(counter.id, 'paused')}
                        title="Put Counter on Break"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                      >
                        <Coffee className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateCounterStatus(counter.id, 'active')}
                        title="Resume Counter"
                        className="p-1.5 rounded-lg text-amber-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {counter.supportedServiceIds.includes('*') ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      All Services
                    </span>
                  ) : (
                    counter.supportedServiceIds.map((sid) => {
                      const service = services.find((s) => s.id === sid);
                      return (
                        <span
                          key={sid}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300 font-medium truncate max-w-[140px]"
                        >
                          {service?.name || sid}
                        </span>
                      );
                    })
                  )}
                </div>

                {isPaused ? (
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center my-3">
                    <Coffee className="w-6 h-6 text-amber-400 mx-auto mb-1 animate-pulse" />
                    <p className="text-xs font-bold text-amber-300">Desk on Break</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click resume to start calling tickets</p>
                  </div>
                ) : servingToken ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/40 shadow-inner my-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Now Serving
                      </span>
                      <PriorityBadge priority={servingToken.priority} size="sm" />
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black font-mono tracking-tight text-white">
                        {servingToken.tokenNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {servingToken.serviceName}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-indigo-900/60 flex items-center justify-between text-xs">
                      <span className="text-slate-200 font-semibold truncate max-w-[130px]">
                        {servingToken.customerName}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {servingToken.contact}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center my-2">
                    <Clock className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-400">Desk is Idle</p>
                    {nextCandidate ? (
                      <p className="text-[11px] text-indigo-300 mt-1 flex items-center justify-center gap-1">
                        <span>Next up:</span>
                        <span className="font-mono font-bold">{nextCandidate.tokenNumber}</span>
                        <span>({nextCandidate.customerName})</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-1">No matching tickets in queue</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                {!isServing ? (
                  <button
                    onClick={() => callNext(counter.id)}
                    disabled={isPaused || isClosed || !nextCandidate}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                      !isPaused && !isClosed && nextCandidate
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/20 active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Next Customer</span>
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => completeService(counter.id)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Complete Service</span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => recallToken(counter.id)}
                        className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                        title="Repeat audio chime call"
                      >
                        <Bell className="w-3 h-3 text-indigo-400" />
                        <span>Recall</span>
                      </button>

                      <button
                        onClick={() => markNoShow(counter.id)}
                        className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-300 text-[11px] font-semibold border border-slate-700 hover:border-rose-800/60 flex items-center justify-center gap-1.5 transition-all"
                        title="Customer did not show up"
                      >
                        <UserX className="w-3 h-3" />
                        <span>No-Show</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>Served: {counter.servedCountToday}</span>
                  <span>Avg: {counter.averageServiceMinutes}m</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Service Counters</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
              {counters.filter((c) => c.status === 'active').length}/{counters.length} Active
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Call upcoming customers, complete services, and manage counter staff.
          </p>
        </div>

        <button
          onClick={onOpenCounterManager}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm w-fit"
        >
          <Layers className="w-4 h-4 text-indigo-400" />
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
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between bg-slate-900/90 shadow-xl ${
                isServing
                  ? 'border-indigo-500/50 shadow-indigo-500/5'
                  : isPaused
                  ? 'border-amber-500/40'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Card Top: Code, Name, Staff, Break Toggle */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
                        {counter.code}
                      </span>
                      <h3 className="font-bold text-slate-100 text-sm">{counter.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{counter.staffName || 'Staff Officer'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {counter.status === 'active' ? (
                      <button
                        onClick={() => updateCounterStatus(counter.id, 'paused')}
                        title="Put Desk on Break"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                      >
                        <Coffee className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateCounterStatus(counter.id, 'active')}
                        title="Resume Desk"
                        className="p-1.5 rounded-lg text-amber-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Desk Status View */}
                {isPaused ? (
                  <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center my-2">
                    <Coffee className="w-6 h-6 text-amber-400 mx-auto mb-1 animate-pulse" />
                    <p className="text-xs font-bold text-amber-300">Desk on Break</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click resume button above to call tickets</p>
                  </div>
                ) : servingToken ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 my-2 text-center">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Serving Now
                      </span>
                      <PriorityBadge priority={servingToken.priority} size="sm" />
                    </div>

                    <div className="text-3xl font-black font-mono text-white tracking-tight my-1">
                      {servingToken.tokenNumber}
                    </div>

                    <div className="text-xs font-bold text-slate-200 truncate">
                      {servingToken.customerName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {servingToken.serviceName}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-dashed border-slate-800 text-center my-2">
                    <Clock className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-300">Desk is Idle</p>
                    {nextCandidate ? (
                      <p className="text-[11px] text-indigo-300 mt-1 flex items-center justify-center gap-1">
                        <span>Next:</span>
                        <span className="font-mono font-bold text-white">{nextCandidate.tokenNumber}</span>
                        <span className="truncate max-w-[100px]">({nextCandidate.customerName})</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-1">No pending tickets in queue</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                {!isServing ? (
                  <button
                    onClick={() => callNext(counter.id)}
                    disabled={isPaused || isClosed || !nextCandidate}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                      !isPaused && !isClosed && nextCandidate
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-[0.98]'
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
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Complete Service</span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => recallToken(counter.id)}
                        className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Repeat audio chime call"
                      >
                        <Bell className="w-3 h-3 text-indigo-400" />
                        <span>Recall</span>
                      </button>

                      <button
                        onClick={() => markNoShow(counter.id)}
                        className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-300 text-[11px] font-semibold border border-slate-700 hover:border-rose-800/60 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Customer did not show up"
                      >
                        <UserX className="w-3 h-3" />
                        <span>No-Show</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>Served: {counter.servedCountToday} today</span>
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

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
          <h2 className="text-base sm:text-lg font-bold text-[#2D3441] flex items-center gap-2">
            <span>Service Counters</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EDECEB] text-[#2D3441] font-mono border border-[#A9A7A8]/50 font-bold">
              {counters.filter((c) => c.status === 'active').length}/{counters.length} Active
            </span>
          </h2>
          <p className="text-xs text-[#6C7380]">
            Call upcoming customers, complete services, and manage counter staff.
          </p>
        </div>

        <button
          onClick={onOpenCounterManager}
          className="px-3.5 py-2 rounded-xl bg-[#F8F8F6] hover:bg-[#EDECEB] text-xs font-bold text-[#2D3441] border border-[#A9A7A8]/50 transition-all flex items-center gap-2 cursor-pointer shadow-sm w-fit"
        >
          <Layers className="w-4 h-4 text-[#E07015]" />
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
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between bg-[#F8F8F6] shadow-sm ${
                isServing
                  ? 'border-[#E07015] ring-2 ring-[#E07015]/20 shadow-md'
                  : isPaused
                  ? 'border-[#DF9B60]'
                  : 'border-[#A9A7A8]/40'
              }`}
            >
              <div>
                {/* Card Top: Code, Name, Staff, Break Toggle */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#E07015]/15 text-[#E07015] font-mono font-bold text-xs border border-[#E07015]/30">
                        {counter.code}
                      </span>
                      <h3 className="font-bold text-[#2D3441] text-sm">{counter.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6C7380] mt-1">
                      <User className="w-3.5 h-3.5 text-[#A9A7A8]" />
                      <span>{counter.staffName || 'Staff Officer'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {counter.status === 'active' ? (
                      <button
                        onClick={() => updateCounterStatus(counter.id, 'paused')}
                        title="Put Desk on Break"
                        className="p-1.5 rounded-lg text-[#6C7380] hover:text-[#E07015] hover:bg-[#EDECEB] transition-colors cursor-pointer"
                      >
                        <Coffee className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateCounterStatus(counter.id, 'active')}
                        title="Resume Desk"
                        className="p-1.5 rounded-lg text-[#E07015] hover:text-emerald-600 hover:bg-[#EDECEB] transition-colors cursor-pointer"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Desk Status View */}
                {isPaused ? (
                  <div className="p-5 rounded-xl bg-[#DFCAB2]/25 border border-[#DF9B60]/60 text-center my-2">
                    <Coffee className="w-6 h-6 text-[#E07015] mx-auto mb-1 animate-pulse" />
                    <p className="text-xs font-bold text-[#E07015]">Desk on Break</p>
                    <p className="text-[11px] text-[#6C7380] mt-0.5">Click resume button above to call tickets</p>
                  </div>
                ) : servingToken ? (
                  <div className="p-4 rounded-xl bg-white border border-[#E07015]/40 my-2 text-center shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Serving Now
                      </span>
                      <PriorityBadge priority={servingToken.priority} size="sm" />
                    </div>

                    <div className="text-3xl font-black font-mono text-[#2D3441] tracking-tight my-1">
                      {servingToken.tokenNumber}
                    </div>

                    <div className="text-xs font-bold text-[#2D3441] truncate">
                      {servingToken.customerName}
                    </div>
                    <div className="text-[11px] text-[#E07015] font-semibold">
                      {servingToken.serviceName}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#EDECEB]/60 border border-dashed border-[#A9A7A8]/70 text-center my-2">
                    <Clock className="w-5 h-5 text-[#A9A7A8] mx-auto mb-1" />
                    <p className="text-xs font-semibold text-[#6C7380]">Desk is Idle</p>
                    {nextCandidate ? (
                      <p className="text-[11px] text-[#E07015] mt-1 flex items-center justify-center gap-1 font-medium">
                        <span>Next:</span>
                        <span className="font-mono font-bold text-[#2D3441]">{nextCandidate.tokenNumber}</span>
                        <span className="truncate max-w-[100px] text-[#6C7380]">({nextCandidate.customerName})</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#A9A7A8] mt-1">No pending tickets in queue</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#A9A7A8]/30 space-y-2">
                {!isServing ? (
                  <button
                    onClick={() => callNext(counter.id)}
                    disabled={isPaused || isClosed || !nextCandidate}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                      !isPaused && !isClosed && nextCandidate
                        ? 'bg-[#E07015] hover:bg-[#DF9B60] text-white shadow-[#E07015]/25 active:scale-[0.98]'
                        : 'bg-[#EDECEB] text-[#A9A7A8] cursor-not-allowed border border-[#A9A7A8]/40'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Next Customer</span>
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => completeService(counter.id)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Complete Service</span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => recallToken(counter.id)}
                        className="py-1.5 px-2 rounded-lg bg-[#EDECEB] hover:bg-[#DFCAB2]/50 text-[#2D3441] text-[11px] font-semibold border border-[#A9A7A8]/50 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Repeat audio chime call"
                      >
                        <Bell className="w-3 h-3 text-[#E07015]" />
                        <span>Recall</span>
                      </button>

                      <button
                        onClick={() => markNoShow(counter.id)}
                        className="py-1.5 px-2 rounded-lg bg-[#EDECEB] hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Customer did not show up"
                      >
                        <UserX className="w-3 h-3" />
                        <span>No-Show</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-[#6C7380] font-mono pt-1">
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

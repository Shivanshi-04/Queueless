import React, { useEffect, useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { calculateQueuePosition, estimateWaitTime } from '../../services/queueEngine';
import { PriorityBadge } from '../common/Badge';
import confetti from 'canvas-confetti';
import {
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Volume2,
  XCircle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

interface LiveTokenPassProps {
  onNewTokenRequest: () => void;
  onOpenLookup: () => void;
}

export const LiveTokenPass: React.FC<LiveTokenPassProps> = ({
  onNewTokenRequest,
  onOpenLookup,
}) => {
  const {
    tokens,
    counters,
    services,
    activeCustomerTokenId,
    cancelToken,
  } = useQueue();

  const token = tokens.find((t) => t.id === activeCustomerTokenId);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    if (token?.status === 'completed' && !hasTriggeredConfetti) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#38bdf8'],
        });
        setHasTriggeredConfetti(true);
      } catch {}
    }
  }, [token?.status, hasTriggeredConfetti]);

  if (!token) {
    return (
      <div className="max-w-md mx-auto text-center glass-panel rounded-3xl p-8 border border-slate-800 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">No Active Token Found</h3>
        <p className="text-sm text-slate-400 mt-2 mb-6">
          You don't have an active ticket in session. Generate a new token or look up your existing ticket.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onNewTokenRequest}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate New Token</span>
          </button>
          <button
            onClick={onOpenLookup}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <span>Look Up Ticket</span>
          </button>
        </div>
      </div>
    );
  }

  const { position, peopleAhead } = calculateQueuePosition(token.id, tokens);
  const currentEta = estimateWaitTime(token, tokens, counters, services);

  const getStepProgress = () => {
    switch (token.status) {
      case 'waiting':
        return 2;
      case 'called':
      case 'in_service':
        return 3;
      case 'completed':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStepProgress();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Called Banner Alert */}
      {token.status === 'called' && (
        <div className="rounded-3xl p-6 bg-gradient-to-r from-indigo-900/90 via-indigo-800/90 to-purple-900/90 border-2 border-indigo-400 shadow-2xl shadow-indigo-500/30 text-white animate-bounce-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-sm animate-pulse">
              <Volume2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>You're Up Next!</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Please Proceed to {token.counterName || 'Assigned Counter'}
              </h3>
              <p className="text-indigo-100 text-sm mt-1">
                Staff member <span className="font-bold underline">{token.staffName || 'Officer'}</span> is waiting for you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Digital Boarding Pass Ticket */}
      <div className="glass-panel rounded-3xl border border-slate-700/90 shadow-2xl overflow-hidden relative">
        {/* Ticket Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/40 border-b border-dashed border-slate-700/80 relative">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">
                QueueLess Pass
              </span>
              <PriorityBadge priority={token.priority} size="sm" />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Issued: {new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Token Number</p>
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white mt-1 drop-shadow-md">
                {token.tokenNumber}
              </div>
              <div className="mt-2 text-sm text-slate-300 font-semibold flex items-center gap-2">
                <span>{token.customerName}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-normal">{token.contact}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Service Category
              </span>
              <span className="inline-block mt-1 px-3 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-sm font-bold">
                {token.serviceName}
              </span>
            </div>
          </div>
        </div>

        {/* Live Queue Status & ETA Metric Cards */}
        <div className="p-6 sm:p-8 space-y-6">
          {token.status === 'waiting' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-panel-light rounded-2xl p-4 border border-slate-700/60 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-400">Your Current Position</div>
                  <div className="text-2xl font-black font-mono text-slate-100 mt-0.5">
                    #{position > 0 ? position : 1}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      ({peopleAhead} {peopleAhead === 1 ? 'person' : 'people'} ahead)
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-panel-light rounded-2xl p-4 border border-slate-700/60 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-400">Estimated Wait Time</div>
                  <div className="text-2xl font-black font-mono text-indigo-300 mt-0.5">
                    ~{currentEta} Mins
                  </div>
                </div>
              </div>
            </div>
          )}

          {token.status === 'in_service' && (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <span className="w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Currently Being Served
                </div>
                <div className="text-lg font-bold text-slate-100 mt-0.5">
                  At {token.counterName} ({token.staffName})
                </div>
              </div>
            </div>
          )}

          {token.status === 'completed' && (
            <div className="p-6 rounded-2xl bg-sky-950/40 border border-sky-500/40 text-center">
              <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Service Completed</h4>
              <p className="text-xs text-slate-300 mt-1">
                Thank you for using QueueLess. We hope your service was fast and smooth!
              </p>
            </div>
          )}

          {token.status === 'cancelled' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-200">Token Cancelled</h4>
              <p className="text-xs text-slate-400 mt-1">
                This token was cancelled and is no longer active in the queue.
              </p>
            </div>
          )}

          {/* Visual Step Progress Tracker */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Queue Progress
            </p>
            <div className="grid grid-cols-4 gap-2 relative">
              {[
                { step: 1, label: 'Checked In' },
                { step: 2, label: 'In Queue' },
                { step: 3, label: 'At Counter' },
                { step: 4, label: 'Completed' },
              ].map((s) => {
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <div key={s.step} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 mb-1.5 ${
                        isPassed
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      } ${isCurrent ? 'ring-4 ring-indigo-500/20' : ''}`}
                    >
                      {isPassed && s.step < currentStep ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        s.step
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold leading-tight ${
                        isPassed ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Notes */}
          {token.notes && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Special Notes: </span>
              {token.notes}
            </div>
          )}
        </div>

        {/* Ticket Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-900/60 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onNewTokenRequest}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Take Another Token</span>
            </button>
            <button
              onClick={onOpenLookup}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
            >
              Switch Ticket
            </button>
          </div>

          {token.status === 'waiting' && (
            <button
              onClick={() => cancelToken(token.id)}
              className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Ticket</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

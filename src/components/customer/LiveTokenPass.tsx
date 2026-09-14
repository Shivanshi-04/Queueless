import React, { useEffect, useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { calculateQueuePosition, estimateWaitTime } from '../../services/queueEngine';
import { PriorityBadge } from '../common/Badge';
import confetti from 'canvas-confetti';
import {
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
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#38bdf8'],
        });
        setHasTriggeredConfetti(true);
      } catch {}
    }
  }, [token?.status, hasTriggeredConfetti]);

  if (!token) {
    return (
      <div className="max-w-md mx-auto text-center bg-slate-900/90 rounded-2xl p-8 border border-slate-800 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Active Ticket Selected</h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          You don't have an active ticket in session. Generate a new token or look up your existing ticket.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={onNewTokenRequest}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Take New Token</span>
          </button>
          <button
            onClick={onOpenLookup}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            Look Up Ticket
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
    <div className="max-w-lg mx-auto space-y-4">
      {/* Called Banner Alert */}
      {token.status === 'called' && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 border-2 border-indigo-400 shadow-xl text-white animate-pulse flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>It's Your Turn!</span>
            </div>
            <h3 className="text-xl font-black">
              Please Proceed to {token.counterName || 'Service Desk'}
            </h3>
            <p className="text-indigo-200 text-xs mt-0.5">
              Staff Officer: <span className="font-bold text-white">{token.staffName || 'Officer'}</span>
            </p>
          </div>
        </div>
      )}

      {/* Digital Ticket Card */}
      <div className="bg-slate-900/95 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Ticket Header */}
        <div className="p-6 bg-slate-950 border-b border-dashed border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-mono">
                QueueLess Pass
              </span>
              <PriorityBadge priority={token.priority} size="sm" />
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Token Number</span>
              <div className="text-5xl font-black font-mono tracking-tight text-white mt-0.5">
                {token.tokenNumber}
              </div>
              <div className="mt-1.5 text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <span className="font-semibold text-white">{token.customerName}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{token.contact}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Service
              </span>
              <span className="inline-block mt-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                {token.serviceName}
              </span>
            </div>
          </div>
        </div>

        {/* Live Queue Position & Wait Time */}
        <div className="p-6 space-y-5">
          {token.status === 'waiting' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Your Position</div>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  #{position > 0 ? position : 1}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {peopleAhead} {peopleAhead === 1 ? 'person' : 'people'} ahead
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Est. Wait Time</div>
                <div className="text-2xl font-black font-mono text-indigo-300 mt-1">
                  ~{currentEta} mins
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Live auto-calculated
                </div>
              </div>
            </div>
          )}

          {token.status === 'in_service' && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Currently In Service</div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  Being served at {token.counterName || 'Counter'} with {token.staffName || 'Staff'}
                </div>
              </div>
            </div>
          )}

          {token.status === 'completed' && (
            <div className="p-5 rounded-xl bg-sky-950/30 border border-sky-500/30 text-center">
              <CheckCircle2 className="w-8 h-8 text-sky-400 mx-auto mb-1.5" />
              <h4 className="text-sm font-bold text-white">Service Completed</h4>
              <p className="text-xs text-slate-300 mt-0.5">Thank you for visiting! Your service has been completed.</p>
            </div>
          )}

          {token.status === 'cancelled' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <h4 className="text-xs font-bold text-slate-300">Token Cancelled</h4>
            </div>
          )}

          {/* Clean Step Progress Bar */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Queue Status
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { step: 1, label: 'Checked In' },
                { step: 2, label: 'Waiting' },
                { step: 3, label: 'At Desk' },
                { step: 4, label: 'Done' },
              ].map((s) => {
                const isPassed = currentStep >= s.step;
                return (
                  <div key={s.step} className="flex flex-col items-center text-center">
                    <div
                      className={`w-full h-1.5 rounded-full mb-1.5 transition-colors ${
                        isPassed ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    />
                    <span className={`text-[10px] font-semibold ${isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={onNewTokenRequest}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Take Another Token</span>
          </button>

          {token.status === 'waiting' && (
            <button
              onClick={() => cancelToken(token.id)}
              className="px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
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

import React, { useEffect, useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { calculateQueuePosition, estimateWaitTime } from '../../services/queueEngine';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Volume2,
  XCircle,
  PlusCircle,
  Sparkles,
  Layers,
  X,
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
    customerTokens,
    setActiveCustomerToken,
    removeCustomerToken,
    cancelToken,
  } = useQueue();

  const activeCustomerTokens = customerTokens.filter(
    (t) => t.status === 'waiting' || t.status === 'called' || t.status === 'in_service'
  );

  const selectedToken = tokens.find((t) => t.id === activeCustomerTokenId);
  const isSelectedActive =
    selectedToken &&
    (selectedToken.status === 'waiting' ||
      selectedToken.status === 'called' ||
      selectedToken.status === 'in_service');

  const token =
    (isSelectedActive ? selectedToken : activeCustomerTokens[0]) ||
    selectedToken ||
    customerTokens[0];

  useEffect(() => {
    if (activeCustomerTokens.length > 0 && (!selectedToken || !isSelectedActive)) {
      setActiveCustomerToken(activeCustomerTokens[0].id);
    }
  }, [activeCustomerTokens, selectedToken, isSelectedActive, setActiveCustomerToken]);

  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  // Check if another of the user's tickets is currently being called
  const calledOtherToken = activeCustomerTokens.find(
    (t) => t.id !== token?.id && t.status === 'called'
  );

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
      <div className="max-w-md mx-auto text-center bg-[#F8F8F6] rounded-2xl p-8 border border-[#A9A7A8]/35 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-[#E07015]/15 text-[#E07015] border border-[#E07015]/30 flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-[#2D3441]">No Active Ticket In Session</h3>
        <p className="text-xs text-[#6C7380] mt-1 mb-5">
          You don't currently have an active ticket selected. You can take a new digital ticket or look up an existing one.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={onNewTokenRequest}
            className="px-4 py-2.5 rounded-xl bg-[#E07015] hover:bg-[#C75D0D] text-white font-bold text-xs shadow-md shadow-[#E07015]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Take New Token</span>
          </button>
          <button
            onClick={onOpenLookup}
            className="px-4 py-2.5 rounded-xl bg-[#EDECEB] hover:bg-white text-[#2D3441] font-bold text-xs border border-[#A9A7A8]/40 transition-all cursor-pointer shadow-sm"
          >
            Look Up Existing Ticket
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
      {/* Multi-Ticket Selector Header (Visible whenever user has 2 or more active tickets) */}
      {activeCustomerTokens.length > 1 && (
        <div className="bg-[#F8F8F6] rounded-2xl p-4 border border-[#A9A7A8]/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#E07015]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#2D3441]">
                My Passes ({activeCustomerTokens.length} Active Tickets)
              </h3>
            </div>
            <button
              onClick={onNewTokenRequest}
              className="text-[11px] font-bold text-[#E07015] hover:text-[#C75D0D] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Another</span>
            </button>
          </div>

          {/* Quick Ticket Switcher Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeCustomerTokens.map((t) => {
              const isCurrent = t.id === token.id;
              const { position: tPos } = calculateQueuePosition(t.id, tokens);
              const tEta = estimateWaitTime(t, tokens, counters, services);
              const isCalled = t.status === 'called';

              return (
                <div
                  key={t.id}
                  onClick={() => setActiveCustomerToken(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isCurrent
                      ? 'bg-white border-[#E07015] ring-2 ring-[#E07015]/25 shadow-md'
                      : isCalled
                      ? 'bg-amber-500/10 border-[#E07015] animate-pulse'
                      : 'bg-white/80 border-[#A9A7A8]/30 hover:bg-white hover:border-[#DF9B60]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-[#2D3441] text-white shadow-xs'
                          : isCalled
                          ? 'bg-[#E07015] text-white'
                          : 'bg-[#EDECEB] text-[#2D3441]'
                      }`}
                    >
                      {t.tokenNumber}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#2D3441] truncate">
                          {t.serviceName}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6C7380] flex items-center gap-1.5">
                        {isCalled ? (
                          <span className="text-[#E07015] font-black animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E07015] animate-ping" />
                            Called: {t.counterName || 'Desk'}!
                          </span>
                        ) : t.status === 'in_service' ? (
                          <span className="text-emerald-600 font-bold">At Counter</span>
                        ) : t.status === 'waiting' ? (
                          <span>Pos #{tPos} • ~{tEta}m</span>
                        ) : (
                          <span className="capitalize">{t.status}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isCurrent ? (
                      <span className="px-1.5 py-0.5 rounded bg-[#E07015]/15 text-[#E07015] text-[10px] font-bold">
                        Viewing
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#6C7380] group-hover:text-[#E07015]">
                        View →
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomerToken(t.id);
                      }}
                      title="Remove from my tickets"
                      className="p-1 rounded-md text-[#A9A7A8] hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Urgent Alert Banner if ANOTHER ticket of this customer is being called */}
      {calledOtherToken && (
        <div
          onClick={() => setActiveCustomerToken(calledOtherToken.id)}
          className="rounded-2xl p-4 bg-gradient-to-r from-[#E07015] via-[#C75D0D] to-[#2D3441] border-2 border-[#DF9B60] shadow-xl text-white animate-pulse flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 text-white shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#DFCAB2] block">
                Attention: Your Other Ticket is Being Called!
              </span>
              <div className="text-sm font-bold mt-0.5">
                Token <span className="font-mono underline decoration-[#DFCAB2] font-black">{calledOtherToken.tokenNumber}</span> ({calledOtherToken.serviceName}) → Proceed to <span className="font-mono font-black">{calledOtherToken.counterName || 'Service Counter'}</span>
              </div>
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-xl bg-white text-[#E07015] text-xs font-black shrink-0 shadow-sm cursor-pointer hover:bg-[#F8F8F6]">
            Switch to This Pass →
          </button>
        </div>
      )}

      {/* Called Banner Alert in Warm Orange for Current Token */}
      {token.status === 'called' && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-[#E07015] via-[#C75D0D] to-[#2D3441] border-2 border-[#DF9B60] shadow-xl text-white animate-pulse flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#DFCAB2]" />
              <span>It's Your Turn Now!</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Please Proceed to {token.counterName || 'Service Desk'}
            </h3>
            <p className="text-[#DFCAB2] text-xs mt-0.5 font-medium">
              Assigned Staff Officer: <span className="font-bold text-white">{token.staffName || 'Officer'}</span>
            </p>
          </div>
        </div>
      )}

      {/* Digital Ticket Card */}
      <div className="bg-[#F8F8F6] rounded-2xl border border-[#A9A7A8]/40 shadow-xl overflow-hidden">
        {/* Ticket Header (Boarding Pass Top in Deep Navy Charcoal) */}
        <div className="p-6 bg-[#2D3441] text-white border-b-2 border-dashed border-[#A9A7A8]/40 relative">
          {/* Subtle Decorative Cutouts */}
          <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#EDECEB]" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-[#EDECEB]" />

          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DF9B60] font-mono">
                QueueLess Pass
              </span>
              <PriorityBadge priority={token.priority} size="sm" />
            </div>
            <span className="text-xs text-[#A9A7A8] font-mono">
              Issued {new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#A9A7A8] uppercase tracking-wider">
                Your Token Number
              </span>
              <div className="text-5xl font-black font-mono tracking-tight text-white mt-0.5 drop-shadow-sm">
                {token.tokenNumber}
              </div>
              <div className="mt-1.5 text-xs text-slate-200 font-medium flex items-center gap-1.5">
                <span className="font-bold text-white">{token.customerName}</span>
                <span className="text-[#A9A7A8]">•</span>
                <span className="text-[#A9A7A8]">{token.contact}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-[#A9A7A8] uppercase tracking-wider block">
                Service Desk
              </span>
              <span className="inline-block mt-1 px-3 py-1 rounded-lg bg-[#E07015]/20 text-[#DFCAB2] border border-[#DFCAB2]/30 text-xs font-bold">
                {token.serviceName}
              </span>
            </div>
          </div>
        </div>

        {/* Live Queue Position & Wait Time */}
        <div className="p-6 space-y-5">
          {token.status === 'waiting' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#EDECEB] border border-[#A9A7A8]/30">
                <div className="text-[10px] font-bold text-[#6C7380] uppercase tracking-wider">Your Position</div>
                <div className="text-3xl font-black font-mono text-[#2D3441] mt-1">
                  #{position > 0 ? position : 1}
                </div>
                <div className="text-[11px] text-[#6C7380] mt-0.5 font-medium">
                  {peopleAhead} {peopleAhead === 1 ? 'person' : 'people'} ahead of you
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDECEB] border border-[#A9A7A8]/30">
                <div className="text-[10px] font-bold text-[#6C7380] uppercase tracking-wider">Est. Wait Time</div>
                <div className="text-3xl font-black font-mono text-[#E07015] mt-1">
                  ~{currentEta} mins
                </div>
                <div className="text-[11px] text-[#6C7380] mt-0.5 font-medium">
                  Live calculated turn
                </div>
              </div>
            </div>
          )}

          {token.status === 'in_service' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Currently In Service</div>
                <div className="text-sm font-semibold text-emerald-950 mt-0.5">
                  Being served at {token.counterName || 'Counter'} with {token.staffName || 'Staff'}
                </div>
              </div>
            </div>
          )}

          {token.status === 'completed' && (
            <div className="p-5 rounded-xl bg-[#EDECEB] border border-emerald-300 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
              <h4 className="text-sm font-bold text-[#2D3441]">Service Completed</h4>
              <p className="text-xs text-[#6C7380] mt-0.5">Thank you for visiting! Your service has concluded.</p>
            </div>
          )}

          {token.status === 'cancelled' && (
            <div className="p-4 rounded-xl bg-[#EDECEB] border border-[#A9A7A8]/40 text-center">
              <AlertTriangle className="w-6 h-6 text-[#E07015] mx-auto mb-1" />
              <h4 className="text-xs font-bold text-[#2D3441]">Token Cancelled</h4>
            </div>
          )}

          {/* Clean Step Progress Bar */}
          <div>
            <div className="text-[10px] font-bold text-[#6C7380] uppercase tracking-wider mb-2">
              Queue Status Tracker
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { step: 1, label: 'Checked In' },
                { step: 2, label: 'In Queue' },
                { step: 3, label: 'At Counter' },
                { step: 4, label: 'Completed' },
              ].map((s) => {
                const isPassed = currentStep >= s.step;
                return (
                  <div key={s.step} className="flex flex-col items-center text-center">
                    <div
                      className={`w-full h-2 rounded-full mb-1.5 transition-all ${
                        isPassed ? 'bg-[#E07015]' : 'bg-[#A9A7A8]/30'
                      }`}
                    />
                    <span className={`text-[10px] font-bold ${isPassed ? 'text-[#2D3441]' : 'text-[#A9A7A8]'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulated Digital Barcode */}
          <div className="p-3 bg-[#EDECEB] rounded-xl border border-[#A9A7A8]/30 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 h-8 opacity-80">
              <span className="w-1 h-full bg-[#2D3441]" />
              <span className="w-0.5 h-full bg-[#2D3441]" />
              <span className="w-2 h-full bg-[#2D3441]" />
              <span className="w-1 h-full bg-[#2D3441]" />
              <span className="w-0.5 h-full bg-[#2D3441]" />
              <span className="w-1.5 h-full bg-[#2D3441]" />
              <span className="w-0.5 h-full bg-[#2D3441]" />
              <span className="w-2.5 h-full bg-[#2D3441]" />
              <span className="w-1 h-full bg-[#2D3441]" />
              <span className="w-0.5 h-full bg-[#2D3441]" />
              <span className="w-1 h-full bg-[#2D3441]" />
              <span className="w-2 h-full bg-[#2D3441]" />
              <span className="w-0.5 h-full bg-[#2D3441]" />
            </div>
            <span className="text-[9px] font-mono text-[#6C7380] mt-1 tracking-widest uppercase">
              SCAN AT KIOSK • {token.id.toUpperCase().slice(0, 10)}
            </span>
          </div>

          {/* Reassurance Message */}
          <p className="text-[11px] text-[#6C7380] text-center italic">
            You can relax in the waiting lounge. A chime and on-screen alert will activate when your number is called.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#EDECEB] border-t border-[#A9A7A8]/20 flex items-center justify-between gap-2">
          <button
            onClick={onNewTokenRequest}
            className="px-4 py-2 rounded-xl bg-[#2D3441] hover:bg-[#232932] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#DF9B60]" />
            <span>Take Another Token</span>
          </button>

          {token.status === 'waiting' && (
            <button
              onClick={() => cancelToken(token.id)}
              className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* All My Passes Overview Table (Visible when holding multiple active tickets) */}
      {activeCustomerTokens.length > 1 && (
        <div className="bg-[#F8F8F6] rounded-2xl p-4 sm:p-5 border border-[#A9A7A8]/35 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2D3441] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#E07015]" />
                <span>All Your Passes at a Glance</span>
              </h4>
              <p className="text-[11px] text-[#6C7380] mt-0.5">
                Summary of all {activeCustomerTokens.length} tickets in your queue session.
              </p>
            </div>
            <button
              onClick={onNewTokenRequest}
              className="text-xs font-bold text-[#E07015] hover:text-[#C75D0D] flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Ticket</span>
            </button>
          </div>

          <div className="space-y-2">
            {activeCustomerTokens.map((t) => {
              const isSelected = t.id === token.id;
              const { position: tPos, peopleAhead: tAhead } = calculateQueuePosition(t.id, tokens);
              const tEta = estimateWaitTime(t, tokens, counters, services);

              return (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-[#E07015] shadow-xs'
                      : 'bg-[#EDECEB]/40 border-[#A9A7A8]/30 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#2D3441] text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                      {t.tokenNumber}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#2D3441] truncate">{t.serviceName}</span>
                        <PriorityBadge priority={t.priority} size="sm" />
                      </div>
                      <div className="text-[11px] text-[#6C7380] mt-0.5 truncate">
                        {t.status === 'called' ? (
                          <span className="text-[#E07015] font-black animate-pulse">
                            CALLED to {t.counterName || 'Counter'}!
                          </span>
                        ) : t.status === 'in_service' ? (
                          <span className="text-emerald-700 font-bold">Serving at {t.counterName}</span>
                        ) : t.status === 'waiting' ? (
                          <span>Pos #{tPos} ({tAhead} ahead) • ~{tEta} mins</span>
                        ) : (
                          <span className="capitalize">{t.status}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={t.status} size="sm" />
                    {!isSelected && (
                      <button
                        onClick={() => setActiveCustomerToken(t.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#E07015] hover:bg-[#C75D0D] text-white text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        View Pass
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

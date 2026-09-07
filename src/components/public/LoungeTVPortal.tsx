import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { PriorityBadge } from '../common/Badge';
import {
  Tv,
  Volume2,
  Clock,
  Users,
  Maximize2,
  Minimize2,
  Layers,
  LogOut,
} from 'lucide-react';

export const LoungeTVPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const { counters, tokens, lastCalledToken } = useQueue();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightCall, setHighlightCall] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lastCalledToken) {
      setHighlightCall(true);
      const timeout = setTimeout(() => setHighlightCall(false), 10000);
      return () => clearTimeout(timeout);
    }
  }, [lastCalledToken]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const waitingTokens = tokens
    .filter((t) => t.status === 'waiting')
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* TV Kiosk Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 border border-indigo-400/40">
            <Tv className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-center gap-2.5">
                <span>NOW SERVING</span>
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                LOUNGE KIOSK
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Please watch for your token number and proceed to the designated counter.
            </p>
          </div>
        </div>

        {/* Real-time Clock & TV Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-indigo-300">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-md"
            title="Toggle TV Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Discreet Lounge Manager Sign Out */}
          {user && (
            <button
              onClick={logout}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-rose-500/15 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all shadow-md"
              title="Sign Out of Lounge Display"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Flashing Last-Called Token Hero Banner */}
      {lastCalledToken && highlightCall && (
        <div className="rounded-3xl p-6 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 border-2 border-indigo-300 text-white shadow-2xl shadow-indigo-500/40 animate-pulse flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3.5 rounded-2xl bg-white/20 text-white backdrop-blur-md">
              <Volume2 className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                ATTENTION CALL
              </span>
              <div className="text-3xl sm:text-5xl font-black tracking-tight mt-0.5">
                Token <span className="font-mono text-amber-300">{lastCalledToken.tokenNumber}</span>
              </div>
              <p className="text-sm text-indigo-100 font-medium">
                Customer <span className="font-bold">{lastCalledToken.customerName}</span> ({lastCalledToken.serviceName})
              </p>
            </div>
          </div>

          <div className="text-center md:text-right px-6 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <span className="text-xs uppercase tracking-wider text-indigo-200 font-semibold block">
              Proceed Immediately To
            </span>
            <span className="text-2xl sm:text-4xl font-black text-white font-mono">
              {lastCalledToken.counterName || 'Counter Desk'}
            </span>
          </div>
        </div>
      )}

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Active Serving Counters */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Counter Status</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {counters.filter((c) => c.status === 'active').length} Open Desks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {counters.map((counter) => {
              const servingToken = tokens.find((t) => t.id === counter.currentServingTokenId);
              const isServing = servingToken !== undefined;

              return (
                <div
                  key={counter.id}
                  className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                    isServing
                      ? 'bg-gradient-to-br from-slate-900/95 to-indigo-950/70 border-indigo-500/60 shadow-xl shadow-indigo-500/10'
                      : 'bg-slate-900/50 border-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-mono font-black text-sm border border-indigo-500/30">
                          {counter.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-200">{counter.name}</h3>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {counter.staffName}
                      </span>
                    </div>

                    {isServing ? (
                      <div className="py-4 text-center border-y border-indigo-900/60 my-2">
                        <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-white drop-shadow-md">
                          {servingToken.tokenNumber}
                        </div>
                        <div className="mt-2 text-base font-bold text-indigo-300">
                          {servingToken.customerName}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-medium">
                          {servingToken.serviceName}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center border-y border-dashed border-slate-800/80 my-2">
                        <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-slate-500">AVAILABLE</div>
                        <div className="text-xs text-slate-600 mt-1">Ready for next customer</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 font-mono">
                    <span>
                      {isServing ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          IN SERVICE
                        </span>
                      ) : (
                        'READY'
                      )}
                    </span>
                    <span>Served: {counter.servedCountToday} today</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Upcoming Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Next in Line ({waitingTokens.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">Queue Sequence</span>
          </div>

          <div className="glass-panel rounded-3xl p-4 border border-slate-800 shadow-xl space-y-2.5">
            {waitingTokens.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                All customers served. No pending queue.
              </div>
            ) : (
              waitingTokens.map((token, idx) => (
                <div
                  key={token.id}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-800 font-mono text-xs font-bold text-slate-400 flex items-center justify-center border border-slate-700">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-lg">
                          {token.tokenNumber}
                        </span>
                        <PriorityBadge priority={token.priority} size="sm" />
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[140px]">
                        {token.customerName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-300 block font-mono">
                      ~{token.estimatedWaitMins}m
                    </span>
                    <span className="text-[11px] text-slate-500">{token.serviceName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

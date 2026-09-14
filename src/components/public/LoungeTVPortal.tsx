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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 sm:p-6 lg:p-8 space-y-5 select-none selection:bg-indigo-500 selection:text-white">
      {/* TV Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                <span>NOW SERVING</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                LOUNGE DISPLAY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Please check your token number and proceed to your assigned counter.
            </p>
          </div>
        </div>

        {/* Real-time Clock & Fullscreen */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-indigo-300">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle TV Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {user && (
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign Out of Lounge Display"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Flashing Last-Called Token Hero Banner */}
      {lastCalledToken && highlightCall && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 border-2 border-indigo-300 text-white shadow-2xl animate-pulse flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="p-3 rounded-xl bg-white/20 text-white shrink-0">
              <Volume2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                ATTENTION CALL
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight mt-0.5">
                Token <span className="font-mono text-amber-300">{lastCalledToken.tokenNumber}</span>
              </div>
              <p className="text-xs text-indigo-100 font-medium">
                Customer <span className="font-bold">{lastCalledToken.customerName}</span> ({lastCalledToken.serviceName})
              </p>
            </div>
          </div>

          <div className="text-center md:text-right px-5 py-3 rounded-xl bg-white/10 border border-white/20">
            <span className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold block">
              Proceed Immediately To
            </span>
            <span className="text-xl sm:text-3xl font-black text-white font-mono">
              {lastCalledToken.counterName || 'Service Desk'}
            </span>
          </div>
        </div>
      )}

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        {/* Left: Active Desks Grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Service Counters ({counters.filter((c) => c.status === 'active').length} Open)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {counters.map((counter) => {
              const servingToken = tokens.find((t) => t.id === counter.currentServingTokenId);
              const isServing = servingToken !== undefined;

              return (
                <div
                  key={counter.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isServing
                      ? 'bg-slate-900 border-indigo-500/60 shadow-xl shadow-indigo-500/5'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-black text-xs border border-indigo-500/30">
                          {counter.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100">{counter.name}</h3>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {counter.staffName}
                      </span>
                    </div>

                    {isServing ? (
                      <div className="py-4 text-center border-y border-slate-800 my-2">
                        <div className="text-5xl font-black font-mono tracking-tight text-white">
                          {servingToken.tokenNumber}
                        </div>
                        <div className="mt-1.5 text-sm font-bold text-indigo-300 truncate">
                          {servingToken.customerName}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {servingToken.serviceName}
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center border-y border-dashed border-slate-800 my-2">
                        <Clock className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                        <div className="text-sm font-bold text-slate-400">AVAILABLE</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Ready for next customer</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 font-mono">
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

        {/* Right: Next in Line Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Next in Line ({waitingTokens.length})</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">Queue Sequence</span>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800 shadow-xl space-y-2">
            {waitingTokens.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs font-mono">
                No pending queue. Desks are clear.
              </div>
            ) : (
              waitingTokens.map((token, idx) => (
                <div
                  key={token.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 font-mono text-xs font-bold text-slate-400 flex items-center justify-center border border-slate-800">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-white text-base">
                          {token.tokenNumber}
                        </span>
                        <PriorityBadge priority={token.priority} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                        {token.customerName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-300 block font-mono">
                      ~{token.estimatedWaitMins}m
                    </span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[100px] block">
                      {token.serviceName}
                    </span>
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

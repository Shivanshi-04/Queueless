import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LogIn,
} from 'lucide-react';

export const LoungeTVPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const { counters, tokens, lastCalledToken } = useQueue();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#EDECEB] text-[#2D3441] flex flex-col p-4 sm:p-6 lg:p-8 space-y-5 select-none selection:bg-[#E07015] selection:text-white">
      {/* TV Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#2D3441] text-white shadow-md border border-[#232932]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E07015] flex items-center justify-center shadow-lg shadow-[#E07015]/30 border border-[#DF9B60]/40">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                <span>NOW SERVING</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E07015]/20 text-[#DFCAB2] border border-[#E07015]/40 font-mono">
                LOUNGE DISPLAY
              </span>
            </div>
            <p className="text-xs text-[#A9A7A8]">
              Please check your token number and proceed to your assigned counter.
            </p>
          </div>
        </div>

        {/* Real-time Clock & Fullscreen */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[#DF9B60]">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] text-[#A9A7A8] uppercase tracking-wider font-semibold">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-[#232932] hover:bg-[#1C2128] border border-[#6C7380]/40 text-[#F8F8F6] hover:text-white transition-colors cursor-pointer"
            title="Toggle TV Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {user ? (
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-[#232932] hover:bg-rose-500/20 border border-[#6C7380]/40 text-[#A9A7A8] hover:text-rose-300 transition-colors cursor-pointer"
              title="Sign Out of Lounge Display"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-2 rounded-xl bg-[#232932] hover:bg-[#1C2128] border border-[#6C7380]/40 text-xs font-bold text-[#DFCAB2] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              title="Staff / Customer Sign In"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Flashing Last-Called Token Hero Banner */}
      {lastCalledToken && highlightCall && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-[#E07015] via-[#DF9B60] to-[#E07015] border-2 border-[#DFCAB2] text-white shadow-xl animate-pulse flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="p-3 rounded-xl bg-black/20 text-white shrink-0">
              <Volume2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#DFCAB2]">
                ATTENTION CALL
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight mt-0.5">
                Token <span className="font-mono text-white underline decoration-[#DFCAB2] decoration-4">{lastCalledToken.tokenNumber}</span>
              </div>
              <p className="text-xs text-[#F8F8F6] font-medium">
                Customer <span className="font-bold">{lastCalledToken.customerName}</span> ({lastCalledToken.serviceName})
              </p>
            </div>
          </div>

          <div className="text-center md:text-right px-5 py-3 rounded-xl bg-black/20 border border-white/20">
            <span className="text-[10px] uppercase tracking-wider text-[#DFCAB2] font-bold block">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6C7380] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#E07015]" />
              <span>Service Counters ({counters.filter((c) => c.status === 'active').length} Open)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {counters.map((counter) => {
              const servingToken = tokens.find(
                (t) =>
                  t.counterId === counter.id &&
                  (t.status === 'called' || t.status === 'in_service')
              );
              const isServing = servingToken !== undefined;

              return (
                <div
                  key={counter.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isServing
                      ? 'bg-white border-[#E07015] ring-2 ring-[#E07015]/20 shadow-md'
                      : 'bg-[#F8F8F6] border-[#A9A7A8]/40 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#E07015]/15 text-[#E07015] font-mono font-black text-xs border border-[#E07015]/30">
                          {counter.code}
                        </span>
                        <h3 className="text-sm font-bold text-[#2D3441]">{counter.name}</h3>
                      </div>
                      <span className="text-xs text-[#6C7380] font-medium">
                        {counter.staffName}
                      </span>
                    </div>

                    {isServing ? (
                      <div className="py-4 text-center border-y border-[#A9A7A8]/30 my-2 bg-[#EDECEB]/40 rounded-xl">
                        <div className="text-5xl font-black font-mono tracking-tight text-[#2D3441]">
                          {servingToken.tokenNumber}
                        </div>
                        <div className="mt-1.5 text-sm font-bold text-[#E07015] truncate">
                          {servingToken.customerName}
                        </div>
                        <div className="text-xs text-[#6C7380] font-medium">
                          {servingToken.serviceName}
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center border-y border-dashed border-[#A9A7A8]/60 my-2 bg-[#EDECEB]/20 rounded-xl">
                        <Clock className="w-6 h-6 text-[#A9A7A8] mx-auto mb-1" />
                        <div className="text-sm font-bold text-[#6C7380]">AVAILABLE</div>
                        <div className="text-[11px] text-[#A9A7A8] mt-0.5">Ready for next customer</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6C7380] pt-2 font-mono">
                    <span>
                      {isServing ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6C7380] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#E07015]" />
              <span>Next in Line ({waitingTokens.length})</span>
            </h2>
            <span className="text-[11px] text-[#6C7380] font-mono">Queue Sequence</span>
          </div>

          <div className="bg-[#F8F8F6] rounded-2xl p-3.5 border border-[#A9A7A8]/40 shadow-sm space-y-2">
            {waitingTokens.length === 0 ? (
              <div className="py-10 text-center text-[#6C7380] text-xs font-mono">
                No pending queue. Desks are clear.
              </div>
            ) : (
              waitingTokens.map((token, idx) => (
                <div
                  key={token.id}
                  className="p-3 rounded-xl bg-white border border-[#A9A7A8]/30 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#EDECEB] font-mono text-xs font-bold text-[#2D3441] flex items-center justify-center border border-[#A9A7A8]/40">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-[#2D3441] text-base">
                          {token.tokenNumber}
                        </span>
                        <PriorityBadge priority={token.priority} size="sm" />
                      </div>
                      <div className="text-[11px] text-[#6C7380] truncate max-w-[120px]">
                        {token.customerName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#E07015] block font-mono">
                      ~{token.estimatedWaitMins}m
                    </span>
                    <span className="text-[10px] text-[#6C7380] truncate max-w-[100px] block">
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

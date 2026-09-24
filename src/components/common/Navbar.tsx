import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { Layers, LogOut, Volume2, VolumeX } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { stats, isMuted, toggleMute } = useQueue();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#A9A7A8]/20 bg-[#2D3441] text-[#FFFFFF] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E07015] to-[#DF9B60] flex items-center justify-center shadow-lg shadow-[#E07015]/30 border border-[#DFCAB2]/40">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white font-mono">
                Queue<span className="text-[#DF9B60]">Less</span>
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-[#A9A7A8] font-medium -mt-0.5">
              Smart Real-Time Service Queue System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#232932] border border-[#6C7380]/40 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DF9B60] animate-pulse" />
              <span className="text-[#A9A7A8]">Waiting:</span>
              <span className="font-bold text-[#DF9B60] font-mono">{stats.totalWaiting}</span>
            </div>
            <div className="w-px h-3 bg-[#6C7380]/40" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E07015] animate-ping" />
              <span className="text-[#A9A7A8]">Serving:</span>
              <span className="font-bold text-[#E07015] font-mono">{stats.totalServing}</span>
            </div>
          </div>

          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-[#232932] border-[#6C7380]/40 text-[#6C7380] hover:text-[#A9A7A8]'
                : 'bg-[#E07015]/15 border-[#E07015]/40 text-[#DF9B60] hover:bg-[#E07015]/25'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {user && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#232932] hover:bg-rose-500/20 text-[#A9A7A8] hover:text-rose-300 border border-[#6C7380]/40 text-xs font-semibold cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

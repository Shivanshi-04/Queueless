import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { audioService } from '../../services/audioService';
import {
  Sparkles,
  Play,
  Pause,
  PlusCircle,
  RotateCcw,
  Volume2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

export const DemoControlsBar: React.FC = () => {
  const {
    isSimulating,
    toggleSimulation,
    injectSampleCustomer,
    resetQueueData,
  } = useQueue();

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="glass-panel rounded-2xl border border-indigo-500/40 shadow-2xl overflow-hidden transition-all duration-300">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Demo Realtime Controls</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isSimulating && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse">
                Simulating
              </span>
            )}
            <button className="text-slate-400 hover:text-white">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 bg-slate-950/95 border-t border-slate-800 space-y-3 min-w-[280px]">
            <p className="text-[11px] text-slate-400 leading-snug">
              Use these mock controls to test real-time state sync, customer arrivals, and counter actions.
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={toggleSimulation}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isSimulating
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Traffic Simulation</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Traffic Simulation</span>
                  </>
                )}
              </button>

              <button
                onClick={() => injectSampleCustomer()}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>+1 Random Customer</span>
              </button>

              <button
                onClick={() => audioService.playCallChime()}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Announcement Chime</span>
              </button>

              <button
                onClick={() => resetQueueData()}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-[11px] font-semibold border border-slate-800 hover:border-rose-800/40 flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo Database</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

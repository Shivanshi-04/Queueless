import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { StatCard } from '../common/StatCard';
import { CounterControlGrid } from './CounterControlGrid';
import { QueueTable } from './QueueTable';
import { QueueAnalytics } from './QueueAnalytics';
import { CounterManagerModal } from './CounterManagerModal';
import { DemoControlsBar } from '../simulation/DemoControlsBar';
import {
  Layers,
  LogOut,
  Users,
  LayoutGrid,
  CheckCircle2,
  Clock,
  PlusCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Shield,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    stats,
    injectSampleCustomer,
    resetQueueData,
    isMuted,
    toggleMute,
  } = useQueue();

  const [isCounterManagerOpen, setIsCounterManagerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Admin Header Bar (Isolated) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/25 border border-violet-400/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-mono">
                  Queue<span className="text-violet-400">Less</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-300 border border-violet-500/30">
                  Admin Command
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium -mt-0.5">
                Multi-Counter Dispatch & Analytics
              </p>
            </div>
          </div>

          {/* Right Header Status & Logout */}
          <div className="flex items-center gap-3">
            {/* Live Queue Realtime Mini-Stats */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-slate-400">Waiting:</span>
                <span className="font-bold text-amber-300 font-mono">{stats.totalWaiting}</span>
              </div>
              <div className="w-px h-3 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-400">Serving:</span>
                <span className="font-bold text-emerald-300 font-mono">{stats.totalServing}</span>
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
              className={`p-2 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  : 'bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Admin User Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <Shield className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-slate-300 font-semibold">{user?.name || 'Administrator'}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded-md font-mono font-bold">
                ADMIN
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-700/80 hover:border-rose-500/30 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Top Header & Simulation Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                Multi-Counter Operations Desk
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                Live Dispatch
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Call next priority tickets, manage counter staffing, and inspect real-time queue performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => injectSampleCustomer()}
              className="px-3.5 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-violet-400" />
              <span>Inject Customer Ticket</span>
            </button>

            <button
              onClick={() => resetQueueData()}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 text-xs transition-all"
              title="Reset Queue Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Currently Waiting"
            value={stats.totalWaiting}
            icon={Users}
            sublabel="Real-time queue backlog"
            color="amber"
          />
          <StatCard
            label="Active Counters"
            value={`${stats.activeCountersCount} Desks`}
            icon={LayoutGrid}
            sublabel="Serving live incoming traffic"
            color="indigo"
          />
          <StatCard
            label="Estimated Avg Wait"
            value={`~${stats.avgWaitMinutes}m`}
            icon={Clock}
            sublabel="Dynamic priority-weighted ETA"
            color="sky"
          />
          <StatCard
            label="Completed Today"
            value={stats.totalCompletedToday}
            icon={CheckCircle2}
            sublabel="Total customers serviced"
            color="emerald"
          />
        </div>

        {/* Counter Control Grid */}
        <CounterControlGrid onOpenCounterManager={() => setIsCounterManagerOpen(true)} />

        {/* Queue Demand Analytics */}
        <QueueAnalytics />

        {/* Live Queue Manifest Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Live Queue Manifest</span>
            </h2>
          </div>
          <QueueTable />
        </div>

        {/* Counter Manager Modal */}
        <CounterManagerModal
          isOpen={isCounterManagerOpen}
          onClose={() => setIsCounterManagerOpen(false)}
        />
      </main>

      {/* Floating Simulation Bar */}
      <DemoControlsBar />
    </div>
  );
};

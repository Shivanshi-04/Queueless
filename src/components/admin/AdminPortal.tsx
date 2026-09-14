import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { StatCard } from '../common/StatCard';
import { CounterControlGrid } from './CounterControlGrid';
import { QueueTable } from './QueueTable';
import { CounterManagerModal } from './CounterManagerModal';
import {
  Layers,
  LogOut,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Shield,
  Activity,
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
  const [isInjecting, setIsInjecting] = useState(false);

  const handleInject = async () => {
    setIsInjecting(true);
    await injectSampleCustomer();
    setIsInjecting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-600/30 border border-violet-500/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-mono">
                  Queue<span className="text-violet-400">Less</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-300 border border-violet-500/25">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Multi-Counter Dispatch & Command Center
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  : 'bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Admin Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <Shield className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-slate-200 font-semibold">{user?.name || 'Administrator'}</span>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Top Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Waiting in Queue"
            value={stats.totalWaiting}
            sublabel="Pending customers"
            icon={Users}
            color="amber"
          />
          <StatCard
            label="Now Serving"
            value={stats.totalServing}
            sublabel={`${stats.activeCountersCount} active desks`}
            icon={Activity}
            color="emerald"
          />
          <StatCard
            label="Served Today"
            value={stats.totalCompletedToday}
            sublabel="Completed tickets"
            icon={CheckCircle2}
            color="indigo"
          />
          <StatCard
            label="Avg Wait Time"
            value={`~${stats.avgWaitMinutes}m`}
            sublabel="Estimated throughput"
            icon={Clock}
            color="sky"
          />
        </div>

        {/* Quick Operations Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Dispatch System Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInject}
              disabled={isInjecting}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Add a test customer into queue"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isInjecting ? 'Adding...' : 'Add Test Customer'}</span>
            </button>

            <button
              onClick={resetQueueData}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset queue to default initial tickets"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Queue</span>
            </button>
          </div>
        </div>

        {/* Multi-Counter Desks Grid */}
        <CounterControlGrid onOpenCounterManager={() => setIsCounterManagerOpen(true)} />

        {/* Live Queue Table */}
        <div className="space-y-3 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Live Queue Manifest</span>
          </h2>
          <QueueTable />
        </div>
      </main>

      {/* Desk & Staff Manager Modal */}
      <CounterManagerModal
        isOpen={isCounterManagerOpen}
        onClose={() => setIsCounterManagerOpen(false)}
      />
    </div>
  );
};

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
    resetQueueData,
    isMuted,
    toggleMute,
  } = useQueue();

  const [isCounterManagerOpen, setIsCounterManagerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#EDECEB] text-[#2D3441] selection:bg-[#E07015] selection:text-white">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#232932]/20 bg-[#2D3441] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E07015] to-[#DF9B60] flex items-center justify-center shadow-md shadow-[#E07015]/30 border border-[#DFCAB2]/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-mono">
                  Queue<span className="text-[#DF9B60]">Less</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E07015]/20 text-[#DFCAB2] border border-[#DFCAB2]/30">
                  Admin Center
                </span>
              </div>
              <p className="text-[11px] text-[#A9A7A8] font-medium">
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
                  ? 'bg-[#232932] border-[#6C7380]/40 text-[#6C7380] hover:text-[#A9A7A8]'
                  : 'bg-[#E07015]/20 border-[#E07015]/40 text-[#DF9B60] hover:bg-[#E07015]/30'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Admin Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#232932] border border-[#6C7380]/40 text-xs">
              <Shield className="w-3.5 h-3.5 text-[#DF9B60]" />
              <span className="text-white font-semibold">{user?.name || 'Administrator'}</span>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#232932] hover:bg-rose-500/20 text-[#A9A7A8] hover:text-rose-300 border border-[#6C7380]/40 text-xs font-semibold transition-colors cursor-pointer"
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
            color="orange"
          />
          <StatCard
            label="Avg Wait Time"
            value={`~${stats.avgWaitMinutes}m`}
            sublabel="Estimated throughput"
            icon={Clock}
            color="beige"
          />
        </div>

        {/* Quick Operations Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#F8F8F6] border border-[#A9A7A8]/40 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2D3441]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Dispatch System Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetQueueData}
              className="px-3.5 py-2 rounded-xl bg-[#EDECEB] hover:bg-[#DFCAB2]/50 text-[#2D3441] text-xs font-semibold border border-[#A9A7A8]/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset queue to default initial tickets"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6C7380]" />
              <span>Reset Queue</span>
            </button>
          </div>
        </div>

        {/* Multi-Counter Desks Grid */}
        <CounterControlGrid onOpenCounterManager={() => setIsCounterManagerOpen(true)} />

        {/* Live Queue Table */}
        <div className="space-y-3 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-[#2D3441] flex items-center gap-2">
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

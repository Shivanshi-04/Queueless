import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { StatCard } from '../common/StatCard';
import { CounterControlGrid } from './CounterControlGrid';
import { QueueTable } from './QueueTable';
import { QueueAnalytics } from './QueueAnalytics';
import { CounterManagerModal } from './CounterManagerModal';
import {
  Users,
  LayoutGrid,
  CheckCircle2,
  Clock,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { stats, injectSampleCustomer, resetQueueData } = useQueue();
  const [isCounterManagerOpen, setIsCounterManagerOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Multi-Counter Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
              Online
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-counter dispatching, staff workload balancing, and service metrics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => injectSampleCustomer()}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Check-In</span>
          </button>

          <button
            onClick={() => resetQueueData()}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 text-xs transition-all"
            title="Reset Mock Data to Default"
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

      {/* Counter Control Section */}
      <CounterControlGrid onOpenCounterManager={() => setIsCounterManagerOpen(true)} />

      {/* Queue Demand & Real-Time Audit */}
      <QueueAnalytics />

      {/* Live Queue Table Section */}
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
    </div>
  );
};

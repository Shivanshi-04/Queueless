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
  RotateCcw,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { stats, resetQueueData } = useQueue();
  const [isCounterManagerOpen, setIsCounterManagerOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#A9A7A8]/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-3xl font-black text-[#2D3441] tracking-tight">
              Multi-Counter Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-xs font-bold font-mono">
              Online
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6C7380] mt-1">
            Real-time multi-counter dispatching, staff workload balancing, and service metrics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => resetQueueData()}
            className="p-2 rounded-xl bg-[#F8F8F6] hover:bg-[#EDECEB] text-[#6C7380] hover:text-[#2D3441] border border-[#A9A7A8]/50 text-xs transition-all cursor-pointer"
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
          color="orange"
        />
        <StatCard
          label="Active Counters"
          value={`${stats.activeCountersCount} Desks`}
          icon={LayoutGrid}
          sublabel="Serving live incoming traffic"
          color="orange"
        />
        <StatCard
          label="Estimated Avg Wait"
          value={`~${stats.avgWaitMinutes}m`}
          icon={Clock}
          sublabel="Dynamic priority-weighted ETA"
          color="beige"
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
          <h2 className="text-lg font-bold text-[#2D3441] flex items-center gap-2">
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

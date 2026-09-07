import React from 'react';
import { useQueue } from '../../context/QueueContext';
import { BarChart3, Activity, Clock, CheckCircle2, Volume2, UserCheck } from 'lucide-react';

export const QueueAnalytics: React.FC = () => {
  const { tokens, services, counters, logs } = useQueue();

  const waitingTokens = tokens.filter((t) => t.status === 'waiting');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Service Category Demand Breakdown */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Demand by Service Category</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Real-time</span>
        </div>

        <div className="space-y-3">
          {services.map((service) => {
            const countInService = waitingTokens.filter((t) => t.serviceId === service.id).length;
            const percentage =
              waitingTokens.length > 0 ? Math.round((countInService / waitingTokens.length) * 100) : 0;

            return (
              <div key={service.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{service.name}</span>
                  <span className="font-mono text-slate-400">
                    {countInService} waiting ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Counter Efficiency & Desk Load */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Counter Velocity</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Today</span>
        </div>

        <div className="space-y-3">
          {counters.map((c) => (
            <div
              key={c.id}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-200">{c.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">({c.staffName})</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Avg Pace: ~{c.averageServiceMinutes}m / customer
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {c.servedCountToday}
                </span>
                <span className="text-[10px] text-slate-500 block">completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Activity Audit Trail */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Live Audit Stream</span>
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-mono">
            {logs.length} Events
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent queue events.</p>
          ) : (
            logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 text-xs flex items-start gap-2"
              >
                <div className="mt-0.5">
                  {log.action === 'token_called' || log.action === 'token_recalled' ? (
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  ) : log.action === 'token_completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold font-mono text-slate-200">{log.tokenNumber}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{log.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

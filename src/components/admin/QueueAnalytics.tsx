import React from 'react';
import { useQueue } from '../../context/QueueContext';
import { BarChart3, Activity, Clock, CheckCircle2, Volume2, UserCheck } from 'lucide-react';

export const QueueAnalytics: React.FC = () => {
  const { tokens, services, counters, logs } = useQueue();

  const waitingTokens = tokens.filter((t) => t.status === 'waiting');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Service Category Demand Breakdown */}
      <div className="bg-[#F8F8F6] rounded-2xl p-5 border border-[#A9A7A8]/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2D3441] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#E07015]" />
            <span>Demand by Service Category</span>
          </h3>
          <span className="text-xs text-[#6C7380] font-mono">Real-time</span>
        </div>

        <div className="space-y-3">
          {services.map((service) => {
            const countInService = waitingTokens.filter((t) => t.serviceId === service.id).length;
            const percentage =
              waitingTokens.length > 0 ? Math.round((countInService / waitingTokens.length) * 100) : 0;

            return (
              <div key={service.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2D3441]">{service.name}</span>
                  <span className="font-mono text-[#6C7380]">
                    {countInService} waiting ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EDECEB] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E07015] to-[#DF9B60] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Counter Efficiency & Desk Load */}
      <div className="bg-[#F8F8F6] rounded-2xl p-5 border border-[#A9A7A8]/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2D3441] flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Counter Velocity</span>
          </h3>
          <span className="text-xs text-[#6C7380] font-mono">Today</span>
        </div>

        <div className="space-y-3">
          {counters.map((c) => (
            <div
              key={c.id}
              className="p-2.5 rounded-xl bg-white border border-[#A9A7A8]/30 flex items-center justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#2D3441]">{c.name}</span>
                  <span className="text-[10px] text-[#6C7380] font-medium">({c.staffName})</span>
                </div>
                <div className="text-[11px] text-[#6C7380] font-mono mt-0.5">
                  Avg Pace: ~{c.averageServiceMinutes}m / customer
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold font-mono text-[#E07015]">
                  {c.servedCountToday}
                </span>
                <span className="text-[10px] text-[#6C7380] block">completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Activity Audit Trail */}
      <div className="bg-[#F8F8F6] rounded-2xl p-5 border border-[#A9A7A8]/40 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2D3441] flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Live Audit Stream</span>
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E07015]/15 text-[#E07015] font-mono font-bold">
            {logs.length} Events
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <p className="text-xs text-[#6C7380] py-4 text-center">No recent queue events.</p>
          ) : (
            logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="p-2 rounded-lg bg-white border border-[#A9A7A8]/30 text-xs flex items-start gap-2 shadow-xs"
              >
                <div className="mt-0.5">
                  {log.action === 'token_called' || log.action === 'token_recalled' ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#E07015]" />
                  ) : log.action === 'token_completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-[#6C7380]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold font-mono text-[#2D3441]">{log.tokenNumber}</span>
                    <span className="text-[10px] text-[#6C7380] font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6C7380] truncate">{log.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};



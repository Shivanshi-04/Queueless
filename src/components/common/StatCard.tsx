import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  sublabel?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  sublabel,
  color = 'indigo',
}) => {
  const colorStyles = {
    indigo: {
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'hover:border-indigo-500/30 hover:shadow-indigo-500/10',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'hover:border-emerald-500/30 hover:shadow-emerald-500/10',
    },
    amber: {
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'hover:border-amber-500/30 hover:shadow-amber-500/10',
    },
    sky: {
      iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      glow: 'hover:border-sky-500/30 hover:shadow-sky-500/10',
    },
    purple: {
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'hover:border-purple-500/30 hover:shadow-purple-500/10',
    },
  }[color];

  return (
    <div
      className={`glass-panel rounded-2xl p-5 border border-slate-800 transition-all duration-300 shadow-lg ${colorStyles.glow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-slate-50 mt-1 font-mono tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {sublabel && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-slate-400">
          <span>{sublabel}</span>
        </div>
      )}
    </div>
  );
};

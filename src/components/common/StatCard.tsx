import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  sublabel?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'purple' | 'orange' | 'beige';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  sublabel,
  color = 'orange',
}) => {
  const colorStyles = {
    orange: {
      iconBg: 'bg-[#E07015]/15 text-[#E07015] border-[#E07015]/30',
      glow: 'hover:border-[#E07015]/50 hover:shadow-[#E07015]/15',
    },
    indigo: {
      iconBg: 'bg-[#E07015]/15 text-[#E07015] border-[#E07015]/30',
      glow: 'hover:border-[#E07015]/50 hover:shadow-[#E07015]/15',
    },
    emerald: {
      iconBg: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
      glow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    },
    amber: {
      iconBg: 'bg-[#DF9B60]/20 text-[#E07015] border-[#DF9B60]/40',
      glow: 'hover:border-[#DF9B60]/50 hover:shadow-[#DF9B60]/15',
    },
    sky: {
      iconBg: 'bg-[#2D3441]/10 text-[#2D3441] border-[#2D3441]/20',
      glow: 'hover:border-[#2D3441]/40 hover:shadow-[#2D3441]/10',
    },
    purple: {
      iconBg: 'bg-[#DFCAB2]/40 text-[#2D3441] border-[#DFCAB2]',
      glow: 'hover:border-[#DFCAB2] hover:shadow-[#DFCAB2]/20',
    },
    beige: {
      iconBg: 'bg-[#DFCAB2]/40 text-[#2D3441] border-[#DFCAB2]',
      glow: 'hover:border-[#DFCAB2] hover:shadow-[#DFCAB2]/20',
    },
  }[color] || {
    iconBg: 'bg-[#E07015]/15 text-[#E07015] border-[#E07015]/30',
    glow: 'hover:border-[#E07015]/50 hover:shadow-[#E07015]/15',
  };

  return (
    <div
      className={`bg-[#F8F8F6] rounded-2xl p-5 border border-[#A9A7A8]/30 transition-all duration-300 shadow-sm hover:shadow-md ${colorStyles.glow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#6C7380] uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-[#2D3441] mt-1 font-mono tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {sublabel && (
        <div className="mt-3 pt-3 border-t border-[#A9A7A8]/20 flex items-center gap-1.5 text-xs text-[#6C7380]">
          <span>{sublabel}</span>
        </div>
      )}
    </div>
  );
};

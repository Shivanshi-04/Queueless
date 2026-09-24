import React from 'react';
import type { PriorityLevel, TokenStatus } from '../../types/queue';
import { Crown, AlertCircle, HeartHandshake, User, CheckCircle2, Clock, Volume2, UserX } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  switch (priority) {
    case 'urgent':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#E07015]/15 text-[#E07015] border border-[#E07015]/35 font-semibold ${sizeClasses}`}>
          <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Urgent</span>
        </span>
      );
    case 'vip':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#DFCAB2]/40 text-[#2D3441] border border-[#DFCAB2] font-semibold ${sizeClasses}`}>
          <Crown className={size === 'sm' ? 'w-3 h-3 text-[#E07015]' : 'w-3.5 h-3.5 text-[#E07015]'} />
          <span>VIP Priority</span>
        </span>
      );
    case 'senior_disabled':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#DF9B60]/20 text-[#2D3441] border border-[#DF9B60]/50 font-semibold ${sizeClasses}`}>
          <HeartHandshake className={size === 'sm' ? 'w-3 h-3 text-[#E07015]' : 'w-3.5 h-3.5 text-[#E07015]'} />
          <span>Senior / Assisted</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-[#EDECEB] text-[#6C7380] border border-[#A9A7A8]/40 font-medium ${sizeClasses}`}>
          <User className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Regular</span>
        </span>
      );
  }
};

interface StatusBadgeProps {
  status: TokenStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  switch (status) {
    case 'called':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#E07015] text-white border border-[#E07015] shadow-sm animate-pulse font-bold ${sizeClasses}`}>
          <Volume2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Called to Counter</span>
        </span>
      );
    case 'in_service':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-0.5" />
          <span>In Service</span>
        </span>
      );
    case 'waiting':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#DF9B60]/15 text-[#E07015] border border-[#DF9B60]/40 font-semibold ${sizeClasses}`}>
          <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Waiting in Line</span>
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#2D3441]/10 text-[#2D3441] border border-[#2D3441]/20 font-medium ${sizeClasses}`}>
          <CheckCircle2 className={size === 'sm' ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
          <span>Completed</span>
        </span>
      );
    case 'no_show':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-500/15 text-rose-600 border border-rose-500/30 font-medium ${sizeClasses}`}>
          <UserX className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>No-Show / Skipped</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#EDECEB] text-[#6C7380] border border-[#A9A7A8]/50 ${sizeClasses}`}>
          <span>Cancelled</span>
        </span>
      );
    default:
      return null;
  }
};

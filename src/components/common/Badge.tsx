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
        <span className={`inline-flex items-center rounded-full bg-red-500/15 text-red-400 border border-red-500/30 ${sizeClasses}`}>
          <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Urgent</span>
        </span>
      );
    case 'vip':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>
          <Crown className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>VIP Priority</span>
        </span>
      );
    case 'senior_disabled':
      return (
        <span className={`inline-flex items-center rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 ${sizeClasses}`}>
          <HeartHandshake className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Senior / Assisted</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 ${sizeClasses}`}>
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
        <span className={`inline-flex items-center rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse ${sizeClasses}`}>
          <Volume2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Called to Counter</span>
        </span>
      );
    case 'in_service':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
          <span>In Service</span>
        </span>
      );
    case 'waiting':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>
          <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Waiting in Line</span>
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 ${sizeClasses}`}>
          <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Completed</span>
        </span>
      );
    case 'no_show':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 ${sizeClasses}`}>
          <UserX className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>No-Show / Skipped</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}>
          <span>Cancelled</span>
        </span>
      );
    default:
      return null;
  }
};

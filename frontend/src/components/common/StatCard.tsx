import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'amber' | 'blue' | 'emerald' | 'red';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'amber',
  trend,
}) => {
  const colorStyles = {
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-lg hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-heading">
          {title}
        </span>
        <div
          className={clsx(
            'p-2.5 rounded-lg border',
            colorStyles[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-[11px] text-slate-400 mt-0.5">{subtitle}</div>
        )}
      </div>

      {trend && (
        <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-400/90 font-medium">
          {trend}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'amber' | 'blue' | 'emerald' | 'red' | 'orange' | 'purple';
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
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    red: 'bg-rose-50 text-rose-700 border-rose-200/80',
    orange: 'bg-orange-50 text-orange-700 border-orange-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
  };

  return (
    <div className="p-5 bg-slate-50/90 border border-slate-300/80 rounded-xl space-y-3 shadow-xs hover:border-emerald-500 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider font-heading">
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
        <div className="text-2xl font-extrabold text-stone-900 font-mono tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-[11px] text-stone-500 mt-0.5">{subtitle}</div>
        )}
      </div>

      {trend && (
        <div className="pt-2 border-t border-stone-100 text-[11px] text-emerald-700 font-medium">
          {trend}
        </div>
      )}
    </div>
  );
};

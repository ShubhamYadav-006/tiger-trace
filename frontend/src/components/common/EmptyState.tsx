import React from 'react';
import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-stone-300 rounded-xl bg-stone-50/50">
      <div className="p-3 bg-white border border-stone-200 rounded-xl text-emerald-700 mb-3 shadow-2xs">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-extrabold text-stone-900 font-heading">{title}</h3>
      <p className="text-xs text-stone-600 max-w-sm mt-1 mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  pendingReviewsCount?: number;
  activeAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingReviewsCount = 0,
  activeAlertsCount = 0,
}) => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Processing History',
      path: '/processing',
      icon: History,
    },
    {
      label: 'Human Review',
      path: '/review',
      icon: UserCheck,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      label: 'Movement Alerts',
      path: '/alerts',
      icon: AlertTriangle,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col select-none">
      <div className="p-4 space-y-1">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

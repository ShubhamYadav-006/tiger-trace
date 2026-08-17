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
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      label: 'Movement Alerts',
      path: '/alerts',
      icon: AlertTriangle,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-300 flex flex-col select-none shadow-xs">
      <div className="p-4 space-y-1">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 font-semibold'
                      : 'text-stone-600 hover:text-emerald-800 hover:bg-emerald-50/60'
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

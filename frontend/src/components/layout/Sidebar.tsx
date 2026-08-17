import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Cat,
  UserCheck,
  Map,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  pendingReviewsCount?: number;
  activeAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingReviewsCount = 2,
  activeAlertsCount = 2,
}) => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Processing Run',
      path: '/processing',
      icon: Cpu,
    },
    {
      label: 'Tiger Catalogue',
      path: '/tigers',
      icon: Cat,
    },
    {
      label: 'Human Review',
      path: '/review',
      icon: UserCheck,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      label: 'Reserve GIS Map',
      path: '/map',
      icon: Map,
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
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between select-none">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Core Navigation
        </div>
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

      {/* Field System Info Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold text-slate-200">Reserve Territory</span>
            <span className="text-amber-400 font-mono text-[11px]">Pench PTR</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Central India Landscape • Standard SD-Card Batch Processing
          </p>
        </div>
      </div>
    </aside>
  );
};

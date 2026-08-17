import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { getDashboardStats, getSystemStatus } from '../../services/dashboard';

export const Layout: React.FC = () => {
  const [activeAlertsCount, setActiveAlertsCount] = useState(2);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(2);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await getDashboardStats();
        setActiveAlertsCount(stats.activeAlertsCount || 0);
        setPendingReviewsCount(stats.imagesRequiringReviewCount || 0);

        const status = await getSystemStatus();
        setIsBackendConnected(!status.isOfflineMode);
      } catch (err) {
        console.warn('Dashboard header/sidebar stats fallback', err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header activeAlertsCount={activeAlertsCount} isBackendConnected={isBackendConnected} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar pendingReviewsCount={pendingReviewsCount} activeAlertsCount={activeAlertsCount} />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

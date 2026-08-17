import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { getDashboardStats } from '../../services/dashboard';

export const Layout: React.FC = () => {
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await getDashboardStats();
        setActiveAlertsCount(stats.activeAlertsCount || 0);
        setPendingReviewsCount(stats.imagesRequiringReviewCount || 0);
      } catch (err) {
        console.warn('Sidebar stats fallback', err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar pendingReviewsCount={pendingReviewsCount} activeAlertsCount={activeAlertsCount} />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-6rem)] bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

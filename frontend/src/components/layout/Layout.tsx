import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header activeAlertsCount={2} isBackendConnected={false} />
      <div className="flex flex-1">
        <Sidebar pendingReviewsCount={2} activeAlertsCount={2} />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

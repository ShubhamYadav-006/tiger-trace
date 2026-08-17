import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './layouts';
import { DashboardPage } from './pages/DashboardPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { TigersPage } from './pages/TigersPage';
import { TigerDetailPage } from './pages/TigerDetailPage';
import { ReviewPage } from './pages/ReviewPage';
import { MapPage } from './pages/MapPage';
import { AlertsPage } from './pages/AlertsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="processing" element={<ProcessingPage />} />
          <Route path="tigers" element={<TigersPage />} />
          <Route path="tigers/:id" element={<TigerDetailPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="alerts" element={<AlertsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

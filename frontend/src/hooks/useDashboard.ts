import { useState, useEffect, useCallback } from 'react';
import type { DashboardStats, SystemStatus } from '../types/dashboard';
import { getDashboardStats, getSystemStatus } from '../services/dashboard';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, statusData] = await Promise.all([
        getDashboardStats(),
        getSystemStatus(),
      ]);
      setStats(statsData);
      setSystemStatus(statusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    systemStatus,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};

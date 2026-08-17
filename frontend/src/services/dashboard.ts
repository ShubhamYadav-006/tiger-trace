import type { DashboardStats, SystemStatus } from '../types/dashboard';
import { fetchApi } from './api';
import { MOCK_TIGERS, MOCK_REVIEWS, MOCK_ALERTS } from './mockData';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    return await fetchApi<DashboardStats>('/dashboard/stats');
  } catch {
    // Return computed stats from mock data layer
    return {
      totalImagesProcessed: 42850,
      blankImagesCount: 35120,
      relevantSubjectImagesCount: 7730,
      tigerImagesCount: 542,
      knownTigersCount: MOCK_TIGERS.length,
      imagesRequiringReviewCount: MOCK_REVIEWS.filter((r) => r.status === 'PENDING').length,
      activeAlertsCount: MOCK_ALERTS.filter((a) => !a.isAcknowledged).length,
      storageSavedMB: 84200,
      processingTimeSavedMinutes: 520,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    return await fetchApi<SystemStatus>('/dashboard/system-status');
  } catch {
    return {
      isOfflineMode: true,
      cpuUsagePercentage: 24,
      activeQueueLength: 0,
      storageAvailableGB: 342.5,
    };
  }
}

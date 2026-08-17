import type { DashboardStats, SystemStatus } from '../types/dashboard';
import { fetchApi } from './api';
import { MOCK_TIGERS, MOCK_REVIEWS, MOCK_ALERTS } from './mockData';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    return await fetchApi<DashboardStats>('/dashboard/stats');
  } catch {
    // Return initial clean stats when no data exists yet
    return {
      totalImagesProcessed: 0,
      blankImagesCount: 0,
      relevantSubjectImagesCount: 0,
      tigerImagesCount: 0,
      knownTigersCount: MOCK_TIGERS.length,
      imagesRequiringReviewCount: MOCK_REVIEWS.filter((r) => r.status === 'PENDING').length,
      activeAlertsCount: MOCK_ALERTS.filter((a) => !a.isAcknowledged).length,
      storageSavedMB: 0,
      processingTimeSavedMinutes: 0,
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

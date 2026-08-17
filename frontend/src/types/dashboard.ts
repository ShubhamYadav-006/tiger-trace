export interface DashboardStats {
  totalImagesProcessed: number;
  blankImagesCount: number;
  relevantSubjectImagesCount: number;
  tigerImagesCount: number;
  knownTigersCount: number;
  imagesRequiringReviewCount: number;
  activeAlertsCount: number;
  storageSavedMB: number;
  processingTimeSavedMinutes: number;
  lastUpdated: string;
}

export interface SystemStatus {
  isOfflineMode: boolean;
  cpuUsagePercentage: number;
  activeQueueLength: number;
  storageAvailableGB: number;
}

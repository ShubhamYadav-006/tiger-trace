export type PipelineStage = 
  | 'INGESTION'
  | 'BLANK_FILTERING'
  | 'TIGER_DETECTION'
  | 'INDIVIDUAL_REID'
  | 'SPATIAL_ANALYSIS'
  | 'ALERT_GENERATION'
  | 'COMPLETED'
  | 'FAILED';

export type RunStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PENDING';

export interface QuarantinedImage {
  id: string;
  filename: string;
  folderPath: string;
  quarantinedAt: string;
  aiBlankConfidence: number;
  thumbnailUrl: string;
  fileSizeBytes: number;
  reason: 'EMPTY_FRAME' | 'MOVING_GRASS' | 'HEAT_SHIMMER' | 'INSECTS';
}

export interface ProcessingRunError {
  id: string;
  timestamp: string;
  filename?: string;
  code: string;
  message: string;
}

export interface ProcessingRun {
  id: string;
  name: string;
  folderPath: string;
  startTime: string;
  endTime?: string;
  completionTime?: string;
  status: RunStatus;
  currentStage: PipelineStage;
  progressPercentage: number;
  totalImages: number;
  processedImages: number;
  blankImagesCount: number;
  subjectImagesCount: number;
  tigerDetectionsCount: number;
  quarantinedImagesCount: number;
  errorCount: number;
  processingDurationSeconds: number;
  humanReviewRequiredCount: number;
  alertsGeneratedCount: number;
  storageSavedMB: number;
  processingTimeSavedMinutes: number;
  errors?: ProcessingRunError[];
}

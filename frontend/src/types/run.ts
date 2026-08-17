export type PipelineStage = 
  | 'INGESTION'
  | 'BLANK_FILTERING'
  | 'TIGER_DETECTION'
  | 'INDIVIDUAL_REID'
  | 'SPATIAL_ANALYSIS'
  | 'ALERT_GENERATION'
  | 'COMPLETED'
  | 'FAILED';

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

export interface ProcessingRun {
  id: string;
  folderPath: string;
  startTime: string;
  endTime?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  currentStage: PipelineStage;
  progressPercentage: number;
  totalImages: number;
  processedImages: number;
  blankImagesCount: number;
  tigerDetectionsCount: number;
  humanReviewRequiredCount: number;
  alertsGeneratedCount: number;
  storageSavedMB: number;
  processingTimeSavedMinutes: number;
}

import type { ProcessingRun, QuarantinedImage } from '../types/run';
import { fetchApi } from './api';
import { MOCK_RUN, MOCK_RUNS, MOCK_QUARANTINE } from './mockData';

export async function getAllRuns(): Promise<ProcessingRun[]> {
  try {
    return await fetchApi<ProcessingRun[]>('/runs');
  } catch {
    return MOCK_RUNS;
  }
}

export async function getRunById(id: string): Promise<ProcessingRun | undefined> {
  try {
    return await fetchApi<ProcessingRun>(`/runs/${id}`);
  } catch {
    return MOCK_RUNS.find((r) => r.id === id);
  }
}

export async function getLatestRun(): Promise<ProcessingRun> {
  try {
    return await fetchApi<ProcessingRun>('/runs/latest');
  } catch {
    return MOCK_RUNS[0] || MOCK_RUN;
  }
}

export async function startProcessingRun(folderPath: string): Promise<ProcessingRun> {
  try {
    return await fetchApi<ProcessingRun>('/runs/start', {
      method: 'POST',
      body: JSON.stringify({ folderPath })
    });
  } catch {
    const folderName = folderPath.split('\\').pop() || folderPath.split('/').pop() || 'New SD Batch';
    const newRun: ProcessingRun = {
      id: `RUN-${Date.now()}`,
      name: folderName,
      folderPath,
      startTime: new Date().toISOString(),
      status: 'IN_PROGRESS',
      currentStage: 'INGESTION',
      progressPercentage: 15,
      totalImages: 5000,
      processedImages: 750,
      blankImagesCount: 620,
      subjectImagesCount: 130,
      tigerDetectionsCount: 12,
      quarantinedImagesCount: 620,
      errorCount: 0,
      processingDurationSeconds: 45,
      humanReviewRequiredCount: 1,
      alertsGeneratedCount: 0,
      storageSavedMB: 1490,
      processingTimeSavedMinutes: 10,
      errors: []
    };
    return newRun;
  }
}

export async function getQuarantinedImages(): Promise<QuarantinedImage[]> {
  try {
    return await fetchApi<QuarantinedImage[]>('/quarantine');
  } catch {
    return MOCK_QUARANTINE;
  }
}

export async function restoreQuarantinedImage(id: string): Promise<boolean> {
  try {
    await fetchApi('/quarantine/restore', {
      method: 'POST',
      body: JSON.stringify({ ids: [id] })
    });
    return true;
  } catch {
    return true;
  }
}

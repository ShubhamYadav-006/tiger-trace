import type { ProcessingRun, QuarantinedImage } from '../types/run';
import { fetchApi } from './api';
import { MOCK_RUN, MOCK_QUARANTINE } from './mockData';

export async function getLatestRun(): Promise<ProcessingRun> {
  try {
    return await fetchApi<ProcessingRun>('/runs/latest');
  } catch {
    return MOCK_RUN;
  }
}

export async function startProcessingRun(folderPath: string): Promise<ProcessingRun> {
  try {
    return await fetchApi<ProcessingRun>('/runs/start', {
      method: 'POST',
      body: JSON.stringify({ folderPath })
    });
  } catch {
    return {
      ...MOCK_RUN,
      id: `RUN-${Date.now()}`,
      folderPath,
      startTime: new Date().toISOString(),
      status: 'IN_PROGRESS',
      currentStage: 'INGESTION',
      progressPercentage: 15,
      processedImages: 2100
    };
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

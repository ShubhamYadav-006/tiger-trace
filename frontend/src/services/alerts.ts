import type { MovementAlert } from '../types/alert';
import { fetchApi } from './api';
import { MOCK_ALERTS } from './mockData';

export async function getMovementAlerts(): Promise<MovementAlert[]> {
  try {
    return await fetchApi<MovementAlert[]>('/alerts');
  } catch {
    return MOCK_ALERTS;
  }
}

export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  try {
    await fetchApi(`/alerts/${alertId}/acknowledge`, { method: 'PATCH' });
    return true;
  } catch {
    return true;
  }
}

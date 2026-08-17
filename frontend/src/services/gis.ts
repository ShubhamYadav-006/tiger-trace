import type { CameraStation } from '../types/tiger';
import { fetchApi } from './api';
import { MOCK_STATIONS } from './mockData';

export async function getCameraStations(): Promise<CameraStation[]> {
  try {
    return await fetchApi<CameraStation[]>('/gis/stations');
  } catch {
    return MOCK_STATIONS;
  }
}

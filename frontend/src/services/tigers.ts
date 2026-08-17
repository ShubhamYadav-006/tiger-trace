import type { Tiger, TigerCapture, TerritoryOverlap } from '../types/tiger';
import { fetchApi } from './api';
import { MOCK_TIGERS, MOCK_CAPTURES, MOCK_OVERLAPS } from './mockData';

export async function getTigers(): Promise<Tiger[]> {
  try {
    return await fetchApi<Tiger[]>('/tigers');
  } catch {
    return MOCK_TIGERS;
  }
}

export async function getTigerById(id: string): Promise<Tiger | undefined> {
  try {
    return await fetchApi<Tiger>(`/tigers/${id}`);
  } catch {
    return MOCK_TIGERS.find((t) => t.id === id);
  }
}

export async function getTigerCaptures(tigerId: string): Promise<TigerCapture[]> {
  try {
    return await fetchApi<TigerCapture[]>(`/tigers/${tigerId}/captures`);
  } catch {
    return MOCK_CAPTURES[tigerId] || [];
  }
}

export async function getTerritoryOverlaps(): Promise<TerritoryOverlap[]> {
  try {
    return await fetchApi<TerritoryOverlap[]>('/tigers/overlaps');
  } catch {
    return MOCK_OVERLAPS;
  }
}

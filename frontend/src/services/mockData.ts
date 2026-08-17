import type { Tiger, CameraStation, TigerCapture, TerritoryOverlap } from '../types/tiger';
import type { ReviewItem } from '../types/review';
import type { MovementAlert } from '../types/alert';
import type { ProcessingRun, QuarantinedImage } from '../types/run';

export const MOCK_STATIONS: CameraStation[] = [];

export const MOCK_TIGERS: Tiger[] = [];

export const MOCK_CAPTURES: Record<string, TigerCapture[]> = {};

export const MOCK_OVERLAPS: TerritoryOverlap[] = [];

export const MOCK_REVIEWS: ReviewItem[] = [];

export const MOCK_ALERTS: MovementAlert[] = [];

export const MOCK_RUN: ProcessingRun | undefined = undefined;

export const MOCK_RUNS: ProcessingRun[] = [];

export const MOCK_QUARANTINE: QuarantinedImage[] = [];

export interface MatchCandidate {
  tigerId: string;
  tigerName: string;
  referenceImageUrl: string;
  similarityScore: number; // 0 to 1
  lastSeenStation: string;
  lastSeenTimestamp: string;
}

export interface ReviewItem {
  id: string;
  captureId: string;
  rawImageUrl: string;
  flankCropUrl: string;
  bbox: { x: number; y: number; width: number; height: number };
  stationId: string;
  stationName: string;
  timestamp: string;
  suggestedTigerId?: string;
  aiConfidence: number; // below auto-match threshold
  candidates: MatchCandidate[];
  status: 'PENDING' | 'RESOLVED' | 'SKIPPED';
  resolvedAt?: string;
  resolvedAction?: 'CONFIRM' | 'SELECT' | 'CREATE_NEW';
  resolvedTigerId?: string;
}

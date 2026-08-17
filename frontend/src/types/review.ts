export interface MatchCandidate {
  tigerId: string;
  tigerName: string;
  referenceImageUrl: string;
  similarityScore: number; // 0 to 1 (confidence score)
  lastSeenStation: string;
  lastSeenTimestamp: string;
}

export type ReviewActionType =
  | 'CONFIRM_CANDIDATE'
  | 'SELECT_OTHER_CANDIDATE'
  | 'CREATE_NEW_INDIVIDUAL'
  | 'REJECT';

export interface ReviewDecisionSubmission {
  reviewId: string;
  action: ReviewActionType;
  selectedTigerId?: string;
  notes?: string;
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
  latitude?: number;
  longitude?: number;
  suggestedTigerId?: string;
  aiConfidence: number; // below auto-match threshold (e.g. 0.78)
  candidates: MatchCandidate[];
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  resolvedAt?: string;
  resolvedAction?: ReviewActionType;
  resolvedTigerId?: string;
}

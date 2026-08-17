export type DeviationType = 
  | 'RANGE_SHIFT'
  | 'NEW_STATION'
  | 'BUFFER_VILLAGE_MOVEMENT'
  | 'PROLONGED_ABSENCE';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface AlertEvidence {
  whatChanged: string;
  previousState: string;
  currentState: string;
  supportingCapturesCount: number;
  surveyEffortStatus: 'ADEQUATE' | 'INSUFFICIENT' | 'CAMERA_INACTIVE';
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  distanceShiftKm?: number;
  stationName?: string;
  daysAbsent?: number;
}

export interface MovementAlert {
  id: string;
  tigerId: string;
  tigerName: string;
  tigerThumbnail: string;
  type: DeviationType;
  severity: AlertSeverity;
  title: string;
  timestamp: string;
  stationName: string;
  latitude: number;
  longitude: number;
  evidence: AlertEvidence;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
}

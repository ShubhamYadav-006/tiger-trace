export interface CameraStation {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  zone: 'CORE' | 'BUFFER' | 'VILLAGE_ADJACENT';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  lastActive: string;
}

export interface TigerCapture {
  id: string;
  tigerId: string;
  stationId: string;
  stationName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  imageUrl: string;
  flankCropUrl?: string;
  confidence: number;
  reviewStatus: 'AUTO_APPROVED' | 'HUMAN_CONFIRMED' | 'NEW_ENROLLED';
}

export interface ActivityCentroid {
  latitude: number;
  longitude: number;
  zoneName: string;
}

export interface OccupiedAreaPolygon {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    areaSqKm: number;
    tigerId: string;
  };
}

export interface TerritoryOverlap {
  id: string;
  primaryTigerId: string;
  neighborTigerId: string;
  overlapAreaSqKm: number;
  sharedStationIds: string[];
}

export interface Tiger {
  id: string; // e.g. T-014
  name: string; // e.g. Pench Dominant Male
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  estimatedAge: string;
  status: 'ACTIVE' | 'MISSING' | 'DISPLACED';
  primaryImage: string;
  totalCaptures: number;
  firstSeen: string;
  lastSeen: string;
  lastStation: string;
  occupiedAreaSqKm: number;
  centroid: ActivityCentroid;
  occupiedAreaPolygon?: OccupiedAreaPolygon;
}

import type { Tiger, CameraStation, TigerCapture, TerritoryOverlap } from '../types/tiger';
import type { ReviewItem } from '../types/review';
import type { MovementAlert } from '../types/alert';
import type { ProcessingRun, QuarantinedImage } from '../types/run';

export const MOCK_STATIONS: CameraStation[] = [
  { id: 'CS-101', name: 'Karmajhiri Core 01', code: 'KJ-C01', latitude: 21.6850, longitude: 79.3210, zone: 'CORE', status: 'ACTIVE', lastActive: '2026-08-17T12:30:00Z' },
  { id: 'CS-102', name: 'Karmajhiri Core 02', code: 'KJ-C02', latitude: 21.6920, longitude: 79.3350, zone: 'CORE', status: 'ACTIVE', lastActive: '2026-08-17T11:15:00Z' },
  { id: 'CS-103', name: 'Touria Gate West', code: 'TR-W01', latitude: 21.6420, longitude: 79.3100, zone: 'BUFFER', status: 'ACTIVE', lastActive: '2026-08-16T18:45:00Z' },
  { id: 'CS-104', name: 'Khawasa Buffer Ridge', code: 'KW-B01', latitude: 21.6150, longitude: 79.2950, zone: 'VILLAGE_ADJACENT', status: 'ACTIVE', lastActive: '2026-08-17T08:20:00Z' },
  { id: 'CS-105', name: 'Pench River Bank East', code: 'PR-E01', latitude: 21.6700, longitude: 79.3550, zone: 'CORE', status: 'ACTIVE', lastActive: '2026-08-17T10:00:00Z' },
  { id: 'CS-106', name: 'Gumtara Range North', code: 'GT-N01', latitude: 21.7200, longitude: 79.3400, zone: 'CORE', status: 'ACTIVE', lastActive: '2026-08-15T14:10:00Z' },
  { id: 'CS-107', name: 'Awarghani Buffer Trail', code: 'AG-B02', latitude: 21.6300, longitude: 79.3300, zone: 'BUFFER', status: 'ACTIVE', lastActive: '2026-08-17T05:50:00Z' },
  { id: 'CS-108', name: 'Sillari Border Post', code: 'SL-V01', latitude: 21.6050, longitude: 79.3500, zone: 'VILLAGE_ADJACENT', status: 'MAINTENANCE', lastActive: '2026-08-10T09:00:00Z' },
];

export const MOCK_TIGERS: Tiger[] = [
  {
    id: 'T-014',
    name: 'Karmajhiri Male (Sultana)',
    gender: 'MALE',
    estimatedAge: '6.5 Years',
    status: 'ACTIVE',
    primaryImage: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80',
    totalCaptures: 48,
    firstSeen: '2024-03-12',
    lastSeen: '2026-08-17T11:15:00Z',
    lastStation: 'Karmajhiri Core 02 (KJ-C02)',
    occupiedAreaSqKm: 18.4,
    centroid: { latitude: 21.6885, longitude: 79.3280, zoneName: 'Karmajhiri Core' },
    occupiedAreaPolygon: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [79.3100, 21.6750],
          [79.3450, 21.6800],
          [79.3500, 21.7050],
          [79.3200, 21.7100],
          [79.3050, 21.6900],
          [79.3100, 21.6750]
        ]]
      },
      properties: { areaSqKm: 18.4, tigerId: 'T-014' }
    }
  },
  {
    id: 'T-008',
    name: 'Pench Dominant Male (Raja)',
    gender: 'MALE',
    estimatedAge: '8 Years',
    status: 'ACTIVE',
    primaryImage: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80',
    totalCaptures: 72,
    firstSeen: '2023-01-10',
    lastSeen: '2026-08-17T10:00:00Z',
    lastStation: 'Pench River Bank East (PR-E01)',
    occupiedAreaSqKm: 22.1,
    centroid: { latitude: 21.6780, longitude: 79.3420, zoneName: 'Pench River Basin' },
    occupiedAreaPolygon: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [79.3300, 21.6550],
          [79.3650, 21.6600],
          [79.3700, 21.6900],
          [79.3350, 21.6950],
          [79.3250, 21.6700],
          [79.3300, 21.6550]
        ]]
      },
      properties: { areaSqKm: 22.1, tigerId: 'T-008' }
    }
  },
  {
    id: 'T-021',
    name: 'Touria Tigress (Tara)',
    gender: 'FEMALE',
    estimatedAge: '4.2 Years',
    status: 'DISPLACED',
    primaryImage: 'https://images.unsplash.com/photo-1508814435343-fe811d269cf5?auto=format&fit=crop&w=600&q=80',
    totalCaptures: 31,
    firstSeen: '2024-09-01',
    lastSeen: '2026-08-17T08:20:00Z',
    lastStation: 'Khawasa Buffer Ridge (KW-B01)',
    occupiedAreaSqKm: 14.8,
    centroid: { latitude: 21.6320, longitude: 79.3080, zoneName: 'Touria - Khawasa Buffer' },
    occupiedAreaPolygon: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [79.2900, 21.6100],
          [79.3250, 21.6200],
          [79.3300, 21.6500],
          [79.3000, 21.6550],
          [79.2850, 21.6300],
          [79.2900, 21.6100]
        ]]
      },
      properties: { areaSqKm: 14.8, tigerId: 'T-021' }
    }
  },
  {
    id: 'T-035',
    name: 'Gumtara Young Tigress',
    gender: 'FEMALE',
    estimatedAge: '3 Years',
    status: 'ACTIVE',
    primaryImage: 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=600&q=80',
    totalCaptures: 19,
    firstSeen: '2025-02-14',
    lastSeen: '2026-08-15T14:10:00Z',
    lastStation: 'Gumtara Range North (GT-N01)',
    occupiedAreaSqKm: 11.2,
    centroid: { latitude: 21.7180, longitude: 79.3380, zoneName: 'Gumtara Core North' },
  },
  {
    id: 'T-042',
    name: 'Sillari Boundary Sub-Adult',
    gender: 'MALE',
    estimatedAge: '2.5 Years',
    status: 'MISSING',
    primaryImage: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80',
    totalCaptures: 9,
    firstSeen: '2025-11-20',
    lastSeen: '2026-07-28T16:00:00Z',
    lastStation: 'Sillari Border Post (SL-V01)',
    occupiedAreaSqKm: 7.5,
    centroid: { latitude: 21.6080, longitude: 79.3480, zoneName: 'Sillari Buffer Zone' },
  }
];

export const MOCK_CAPTURES: Record<string, TigerCapture[]> = {
  'T-014': [
    {
      id: 'CAP-1001',
      tigerId: 'T-014',
      stationId: 'CS-102',
      stationName: 'Karmajhiri Core 02',
      latitude: 21.6920,
      longitude: 79.3350,
      timestamp: '2026-08-17T11:15:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
      flankCropUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=400&q=80',
      confidence: 0.96,
      reviewStatus: 'AUTO_APPROVED'
    },
    {
      id: 'CAP-1002',
      tigerId: 'T-014',
      stationId: 'CS-101',
      stationName: 'Karmajhiri Core 01',
      latitude: 21.6850,
      longitude: 79.3210,
      timestamp: '2026-08-16T23:40:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80',
      flankCropUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=400&q=80',
      confidence: 0.92,
      reviewStatus: 'HUMAN_CONFIRMED'
    },
    {
      id: 'CAP-1003',
      tigerId: 'T-014',
      stationId: 'CS-105',
      stationName: 'Pench River Bank East',
      latitude: 21.6700,
      longitude: 79.3550,
      timestamp: '2026-08-14T04:12:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=800&q=80',
      confidence: 0.94,
      reviewStatus: 'AUTO_APPROVED'
    }
  ],
  'T-021': [
    {
      id: 'CAP-2001',
      tigerId: 'T-021',
      stationId: 'CS-104',
      stationName: 'Khawasa Buffer Ridge',
      latitude: 21.6150,
      longitude: 79.2950,
      timestamp: '2026-08-17T08:20:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1508814435343-fe811d269cf5?auto=format&fit=crop&w=800&q=80',
      flankCropUrl: 'https://images.unsplash.com/photo-1508814435343-fe811d269cf5?auto=format&fit=crop&w=400&q=80',
      confidence: 0.88,
      reviewStatus: 'HUMAN_CONFIRMED'
    },
    {
      id: 'CAP-2002',
      tigerId: 'T-021',
      stationId: 'CS-103',
      stationName: 'Touria Gate West',
      latitude: 21.6420,
      longitude: 79.3100,
      timestamp: '2026-08-16T18:45:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80',
      confidence: 0.91,
      reviewStatus: 'AUTO_APPROVED'
    }
  ]
};

export const MOCK_OVERLAPS: TerritoryOverlap[] = [
  {
    id: 'OVL-01',
    primaryTigerId: 'T-014',
    neighborTigerId: 'T-008',
    overlapAreaSqKm: 5.6,
    sharedStationIds: ['CS-105']
  },
  {
    id: 'OVL-02',
    primaryTigerId: 'T-021',
    neighborTigerId: 'T-014',
    overlapAreaSqKm: 2.1,
    sharedStationIds: ['CS-107']
  }
];

export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 'REV-901',
    captureId: 'CAP-TEMP-881',
    rawImageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
    flankCropUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=400&q=80',
    bbox: { x: 120, y: 80, width: 340, height: 260 },
    stationId: 'CS-107',
    stationName: 'Awarghani Buffer Trail (AG-B02)',
    timestamp: '2026-08-17T05:50:00Z',
    suggestedTigerId: 'T-014',
    aiConfidence: 0.73,
    candidates: [
      {
        tigerId: 'T-014',
        tigerName: 'Karmajhiri Male (Sultana)',
        referenceImageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=400&q=80',
        similarityScore: 0.73,
        lastSeenStation: 'Karmajhiri Core 02',
        lastSeenTimestamp: '2026-08-17T11:15:00Z'
      },
      {
        tigerId: 'T-008',
        tigerName: 'Pench Dominant Male (Raja)',
        referenceImageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=400&q=80',
        similarityScore: 0.68,
        lastSeenStation: 'Pench River Bank East',
        lastSeenTimestamp: '2026-08-17T10:00:00Z'
      },
      {
        tigerId: 'T-035',
        tigerName: 'Gumtara Young Tigress',
        referenceImageUrl: 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=400&q=80',
        similarityScore: 0.45,
        lastSeenStation: 'Gumtara Range North',
        lastSeenTimestamp: '2026-08-15T14:10:00Z'
      }
    ],
    status: 'PENDING'
  },
  {
    id: 'REV-902',
    captureId: 'CAP-TEMP-882',
    rawImageUrl: 'https://images.unsplash.com/photo-1508814435343-fe811d269cf5?auto=format&fit=crop&w=800&q=80',
    flankCropUrl: 'https://images.unsplash.com/photo-1508814435343-fe811d269cf5?auto=format&fit=crop&w=400&q=80',
    bbox: { x: 90, y: 110, width: 310, height: 230 },
    stationId: 'CS-104',
    stationName: 'Khawasa Buffer Ridge (KW-B01)',
    timestamp: '2026-08-17T08:20:00Z',
    suggestedTigerId: 'T-021',
    aiConfidence: 0.69,
    candidates: [
      {
        tigerId: 'T-021',
        tigerName: 'Touria Tigress (Tara)',
        referenceImageUrl: 'https://images.unsplash.com/photo-1508814435343-fe811d269cf5?auto=format&fit=crop&w=400&q=80',
        similarityScore: 0.69,
        lastSeenStation: 'Touria Gate West',
        lastSeenTimestamp: '2026-08-16T18:45:00Z'
      },
      {
        tigerId: 'T-042',
        tigerName: 'Sillari Boundary Sub-Adult',
        referenceImageUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=400&q=80',
        similarityScore: 0.61,
        lastSeenStation: 'Sillari Border Post',
        lastSeenTimestamp: '2026-07-28T16:00:00Z'
      }
    ],
    status: 'PENDING'
  }
];

export const MOCK_ALERTS: MovementAlert[] = [
  {
    id: 'ALT-301',
    tigerId: 'T-021',
    tigerName: 'Touria Tigress (Tara)',
    tigerThumbnail: 'https://images.unsplash.com/photo-1508814435343-fe811d269cf5?auto=format&fit=crop&w=200&q=80',
    type: 'BUFFER_VILLAGE_MOVEMENT',
    severity: 'CRITICAL',
    title: 'Movement Towards Khawasa Village Buffer',
    timestamp: '2026-08-17T08:20:00Z',
    stationName: 'Khawasa Buffer Ridge (KW-B01)',
    latitude: 21.6150,
    longitude: 79.2950,
    evidence: {
      whatChanged: 'Moved from Touria Core Gate to Khawasa Village-Adjacent Ridge station (KW-B01).',
      previousState: 'Core & Upper Buffer zone (Touria Gate West).',
      currentState: 'Village-Adjacent Station within 1.2 km of Khawasa Settlement.',
      supportingCapturesCount: 3,
      surveyEffortStatus: 'ADEQUATE',
      confidenceLevel: 'HIGH',
      distanceShiftKm: 6.8,
      stationName: 'Khawasa Buffer Ridge'
    },
    isAcknowledged: false
  },
  {
    id: 'ALT-302',
    tigerId: 'T-014',
    tigerName: 'Karmajhiri Male (Sultana)',
    tigerThumbnail: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=200&q=80',
    type: 'RANGE_SHIFT',
    severity: 'WARNING',
    title: 'Activity Centroid Shift Exceeding 15 sq km Threshold',
    timestamp: '2026-08-17T11:15:00Z',
    stationName: 'Karmajhiri Core 02 (KJ-C02)',
    latitude: 21.6920,
    longitude: 79.3350,
    evidence: {
      whatChanged: 'Activity centroid shifted 4.2 km North-East towards Pench River Basin over last 72 hours.',
      previousState: 'Karmajhiri Core West (Centroid: 21.6700 N, 79.3100 E).',
      currentState: 'Karmajhiri River Edge (Centroid: 21.6885 N, 79.3280 E).',
      supportingCapturesCount: 8,
      surveyEffortStatus: 'ADEQUATE',
      confidenceLevel: 'HIGH',
      distanceShiftKm: 4.2
    },
    isAcknowledged: false
  },
  {
    id: 'ALT-303',
    tigerId: 'T-042',
    tigerName: 'Sillari Boundary Sub-Adult',
    tigerThumbnail: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=200&q=80',
    type: 'PROLONGED_ABSENCE',
    severity: 'WARNING',
    title: 'Prolonged Absence (>20 Days Unseen)',
    timestamp: '2026-08-16T00:00:00Z',
    stationName: 'Sillari Border Post (SL-V01)',
    latitude: 21.6080,
    longitude: 79.3480,
    evidence: {
      whatChanged: 'No detections recorded across active camera grid for 20 consecutive days.',
      previousState: 'Regular captures (every 3-5 days at Sillari Border Post).',
      currentState: '20 days without capture.',
      supportingCapturesCount: 0,
      surveyEffortStatus: 'ADEQUATE',
      confidenceLevel: 'MEDIUM',
      daysAbsent: 20
    },
    isAcknowledged: true,
    acknowledgedAt: '2026-08-16T14:30:00Z'
  }
];

export const MOCK_RUN: ProcessingRun = {
  id: 'RUN-20260817-01',
  folderPath: 'E:\\FieldData\\Pench_SDCard_Batch08',
  startTime: '2026-08-17T14:00:00Z',
  status: 'COMPLETED',
  currentStage: 'COMPLETED',
  progressPercentage: 100,
  totalImages: 14250,
  processedImages: 14250,
  blankImagesCount: 11840,
  tigerDetectionsCount: 142,
  humanReviewRequiredCount: 2,
  alertsGeneratedCount: 2,
  storageSavedMB: 28420,
  processingTimeSavedMinutes: 184
};

export const MOCK_QUARANTINE: QuarantinedImage[] = [
  {
    id: 'Q-701',
    filename: 'IMG_4821_BLANK.JPG',
    folderPath: 'E:\\FieldData\\Pench_SDCard_Batch08\\KJ_C01\\',
    quarantinedAt: '2026-08-17T14:05:12Z',
    aiBlankConfidence: 0.98,
    thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    fileSizeBytes: 2450000,
    reason: 'MOVING_GRASS'
  },
  {
    id: 'Q-702',
    filename: 'IMG_4822_BLANK.JPG',
    folderPath: 'E:\\FieldData\\Pench_SDCard_Batch08\\KJ_C01\\',
    quarantinedAt: '2026-08-17T14:05:15Z',
    aiBlankConfidence: 0.99,
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80',
    fileSizeBytes: 2380000,
    reason: 'HEAT_SHIMMER'
  },
  {
    id: 'Q-703',
    filename: 'IMG_5104_BLANK.JPG',
    folderPath: 'E:\\FieldData\\Pench_SDCard_Batch08\\TR_W01\\',
    quarantinedAt: '2026-08-17T14:12:00Z',
    aiBlankConfidence: 0.94,
    thumbnailUrl: 'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=400&q=80',
    fileSizeBytes: 2610000,
    reason: 'INSECTS'
  }
];

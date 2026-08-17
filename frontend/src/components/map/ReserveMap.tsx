import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { CameraStation, Tiger, TigerCapture } from '../../types/tiger';
import { Cat, Calendar, MapPin, Camera } from 'lucide-react';

interface ReserveMapProps {
  stations?: CameraStation[];
  tigers?: Tiger[];
  selectedTigerCaptures?: TigerCapture[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showStations?: boolean;
  showOccupancy?: boolean;
  showMovementTrail?: boolean;
}

// Utility to validate coordinates safety
const isValidCoord = (lat?: number, lng?: number): boolean =>
  typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng);

// Custom Leaflet DivIcons
const createStationIcon = (zone: CameraStation['zone']) => {
  const color = zone === 'CORE' ? '#10b981' : zone === 'BUFFER' ? '#f59e0b' : '#ef4444';
  return L.divIcon({
    className: 'custom-station-icon',
    html: `
      <div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #0f172a; box-shadow: 0 0 8px ${color};"></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const createCentroidIcon = (tigerId: string) => {
  return L.divIcon({
    className: 'custom-centroid-icon',
    html: `
      <div style="background-color: #f59e0b; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #000000; box-shadow: 0 0 12px rgba(245, 158, 11, 0.8);" class="radar-pulse-amber">
        ${tigerId.replace('T-', '')}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createCaptureIcon = () => {
  return L.divIcon({
    className: 'custom-capture-icon',
    html: `
      <div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 6px #3b82f6;"></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

export const ReserveMap: React.FC<ReserveMapProps> = ({
  stations = [],
  tigers = [],
  selectedTigerCaptures = [],
  center = [21.665, 79.330], // Pench Tiger Reserve coordinates
  zoom = 12,
  height = 'h-[500px]',
  showStations = true,
  showOccupancy = true,
  showMovementTrail = true,
}) => {
  // Sort captures chronologically and filter valid coordinates
  const sortedCaptures = [...selectedTigerCaptures]
    .filter((c) => isValidCoord(c.latitude, c.longitude))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Polyline trajectory coordinates
  const trajectoryPoints: [number, number][] = sortedCaptures.map((c) => [c.latitude, c.longitude]);

  return (
    <div className={`w-full ${height} rounded-xl overflow-hidden border border-slate-800 shadow-xl relative z-10 bg-slate-950`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Dark contrast map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Pench Reserve GIS'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Camera Stations */}
        {showStations &&
          stations.map((st) => {
            if (!isValidCoord(st.latitude, st.longitude)) return null;
            return (
              <Marker
                key={st.id}
                position={[st.latitude, st.longitude]}
                icon={createStationIcon(st.zone)}
              >
                <Popup>
                  <div className="space-y-2 min-w-[200px] text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-amber-400 font-mono">{st.code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-slate-800 text-slate-300">
                        {st.zone} ZONE
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{st.name}</h4>
                    <div className="space-y-1 text-slate-300">
                      <p className="font-mono text-[11px]">
                        <strong>GPS:</strong> {st.latitude.toFixed(4)}° N, {st.longitude.toFixed(4)}° E
                      </p>
                      <p>
                        <strong>Status:</strong>{' '}
                        <span className={st.status === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {st.status}
                        </span>
                      </p>
                      {st.lastActive && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          Last active: {new Date(st.lastActive).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 2. Tiger Activity Centroids & Occupied Area Polygons */}
        {showOccupancy &&
          tigers.map((t) => {
            if (!t) return null;

            // Validate polygon points
            const rawCoords = t.occupiedAreaPolygon?.geometry?.coordinates?.[0] || [];
            const polygonCoords: [number, number][] = rawCoords
              .filter((c) => Array.isArray(c) && c.length >= 2 && isValidCoord(c[1], c[0]))
              .map((c) => [c[1], c[0]]);

            const hasValidCentroid = isValidCoord(t.centroid?.latitude, t.centroid?.longitude);

            return (
              <React.Fragment key={t.id}>
                {/* Activity Centroid Marker */}
                {hasValidCentroid && (
                  <Marker
                    position={[t.centroid.latitude, t.centroid.longitude]}
                    icon={createCentroidIcon(t.id)}
                  >
                    <Popup>
                      <div className="space-y-2 min-w-[210px] text-xs">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                          <Cat className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-extrabold text-white">{t.id} — {t.name}</span>
                        </div>
                        <div className="space-y-1 text-slate-300">
                          <p><strong>Centroid Zone:</strong> {t.centroid.zoneName}</p>
                          <p className="font-mono text-[11px]">
                            <strong>Centroid GPS:</strong> {t.centroid.latitude.toFixed(4)}° N, {t.centroid.longitude.toFixed(4)}° E
                          </p>
                          <p>
                            <strong>Occupied Range:</strong>{' '}
                            <span className="text-amber-400 font-mono font-bold">{t.occupiedAreaSqKm} sq km</span>
                          </p>
                          <p><strong>Captured Frames:</strong> {t.totalCaptures} Observations</p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Occupied Area GeoJSON Polygon */}
                {polygonCoords.length > 2 && (
                  <Polygon
                    positions={polygonCoords}
                    pathOptions={{
                      color: t.id === 'T-014' ? '#f59e0b' : t.id === 'T-008' ? '#3b82f6' : '#ec4899',
                      fillColor: t.id === 'T-014' ? '#f59e0b' : t.id === 'T-008' ? '#3b82f6' : '#ec4899',
                      fillOpacity: 0.15,
                      weight: 2,
                      dashArray: '4, 4',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}

        {/* 3. Chronological Movement Path (Polyline) */}
        {showMovementTrail && trajectoryPoints.length > 1 && (
          <Polyline
            positions={trajectoryPoints}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              opacity: 0.85,
              dashArray: '6, 6',
            }}
          />
        )}

        {/* 4. Individual Tiger Capture Points */}
        {showMovementTrail &&
          sortedCaptures.map((cap) => (
            <Marker
              key={cap.id}
              position={[cap.latitude, cap.longitude]}
              icon={createCaptureIcon()}
            >
              <Popup>
                <div className="space-y-2 min-w-[210px] text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="font-bold text-blue-400 font-mono">{cap.tigerId} Capture</span>
                    <span className="text-emerald-400 font-mono font-bold">{Math.round(cap.confidence * 100)}% Conf</span>
                  </div>

                  {(cap.flankCropUrl || cap.imageUrl) && (
                    <img
                      src={cap.flankCropUrl || cap.imageUrl}
                      alt="Capture Thumbnail"
                      className="w-full h-24 rounded-lg object-cover border border-slate-800 bg-slate-950"
                    />
                  )}

                  <div className="space-y-1 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-semibold text-white">{cap.stationName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono">{new Date(cap.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{cap.latitude.toFixed(4)}° N, {cap.longitude.toFixed(4)}° E</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

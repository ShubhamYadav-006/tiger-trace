import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { CameraStation, Tiger, TigerCapture } from '../../types/tiger';
import { Cat } from 'lucide-react';

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

// Custom DivIcons for Leaflet
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
      <div style="background-color: #f59e0b; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #000000; box-shadow: 0 0 12px rgba(245, 158, 11, 0.8);" class="radar-pulse-amber">
        ${tigerId.replace('T-', '')}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

const createCaptureIcon = () => {
  return L.divIcon({
    className: 'custom-capture-icon',
    html: `
      <div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #ffffff;"></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
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
  // Polyline trajectory coordinates
  const trajectoryPoints: [number, number][] = selectedTigerCaptures
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((c) => [c.latitude, c.longitude]);

  return (
    <div className={`w-full ${height} rounded-xl overflow-hidden border border-slate-800 shadow-xl relative z-10`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Offline-compatible TileLayer (OpenStreetMap tiles with dark contrast styling) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Pench PTR Offline Reserve Grid'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Camera Stations */}
        {showStations &&
          stations.map((st) => (
            <Marker
              key={st.id}
              position={[st.latitude, st.longitude]}
              icon={createStationIcon(st.zone)}
            >
              <Popup>
                <div className="space-y-1.5 min-w-[180px]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">{st.code}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-slate-800 text-slate-300">
                      {st.zone}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{st.name}</h4>
                  <div className="text-[11px] text-slate-400">
                    <p>Lat: {st.latitude.toFixed(4)}, Lng: {st.longitude.toFixed(4)}</p>
                    <p>Status: <span className={st.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}>{st.status}</span></p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 2. Tiger Activity Centroids & Occupied Area Polygons */}
        {showOccupancy &&
          tigers.map((t) => {
            const polygonCoords = t.occupiedAreaPolygon?.geometry?.coordinates?.[0]?.map(
              (c) => [c[1], c[0]] as [number, number]
            );

            return (
              <React.Fragment key={t.id}>
                {/* Centroid Marker */}
                <Marker
                  position={[t.centroid.latitude, t.centroid.longitude]}
                  icon={createCentroidIcon(t.id)}
                >
                  <Popup>
                    <div className="space-y-1.5 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Cat className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-white">{t.id} - {t.name}</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <p><strong>Activity Centroid:</strong> {t.centroid.zoneName}</p>
                        <p><strong>Estimated Occupied Area:</strong> <span className="text-amber-400 font-mono font-semibold">{t.occupiedAreaSqKm} sq km</span></p>
                        <p><strong>Total Captures:</strong> {t.totalCaptures}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Occupied Area Polygon */}
                {polygonCoords && (
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

        {/* 3. Selected Tiger Movement Trail */}
        {showMovementTrail && trajectoryPoints.length > 1 && (
          <Polyline
            positions={trajectoryPoints}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              opacity: 0.8,
              dashArray: '6, 6',
            }}
          />
        )}

        {/* Capture Location Markers */}
        {showMovementTrail &&
          selectedTigerCaptures.map((cap) => (
            <Marker
              key={cap.id}
              position={[cap.latitude, cap.longitude]}
              icon={createCaptureIcon()}
            >
              <Popup>
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-blue-400">{cap.tigerId} Capture</span>
                  <p className="text-slate-300">{cap.stationName}</p>
                  <p className="text-[10px] text-slate-400">{new Date(cap.timestamp).toLocaleString()}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Compass, Filter, Layers, Camera, Radio, Route } from 'lucide-react';
import { ReserveMap } from '../components/map/ReserveMap';
import { getTigers, getTigerCaptures, getTerritoryOverlaps } from '../services/tigers';
import { getCameraStations } from '../services/gis';
import type { Tiger, CameraStation, TerritoryOverlap, TigerCapture } from '../types/tiger';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const MapPage: React.FC = () => {
  const [tigers, setTigers] = useState<Tiger[]>([]);
  const [stations, setStations] = useState<CameraStation[]>([]);
  const [overlaps, setOverlaps] = useState<TerritoryOverlap[]>([]);
  const [selectedTigerId, setSelectedTigerId] = useState<string>('ALL');
  const [selectedTigerCaptures, setSelectedTigerCaptures] = useState<TigerCapture[]>([]);
  const [showStations, setShowStations] = useState(true);
  const [showOccupancy, setShowOccupancy] = useState(true);
  const [showMovementTrail, setShowMovementTrail] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGisData() {
      try {
        const [tData, sData, oData] = await Promise.all([
          getTigers(),
          getCameraStations(),
          getTerritoryOverlaps(),
        ]);
        setTigers(tData);
        setStations(sData);
        setOverlaps(oData);
      } catch (err) {
        console.error('Failed to load GIS map data', err);
      } finally {
        setLoading(false);
      }
    }
    loadGisData();
  }, []);

  // Fetch captures when a specific tiger is selected
  useEffect(() => {
    async function loadCaptures() {
      if (selectedTigerId === 'ALL') {
        setSelectedTigerCaptures([]);
        return;
      }
      try {
        const caps = await getTigerCaptures(selectedTigerId);
        setSelectedTigerCaptures(caps);
      } catch (err) {
        console.error(`Failed to load captures for ${selectedTigerId}`, err);
        setSelectedTigerCaptures([]);
      }
    }
    loadCaptures();
  }, [selectedTigerId]);

  const displayedTigers =
    selectedTigerId === 'ALL'
      ? tigers
      : tigers.filter((t) => t.id === selectedTigerId);

  const selectedTiger = tigers.find((t) => t.id === selectedTigerId);

  return (
    <div className="space-y-6">
      {/* Header Bar & Map Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-heading tracking-tight">
            Reserve GIS Map & Trajectory Explorer
          </h1>
          <p className="text-xs text-stone-600">
            Spatial visualization of camera stations, activity centroids, occupied areas, and chronological movement paths.
          </p>
        </div>

        {/* Filter & Toggle Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tiger Selection Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedTigerId}
              onChange={(e) => setSelectedTigerId(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-stone-900 cursor-pointer font-semibold"
            >
              <option value="ALL" className="bg-white">All Reserve Tigers ({tigers.length})</option>
              {tigers.map((t) => (
                <option key={t.id} value={t.id} className="bg-white">
                  {t.id} — {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Layer Toggle Switches */}
          <div className="flex bg-stone-200/70 border border-stone-300 rounded-lg p-1 text-xs">
            <button
              onClick={() => setShowStations(!showStations)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                showStations ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Stations ({stations.length})
            </button>
            <button
              onClick={() => setShowOccupancy(!showOccupancy)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                showOccupancy ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Centroids & Areas
            </button>
            <button
              onClick={() => setShowMovementTrail(!showMovementTrail)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                showMovementTrail ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              Movement Trail
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={1} height="h-[560px]" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center Column: GIS Map (9 cols) */}
          <div className="lg:col-span-9 space-y-4">
            <ReserveMap
              stations={stations}
              tigers={displayedTigers}
              selectedTigerCaptures={selectedTigerCaptures}
              height="h-[580px]"
              showStations={showStations}
              showOccupancy={showOccupancy}
              showMovementTrail={showMovementTrail}
            />

            {/* Selected Tiger Active Metadata Strip */}
            {selectedTiger && (
              <div className="p-4 bg-white border border-stone-200 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold font-mono shadow-2xs">
                    {selectedTiger.id}
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{selectedTiger.name}</h4>
                    <span className="text-[11px] text-stone-500">
                      {selectedTiger.gender} • {selectedTiger.estimatedAge}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-stone-700">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Occupied Range</span>
                    <strong className="text-emerald-700">{selectedTiger.occupiedAreaSqKm} sq km</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Centroid Zone</span>
                    <strong className="text-stone-900">{selectedTiger.centroid.zoneName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Captures Trail</span>
                    <strong className="text-blue-700">{selectedTigerCaptures.length} Observations</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: GIS Legend & Overlaps Panel (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Territory Overlaps Widget */}
            <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                <Compass className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-extrabold text-stone-900 font-heading">
                  Territory Overlaps
                </h3>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Overlapping activity areas between adjacent dominant tigers. Shared stations indicate territorial contact risk.
              </p>

              <div className="space-y-3">
                {overlaps.length === 0 ? (
                  <div className="text-xs text-stone-400">No overlaps detected.</div>
                ) : (
                  overlaps.map((ov) => (
                    <div key={ov.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-emerald-700">{ov.primaryTigerId}</span>
                          <span className="text-stone-400">↔</span>
                          <span className="text-blue-700">{ov.neighborTigerId}</span>
                        </div>
                        <span className="font-mono text-emerald-700 font-bold">{ov.overlapAreaSqKm} sq km</span>
                      </div>
                      <div className="text-[11px] text-stone-600">
                        Shared Station: <span className="text-stone-900 font-semibold">{ov.sharedStationIds.join(', ')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comprehensive GIS Legend */}
            <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-3 text-xs shadow-xs">
              <h4 className="font-extrabold text-stone-900 font-heading flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" /> GIS Layer Legend
              </h4>

              <div className="space-y-2 text-stone-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white"></span>
                    <span>Core Forest Station</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">CORE</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 border border-white"></span>
                    <span>Buffer Zone Station</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">BUFFER</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 border border-white"></span>
                    <span>Village-Border Station</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">BORDER</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">
                      14
                    </span>
                    <span>Activity Centroid</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">Tiger ID</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-dashed border-emerald-500"></span>
                    <span>Occupied Area Geometry</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">GeoJSON</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white"></span>
                    <span>Capture Observation</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700">Point</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-0.5 border-t-2 border-dashed border-blue-600"></span>
                    <span>Chronological Path</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700">Trail</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

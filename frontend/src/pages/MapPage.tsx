import React, { useState, useEffect } from 'react';
import { Compass, Filter } from 'lucide-react';
import { ReserveMap } from '../components/map/ReserveMap';
import { getTigers, getTerritoryOverlaps } from '../services/tigers';
import { getCameraStations } from '../services/gis';
import type { Tiger, CameraStation, TerritoryOverlap } from '../types/tiger';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const MapPage: React.FC = () => {
  const [tigers, setTigers] = useState<Tiger[]>([]);
  const [stations, setStations] = useState<CameraStation[]>([]);
  const [overlaps, setOverlaps] = useState<TerritoryOverlap[]>([]);
  const [selectedTigerId, setSelectedTigerId] = useState<string>('ALL');
  const [showStations, setShowStations] = useState(true);
  const [showOccupancy, setShowOccupancy] = useState(true);
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
      } finally {
        setLoading(false);
      }
    }
    loadGisData();
  }, []);

  const displayedTigers =
    selectedTigerId === 'ALL'
      ? tigers
      : tigers.filter((t) => t.id === selectedTigerId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Map Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
            Reserve GIS Occupancy & Territory Explorer
          </h1>
          <p className="text-xs text-slate-400">
            Interactive spatial visualization of camera stations, activity centroids, occupied areas, and territory overlaps.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tiger Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedTigerId}
              onChange={(e) => setSelectedTigerId(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-slate-200 cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Individual Tigers</option>
              {tigers.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900">
                  {t.id} — {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Switches */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setShowStations(!showStations)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                showStations ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400'
              }`}
            >
              Stations ({stations.length})
            </button>
            <button
              onClick={() => setShowOccupancy(!showOccupancy)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                showOccupancy ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400'
              }`}
            >
              Centroids & Areas
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={1} height="h-[550px]" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Map */}
          <div className="lg:col-span-9">
            <ReserveMap
              stations={stations}
              tigers={displayedTigers}
              height="h-[560px]"
              showStations={showStations}
              showOccupancy={showOccupancy}
            />
          </div>

          {/* Map Sidebar / Territory Overlaps Panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Territory Overlaps Widget */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Compass className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-heading">
                  Territory Overlaps
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Overlapping activity areas between adjacent dominant tigers. Overlap signals territorial conflict risk.
              </p>

              <div className="space-y-3">
                {overlaps.map((ov) => (
                  <div key={ov.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-amber-400">{ov.primaryTigerId}</span>
                        <span className="text-slate-500">↔</span>
                        <span className="text-blue-400">{ov.neighborTigerId}</span>
                      </div>
                      <span className="font-mono text-amber-400 font-bold">{ov.overlapAreaSqKm} sq km</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Shared Station: <span className="text-slate-200">{ov.sharedStationIds.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Station Legend */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-white font-heading">Map Station Legend</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-slate-950"></span>
                  <span className="text-slate-300">Core Forest Stations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 border border-slate-950"></span>
                  <span className="text-slate-300">Buffer Zone Stations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 border border-slate-950"></span>
                  <span className="text-slate-300">Village-Adjacent Border Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

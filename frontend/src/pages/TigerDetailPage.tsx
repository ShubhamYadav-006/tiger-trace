import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import { getTigerById, getTigerCaptures } from '../services/tigers';
import type { Tiger, TigerCapture } from '../types/tiger';
import { ReserveMap } from '../components/map/ReserveMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const TigerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tiger, setTiger] = useState<Tiger | null>(null);
  const [captures, setCaptures] = useState<TigerCapture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTigerData() {
      if (!id) return;
      try {
        const [tData, cData] = await Promise.all([
          getTigerById(id),
          getTigerCaptures(id),
        ]);
        setTiger(tData || null);
        setCaptures(cData);
      } finally {
        setLoading(false);
      }
    }
    loadTigerData();
  }, [id]);

  if (loading) {
    return <LoadingSkeleton count={3} height="h-48" />;
  }

  if (!tiger) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <h2 className="text-xl font-bold text-white font-heading">Tiger Record Not Found</h2>
        <button
          onClick={() => navigate('/tigers')}
          className="px-4 py-2 bg-slate-800 text-xs text-white rounded-lg"
        >
          Return to Tiger Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tigers')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalogue
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge
            label={tiger.status}
            variant={tiger.status === 'ACTIVE' ? 'success' : 'warning'}
          />
          <span className="text-xs font-mono text-slate-400">Enrolled Individual ID: {tiger.id}</span>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="relative aspect-square lg:aspect-auto rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
          <img
            src={tiger.primaryImage}
            alt={tiger.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500 text-slate-950">
                {tiger.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">Pench Reserve Database</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white font-heading">{tiger.name}</h1>
            <p className="text-xs text-slate-300">
              Primary flank stripe profile verified against ATRW embedding database.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Gender / Age</span>
              <div className="font-bold text-white mt-1">{tiger.gender} • {tiger.estimatedAge}</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Captures</span>
              <div className="font-bold text-amber-400 font-mono mt-1">{tiger.totalCaptures} Captures</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Occupied Area</span>
              <div className="font-bold text-emerald-400 font-mono mt-1">{tiger.occupiedAreaSqKm} sq km</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Activity Centroid</span>
              <div className="font-bold text-white truncate mt-1">{tiger.centroid.zoneName}</div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Last Captured Station: <strong className="text-white">{tiger.lastStation}</strong></span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {new Date(tiger.lastSeen).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Movement Map */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white font-heading">
          Individual Movement & Trajectory GIS Map
        </h2>
        <ReserveMap
          stations={[]}
          tigers={[tiger]}
          selectedTigerCaptures={captures}
          height="h-[400px]"
          showStations={true}
          showOccupancy={true}
          showMovementTrail={true}
        />
      </div>

      {/* Capture History Table */}
      <div className="space-y-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <h2 className="text-base font-bold text-white font-heading">
          Capture Audit History & Flank Crops ({captures.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Flank Preview</th>
                <th className="p-3">Camera Station</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">GPS Coordinates</th>
                <th className="p-3">AI Confidence</th>
                <th className="p-3">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {captures.map((cap) => (
                <tr key={cap.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="p-3">
                    <img
                      src={cap.flankCropUrl || cap.imageUrl}
                      alt="Flank"
                      className="w-12 h-10 rounded-lg object-cover border border-slate-700"
                    />
                  </td>
                  <td className="p-3 font-semibold text-white">{cap.stationName}</td>
                  <td className="p-3 font-mono text-slate-400">
                    {new Date(cap.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    {cap.latitude.toFixed(4)} N, {cap.longitude.toFixed(4)} E
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-emerald-400 font-mono">
                      {Math.round(cap.confidence * 100)}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                      {cap.reviewStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

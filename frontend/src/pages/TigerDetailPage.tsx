import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Camera,
  Compass,
  CheckCircle2,
  ShieldAlert,
  Layers,
  Radio,
} from 'lucide-react';
import { getTigerById, getTigerCaptures } from '../services/tigers';
import { getMovementAlerts } from '../services/alerts';
import type { Tiger, TigerCapture } from '../types/tiger';
import type { MovementAlert } from '../types/alert';
import { ReserveMap } from '../components/map/ReserveMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const TigerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tiger, setTiger] = useState<Tiger | null>(null);
  const [captures, setCaptures] = useState<TigerCapture[]>([]);
  const [alerts, setAlerts] = useState<MovementAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTigerData() {
      if (!id) return;
      setLoading(true);
      try {
        const [tData, cData, allAlerts] = await Promise.all([
          getTigerById(id),
          getTigerCaptures(id),
          getMovementAlerts(),
        ]);
        setTiger(tData || null);
        setCaptures(cData);
        // Filter alerts for this tiger
        setAlerts(allAlerts.filter((a) => a.tigerId === id || a.tigerName.includes(id)));
      } catch (err) {
        console.error('Failed to load tiger profile data', err);
      } finally {
        setLoading(false);
      }
    }
    loadTigerData();
  }, [id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={2} />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  if (!tiger) {
    return (
      <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 space-y-4">
        <h2 className="text-xl font-bold text-white font-heading">Tiger Record Not Found</h2>
        <p className="text-xs">No registered individual matching ID "{id}" was found in the local catalogue.</p>
        <button
          onClick={() => navigate('/tigers')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
        >
          Return to Tiger Catalogue
        </button>
      </div>
    );
  }

  // Extract unique camera station names from capture records
  const uniqueStations = Array.from(
    new Set(captures.map((c) => c.stationName))
  );

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tigers')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalogue
        </button>

        <div className="flex items-center gap-3">
          <StatusBadge
            label={tiger.status}
            variant={
              tiger.status === 'ACTIVE'
                ? 'success'
                : tiger.status === 'DISPLACED'
                ? 'warning'
                : 'critical'
            }
          />
          <span className="text-xs font-mono text-slate-400 border-l border-slate-800 pl-3">
            Catalogue ID: <strong className="text-amber-400">{tiger.id}</strong>
          </span>
        </div>
      </div>

      {/* SECTION 1: Identity & Reference Overview */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Section 1: Individual Identity & Reference
        </h2>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Reference Image */}
          <div className="lg:col-span-4 relative aspect-square lg:aspect-auto rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <img
              src={tiger.primaryImage}
              alt={tiger.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[11px] font-mono font-bold text-amber-400">
              Primary Flank Reference
            </div>
          </div>

          {/* Core Info */}
          <div className="lg:col-span-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500 text-slate-950">
                  {tiger.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">Pench Reserve Individual Register</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white font-heading">{tiger.name}</h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stripe pattern verified and enrolled in the persistent reserve catalogue. Re-identification based on flank feature extraction.
              </p>
            </div>

            {/* Required Field Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Gender & Age</div>
                <div className="font-bold text-white mt-1">{tiger.gender} • {tiger.estimatedAge}</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Camera className="w-3 h-3 text-amber-400" /> Total Captures
                </div>
                <div className="font-bold text-amber-400 font-mono mt-1">{tiger.totalCaptures} Frames</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" /> First Seen Date
                </div>
                <div className="font-mono text-slate-200 mt-1">{formatDate(tiger.firstSeen)}</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" /> Last Seen Date
                </div>
                <div className="font-mono text-slate-200 mt-1">{formatDate(tiger.lastSeen)}</div>
              </div>
            </div>

            {/* Last Station Banner */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Last Captured Station: <strong className="text-white">{tiger.lastStation}</strong></span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {formatDateTime(tiger.lastSeen)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Spatial Intelligence, Occupancy & Camera Stations */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Section 2: Spatial Intelligence & Territory Boundaries
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Spatial Metrics & Camera Stations List (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Occupied Area Card */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-4 h-4" /> Estimated Occupied Area
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">
                {tiger.occupiedAreaSqKm} <span className="text-base text-slate-400 font-sans">sq km</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Calculated from camera station detection points. Core range threshold: 15–20 sq km.
              </p>
            </div>

            {/* Activity Centroid Card */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Radio className="w-4 h-4" /> Activity Centroid Location
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {tiger.centroid.latitude.toFixed(4)}° N, {tiger.centroid.longitude.toFixed(4)}° E
              </div>
              <div className="text-xs text-slate-300 font-medium">{tiger.centroid.zoneName} Zone</div>
            </div>

            {/* Stations Used List */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Camera Stations Used ({uniqueStations.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {uniqueStations.length === 0 ? (
                  <div className="text-xs text-slate-500">No station records found.</div>
                ) : (
                  uniqueStations.map((stName, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center justify-between text-slate-200"
                    >
                      <span className="font-semibold truncate">{stName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Interactive Territory & Trajectory Map (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-heading">
                Reserve Trajectory & Occupancy GIS Map
              </h3>
              <span className="text-[11px] text-amber-400 font-mono">Territory Polygon + Trail Active</span>
            </div>
            <ReserveMap
              stations={[]}
              tigers={[tiger]}
              selectedTigerCaptures={captures}
              height="h-[380px]"
              showStations={true}
              showOccupancy={true}
              showMovementTrail={true}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: Capture Audit History Table */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Section 3: Complete Capture Audit History ({captures.length} Observations)
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {captures.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No historical capture frames registered for this tiger yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Flank Crop</th>
                    <th className="p-3.5">Camera Station</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">GPS Location</th>
                    <th className="p-3.5">Identification Confidence</th>
                    <th className="p-3.5">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {captures.map((cap) => (
                    <tr key={cap.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="p-3.5">
                        <img
                          src={cap.flankCropUrl || cap.imageUrl}
                          alt="Flank"
                          className="w-14 h-11 rounded-lg object-cover border border-slate-700 bg-slate-950"
                        />
                      </td>
                      <td className="p-3.5 font-bold text-white">{cap.stationName}</td>
                      <td className="p-3.5 font-mono text-slate-400">
                        {formatDateTime(cap.timestamp)}
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        {cap.latitude.toFixed(4)}° N, {cap.longitude.toFixed(4)}° E
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-emerald-400">
                          {Math.round(cap.confidence * 100)}% Match
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-950 text-emerald-400 border border-emerald-500/30">
                          {cap.reviewStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: Related Movement Deviations & Alerts */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Section 4: Related Movement Deviations & Field Alerts ({alerts.length})
        </h2>
        {alerts.length === 0 ? (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
            No active movement deviations flagged for {tiger.id} ({tiger.name}).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-lg hover:border-red-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-mono font-bold text-amber-400">{alt.type}</span>
                  </div>
                  <StatusBadge
                    label={alt.severity}
                    variant={alt.severity === 'CRITICAL' ? 'critical' : 'warning'}
                    size="sm"
                  />
                </div>

                <h3 className="text-sm font-bold text-white font-heading">{alt.title}</h3>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <div><strong>Evidence:</strong> {alt.evidence.whatChanged}</div>
                  <div><strong>Previous State:</strong> {alt.evidence.previousState}</div>
                  <div><strong>Current State:</strong> {alt.evidence.currentState}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">Station: {alt.stationName}</span>
                    <span className="font-mono text-emerald-400 font-bold">Confidence: {alt.evidence.confidenceLevel}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Detected: {formatDateTime(alt.timestamp)}</span>
                  <button
                    onClick={() => navigate('/alerts')}
                    className="text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    View Alert Evidence Center →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

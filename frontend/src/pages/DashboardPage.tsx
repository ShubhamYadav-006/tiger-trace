import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Image,
  Cat,
  AlertTriangle,
  HardDrive,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  Play,
  Layers,
  FileCheck,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { ReserveMap } from '../components/map/ReserveMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { useDashboard } from '../hooks/useDashboard';
import { getTigers } from '../services/tigers';
import { getCameraStations } from '../services/gis';
import { getMovementAlerts } from '../services/alerts';
import { getPendingReviews } from '../services/review';
import type { Tiger, CameraStation } from '../types/tiger';
import type { MovementAlert } from '../types/alert';
import type { ReviewItem } from '../types/review';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, systemStatus, loading, error, refresh } = useDashboard();

  const [tigers, setTigers] = useState<Tiger[]>([]);
  const [stations, setStations] = useState<CameraStation[]>([]);
  const [alerts, setAlerts] = useState<MovementAlert[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [secondaryLoading, setSecondaryLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSecondaryData() {
      setSecondaryLoading(true);
      try {
        const [tigersData, stationsData, alertsData, reviewsData] =
          await Promise.all([
            getTigers(),
            getCameraStations(),
            getMovementAlerts(),
            getPendingReviews(),
          ]);

        setTigers(tigersData);
        setStations(stationsData);
        setAlerts(alertsData);
        setReviews(reviewsData);
      } catch (err) {
        console.error('Error loading secondary dashboard data', err);
      } finally {
        setSecondaryLoading(false);
      }
    }
    loadSecondaryData();
  }, []);

  const isLoading = loading || secondaryLoading;

  if (isLoading && !stats) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorBanner title="Dashboard Loading Error" message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Field System Header / Ingestion Launcher Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
              Field System Ready
            </span>
            <span className="text-xs text-slate-400 font-mono">Pench PTR Landscape</span>
            {systemStatus?.isOfflineMode && (
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                CPU Offline Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
            Offline Camera Trap & Tiger Intelligence Center
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Automatically process field SD cards, isolate flank stripe patterns, update individual tiger records, map territorial occupancy, and trigger movement deviation alerts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={refresh}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/processing')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all duration-200 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Start New SD-Card Ingestion
          </button>
        </div>
      </div>

      {/* Row 1: Pipeline Image Processing Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Image Ingestion & Processing Metrics
          </h2>
          {stats?.lastUpdated && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Images Processed"
            value={stats ? stats.totalImagesProcessed.toLocaleString() : '0'}
            subtitle="Raw Field SD Cards"
            icon={Image}
            color="blue"
            trend="All Survey Runs"
          />
          <StatCard
            title="Blank Images (Quarantined)"
            value={stats ? stats.blankImagesCount.toLocaleString() : '0'}
            subtitle="False Triggers Isolated"
            icon={Layers}
            color="emerald"
            trend={`${stats ? ((stats.blankImagesCount / (stats.totalImagesProcessed || 1)) * 100).toFixed(1) : 0}% Filtered`}
          />
          <StatCard
            title="Relevant / Subject Images"
            value={stats ? stats.relevantSubjectImagesCount.toLocaleString() : '0'}
            subtitle="Wildlife & Activity Frames"
            icon={FileCheck}
            color="amber"
            trend="Passed to Species Model"
          />
          <StatCard
            title="Tiger Detections"
            value={stats ? stats.tigerImagesCount.toLocaleString() : '0'}
            subtitle="Tiger Subject Images"
            icon={Cat}
            color="orange"
            trend="Extracted for Re-ID"
          />
        </div>
      </div>

      {/* Row 2: Intelligence & Field Review Metrics */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Individual Intelligence & Field Review
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Known Individual Tigers"
            value={stats ? stats.knownTigersCount : tigers.length}
            subtitle="Enrolled In Database"
            icon={Cat}
            color="amber"
            trend="Persistent Catalogue"
          />
          <StatCard
            title="Images Requiring Review"
            value={stats ? stats.imagesRequiringReviewCount : reviews.length}
            subtitle="Ambiguous Flank Matches"
            icon={UserCheck}
            color="purple"
            trend="Confidence < 0.85"
          />
          <StatCard
            title="Active Movement Alerts"
            value={stats ? stats.activeAlertsCount : alerts.filter((a) => !a.isAcknowledged).length}
            subtitle="Unacknowledged Deviations"
            icon={AlertTriangle}
            color="red"
            trend="Actionable Field Signals"
          />
          <StatCard
            title="Storage & Compute Saved"
            value={stats ? `${(stats.storageSavedMB / 1024).toFixed(1)} GB` : '0 GB'}
            subtitle={`${stats ? stats.processingTimeSavedMinutes : 0} Mins CPU Time Saved`}
            icon={HardDrive}
            color="emerald"
            trend="Reversible Quarantine"
          />
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Reserve GIS Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Reserve Occupancy & Activity Map
              </h2>
              <p className="text-xs text-slate-400">
                Camera stations, tiger activity centroids, and estimated occupied areas
              </p>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Full GIS Explorer
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ReserveMap
            stations={stations}
            tigers={tigers}
            height="h-[420px]"
            showStations={true}
            showOccupancy={true}
            showMovementTrail={false}
          />
        </div>

        {/* Right Column: Review Queue & Active Alerts */}
        <div className="space-y-6">
          {/* Pending Human Reviews Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-heading">
                  Human Review Queue
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {reviews.length} Pending
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Ambiguous flank stripe matches below confidence threshold (0.85). Reviewer confirmation required.
            </p>

            {reviews.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-center text-xs text-slate-400">
                No pending reviews. All AI matches verified.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 2).map((rev) => (
                  <div
                    key={rev.id}
                    onClick={() => navigate('/review')}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-amber-500/40 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.flankCropUrl}
                        alt="Flank Crop"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{rev.stationName}</div>
                        <div className="text-[11px] text-slate-400">
                          Suggested: <span className="text-amber-400 font-semibold">{rev.suggestedTigerId}</span> ({Math.round(rev.aiConfidence * 100)}%)
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/review')}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              Open Human Review Center ({reviews.length})
            </button>
          </div>

          {/* Movement Deviations Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-white font-heading">
                  Movement Deviations
                </h3>
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
              >
                View All
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-center text-xs text-slate-400">
                No active movement deviations detected.
              </div>
            ) : (
              <div className="space-y-2.5">
                {alerts.slice(0, 2).map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => navigate('/alerts')}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-red-500/40 transition-colors cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">{alt.tigerId}</span>
                      <StatusBadge
                        label={alt.severity}
                        variant={alt.severity === 'CRITICAL' ? 'critical' : 'warning'}
                        size="sm"
                      />
                    </div>
                    <h4 className="text-xs font-semibold text-white leading-snug">{alt.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{alt.stationName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

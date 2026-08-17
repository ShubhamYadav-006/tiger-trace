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
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { ReserveMap } from '../components/map/ReserveMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { getTigers } from '../services/tigers';
import { getCameraStations } from '../services/gis';
import { getMovementAlerts } from '../services/alerts';
import { getPendingReviews } from '../services/review';
import { getLatestRun } from '../services/runs';
import type { Tiger, CameraStation } from '../types/tiger';
import type { MovementAlert } from '../types/alert';
import type { ReviewItem } from '../types/review';
import type { ProcessingRun } from '../types/run';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [tigers, setTigers] = useState<Tiger[]>([]);
  const [stations, setStations] = useState<CameraStation[]>([]);
  const [alerts, setAlerts] = useState<MovementAlert[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [run, setRun] = useState<ProcessingRun | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [tigersData, stationsData, alertsData, reviewsData, runData] =
          await Promise.all([
            getTigers(),
            getCameraStations(),
            getMovementAlerts(),
            getPendingReviews(),
            getLatestRun(),
          ]);

        setTigers(tigersData);
        setStations(stationsData);
        setAlerts(alertsData);
        setReviews(reviewsData);
        setRun(runData);
      } catch (err) {
        console.error('Error loading dashboard data', err);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Ingestion Launcher Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
              Field System Ready
            </span>
            <span className="text-xs text-slate-400 font-mono">Pench PTR Landscape</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
            Offline Camera Trap & Tiger Intelligence Center
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Automatically process field SD cards, isolate flank stripe patterns, update individual tiger records, map territorial occupancy, and trigger movement deviation alerts.
          </p>
        </div>

        <button
          onClick={() => navigate('/processing')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all duration-200 shrink-0 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          Start New SD-Card Ingestion
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Frames Processed"
          value={run ? run.totalImages.toLocaleString() : '14,250'}
          subtitle="Batch SD-Card 08"
          icon={Image}
          color="blue"
          trend="11,840 Blanks Quarantined"
        />
        <StatCard
          title="Identified Tigers"
          value={tigers.length}
          subtitle="Enrolled Individuals"
          icon={Cat}
          color="amber"
          trend="5 Core Individuals Active"
        />
        <StatCard
          title="Active Deviations"
          value={alerts.filter((a) => !a.isAcknowledged).length}
          subtitle="Movement Alerts"
          icon={AlertTriangle}
          color="red"
          trend="1 Critical Buffer Movement"
        />
        <StatCard
          title="Field Storage Saved"
          value={run ? `${(run.storageSavedMB / 1024).toFixed(1)} GB` : '28.4 GB'}
          subtitle="Safe Blank Quarantine"
          icon={HardDrive}
          color="emerald"
          trend="184 Mins Compute Saved"
        />
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
          </div>
        </div>
      </div>
    </div>
  );
};

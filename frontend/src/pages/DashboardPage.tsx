import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Image,
  Cat,
  AlertTriangle,
  UserCheck,
  Play,
  Layers,
  FileCheck,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { useDashboard } from '../hooks/useDashboard';
import { getMovementAlerts } from '../services/alerts';
import { getPendingReviews } from '../services/review';
import type { MovementAlert } from '../types/alert';
import type { ReviewItem } from '../types/review';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, systemStatus, loading, error, refresh } = useDashboard();

  const [alerts, setAlerts] = useState<MovementAlert[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [secondaryLoading, setSecondaryLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSecondaryData() {
      setSecondaryLoading(true);
      try {
        const [alertsData, reviewsData] = await Promise.all([
          getMovementAlerts(),
          getPendingReviews(),
        ]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  );
};

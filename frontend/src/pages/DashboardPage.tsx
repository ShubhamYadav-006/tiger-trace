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
  FolderOpen,
  History,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { useDashboard } from '../hooks/useDashboard';
import { useRuns } from '../hooks/useRuns';
import { getMovementAlerts } from '../services/alerts';
import { getPendingReviews } from '../services/review';
import type { MovementAlert } from '../types/alert';
import type { ReviewItem } from '../types/review';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading, error, refresh } = useDashboard();
  const { runs, createRun, refresh: refreshRuns } = useRuns();

  const [folderPath, setFolderPath] = useState('E:\\FieldData\\Pench_SDCard_Batch08');
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

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

  const handleStartRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath.trim()) return;
    setIsStarting(true);
    setStartError(null);
    try {
      await createRun(folderPath.trim());
      refreshRuns();
    } catch (err) {
      setStartError(err instanceof Error ? err.message : 'Failed to start processing batch');
    } finally {
      setIsStarting(false);
    }
  };

  const activeRun = runs.find((r) => r.status === 'IN_PROGRESS');
  const recentRuns = runs.slice(0, 3);

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


      {/* Active Processing Engine & Ingestion Form Section */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-heading uppercase tracking-wider flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-amber-400" />
            Start New Camera Trap Ingestion Batch
          </h2>
        </div>

        <form onSubmit={handleStartRun} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FolderOpen className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/60"
              placeholder="E:\FieldData\CameraTrap_Batch"
              disabled={isStarting}
            />
          </div>
          <button
            type="submit"
            disabled={isStarting || !folderPath.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isStarting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            {isStarting ? 'Starting Ingestion...' : 'Start Ingestion Batch'}
          </button>
        </form>

        {startError && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {startError}
          </p>
        )}

        {/* Live Active Processing Status Widget */}
        {activeRun ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-xs font-bold text-white font-heading">
                  Active Processing: {activeRun.name}
                </span>
                <span className="text-[10px] font-mono text-amber-400">({activeRun.id})</span>
              </div>
              <StatusBadge label={activeRun.status} variant="warning" size="sm" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-300 font-medium">
                  Pipeline Stage: {activeRun.currentStage}
                </span>
                <span className="text-white font-mono font-bold">{activeRun.progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${activeRun.progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-400">Total Frames:</span>{' '}
                <span className="font-mono font-bold text-white">{activeRun.totalImages.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Blanks Filtered:</span>{' '}
                <span className="font-mono font-bold text-emerald-400">{activeRun.blankImagesCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Tigers Detected:</span>{' '}
                <span className="font-mono font-bold text-amber-400">{activeRun.tigerDetectionsCount}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Engine Idle — Standing by for camera-trap SD card batch ingestion.
            </span>
            <button
              onClick={() => navigate('/processing')}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" /> View Processing History
            </button>
          </div>
        )}
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

      {/* Row 2: Intelligence & Recent History Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Intelligence & Field Review */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Field Review & Signal Signals
          </h2>
          <div className="grid grid-cols-1 gap-4">
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

        {/* Right: Recent Ingestion Runs History */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Recent Ingestion Runs
              </h2>
              <span className="text-xs text-slate-400">{runs.length} Total Runs Saved</span>
            </div>

            <div className="space-y-2">
              {recentRuns.map((r) => (
                <div
                  key={r.id}
                  onClick={() => navigate('/processing')}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-amber-500/40 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{r.name}</span>
                      <StatusBadge
                        label={r.status}
                        variant={r.status === 'COMPLETED' ? 'success' : r.status === 'FAILED' ? 'critical' : 'warning'}
                        size="sm"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{r.folderPath}</p>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div className="text-xs font-mono">
                      <span className="text-amber-400 font-bold">{r.tigerDetectionsCount}</span>{' '}
                      <span className="text-slate-500">Tigers</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/processing')}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <History className="w-4 h-4" />
            Open Full Processing History & Quarantine Manager
          </button>
        </div>
      </div>
    </div>
  );
};

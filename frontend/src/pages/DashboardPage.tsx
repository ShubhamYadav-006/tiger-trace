import React, { useEffect, useState, useRef } from 'react';
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
  AlertCircle,
  Upload,
  X,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { useDashboard } from '../hooks/useDashboard';
import { useRuns } from '../hooks/useRuns';
import { getMovementAlerts } from '../services/alerts';
import { getPendingReviews } from '../services/review';
import type { MovementAlert } from '../types/alert';
import type { ReviewItem } from '../types/review';

export const DashboardPage: React.FC = () => {
  const { stats, loading, error, refresh } = useDashboard();
  const { runs, createRun, refresh: refreshRuns } = useRuns();

  const [folderPath, setFolderPath] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-expect-error Native File System Access API in modern browsers
        const dirHandle = await window.showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          setFolderPath(`E:\\FieldData\\${dirHandle.name}`);
          return;
        }
      } catch {
        // User cancelled or browser rejected dialog; fallback to file input click
      }
    }
    fileInputRef.current?.click();
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      const fullPath = (firstFile as unknown as { path?: string }).path;
      if (fullPath) {
        const lastSlash = Math.max(fullPath.lastIndexOf('\\'), fullPath.lastIndexOf('/'));
        if (lastSlash !== -1) {
          const folderDir = fullPath.substring(0, lastSlash);
          setFolderPath(folderDir);
          return;
        }
      }

      const relativePath = firstFile.webkitRelativePath;
      if (relativePath) {
        const folderName = relativePath.split('/')[0];
        setFolderPath(`E:\\FieldData\\${folderName}`);
      }
    }
  };

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
      <div className="p-6 bg-slate-50/90 border border-slate-300/80 rounded-xl space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-stone-900 font-heading uppercase tracking-wider flex items-center gap-2">
            <div className="w-16 h-16 flex items-center justify-center -ml-2">
              <img src="/logo.png" alt="TigerTrace Logo" className="w-full h-full object-contain scale-125" />
            </div>
            Import Camera Images
          </h2>
        </div>

        <form onSubmit={handleStartRun} className="flex flex-col sm:flex-row gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFolderSelect}
            className="hidden"
            // @ts-expect-error webkitdirectory is a non-standard attribute supported by modern browsers
            webkitdirectory=""
            directory=""
          />

          <div className="flex-1 flex items-center gap-2 bg-stone-50 border border-stone-300 rounded-lg p-1.5 focus-within:border-emerald-600 transition-colors">
            <button
              type="button"
              onClick={handleUploadClick}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-md border border-emerald-200/80 flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Upload className="w-4 h-4 text-emerald-700" />
              Upload folder
            </button>
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              className="w-full bg-transparent border-none py-1.5 px-2 text-sm text-stone-900 font-mono font-medium focus:outline-none placeholder:text-stone-400"
              placeholder="Select folder or enter path e.g. E:\FieldData\Batch08"
              disabled={isStarting}
            />
            {folderPath && (
              <button
                type="button"
                onClick={() => {
                  setFolderPath('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="p-1 hover:bg-stone-200 text-stone-400 hover:text-stone-700 rounded-md transition-colors mr-1 cursor-pointer shrink-0"
                title="Clear selected folder"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isStarting || !folderPath.trim()}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isStarting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            {isStarting ? 'Starting Sorting...' : 'Start Sorting'}
          </button>
        </form>

        {startError && (
          <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> {startError}
          </p>
        )}

        {/* Live Active Processing Status Widget */}
        {activeRun ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-800 flex items-center gap-2">
                {activeRun.status === 'IN_PROGRESS' && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                )}
                {activeRun.status === 'COMPLETED'
                  ? 'Completed'
                  : activeRun.status === 'IN_PROGRESS'
                  ? 'Processing..'
                  : 'Please Upload to Start'}
              </span>
              <span className="text-emerald-900 font-mono font-bold">{activeRun.progressPercentage}%</span>
            </div>
            <div className="w-full bg-emerald-100 rounded-full h-2.5 overflow-hidden border border-emerald-200">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${activeRun.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-500">Please Upload to Start</span>
              <span className="text-stone-400 font-mono font-bold">0%</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden border border-stone-300">
              <div className="bg-stone-400 h-full rounded-full w-0"></div>
            </div>
          </div>
        )}
      </div>

      {/* Row 1: Pipeline Image Processing Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Image Ingestion & Processing Metrics
          </h2>
          {stats?.lastUpdated && (
            <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
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
          />
          <StatCard
            title="Blank Images (Quarantined)"
            value={stats ? stats.blankImagesCount.toLocaleString() : '0'}
            subtitle="False Triggers Isolated"
            icon={Layers}
            color="emerald"
          />
          <StatCard
            title="Relevant / Subject Images"
            value={stats ? stats.relevantSubjectImagesCount.toLocaleString() : '0'}
            subtitle="Wildlife & Activity Frames"
            icon={FileCheck}
            color="amber"
          />
          <StatCard
            title="Tiger Detections"
            value={stats ? stats.tigerImagesCount.toLocaleString() : '0'}
            subtitle="Tiger Subject Images"
            icon={Cat}
            color="orange"
          />
        </div>
      </div>

      {/* Row 2: Intelligence & Field Review */}
      <div>
        <h2 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-3">
          Field Review & Signal Signals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Images Requiring Review"
            value={stats ? stats.imagesRequiringReviewCount : reviews.length}
            subtitle="Ambiguous Flank Matches"
            icon={UserCheck}
            color="purple"
          />
          <StatCard
            title="Active Movement Alerts"
            value={stats ? stats.activeAlertsCount : alerts.filter((a) => !a.isAcknowledged).length}
            subtitle="Unacknowledged Deviations"
            icon={AlertTriangle}
            color="red"
          />
        </div>
      </div>
    </div>
  );
};

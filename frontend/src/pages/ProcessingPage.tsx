import React, { useState } from 'react';
import {
  FolderOpen,
  Play,
  RefreshCw,
  Shield,
  Layers,
  RotateCcw,
  AlertCircle,
  Search,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { EmptyState } from '../components/common/EmptyState';
import { useRuns } from '../hooks/useRuns';
import { getQuarantinedImages, restoreQuarantinedImage } from '../services/runs';
import type { QuarantinedImage, RunStatus } from '../types/run';

export const ProcessingPage: React.FC = () => {
  const { runs, selectedRun, loading, error, selectRun, createRun, refresh } = useRuns();

  const [folderPath, setFolderPath] = useState('E:\\FieldData\\Pench_SDCard_Batch08');
  const [quarantineList, setQuarantineList] = useState<QuarantinedImage[]>([]);
  const [quarantineLoading, setQuarantineLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'RUNS' | 'QUARANTINE'>('RUNS');
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadQuarantine() {
      setQuarantineLoading(true);
      try {
        const q = await getQuarantinedImages();
        setQuarantineList(q);
      } catch (err) {
        console.error('Failed to load quarantine images', err);
      } finally {
        setQuarantineLoading(false);
      }
    }
    loadQuarantine();
  }, []);

  const handleStartRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath.trim()) return;
    setIsStarting(true);
    setStartError(null);
    try {
      await createRun(folderPath.trim());
      setActiveTab('RUNS');
    } catch (err) {
      setStartError(err instanceof Error ? err.message : 'Failed to start run');
    } finally {
      setIsStarting(false);
    }
  };

  const handleRestoreImage = async (id: string) => {
    await restoreQuarantinedImage(id);
    setQuarantineList((prev) => prev.filter((img) => img.id !== id));
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatDateTime = (isoString?: string): string => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };



  const filteredRuns = runs.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.folderPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
            Processing History & Ingestion Archive
          </h1>
          <p className="text-xs text-slate-400">
            Complete historical log of camera-trap batch processing runs and quarantined blank frame staging.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 self-start">
          <button
            onClick={() => setActiveTab('RUNS')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'RUNS'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Run History ({runs.length})
          </button>
          <button
            onClick={() => setActiveTab('QUARANTINE')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'QUARANTINE'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Safe Quarantine ({quarantineList.length})
          </button>
        </div>
      </div>

      {activeTab === 'RUNS' ? (
        <div className="space-y-6">
          {/* Start New Ingestion Batch Input Card */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white font-heading uppercase tracking-wider flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-400" />
                Start New Processing Batch
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
          </div>

          {/* Main Content Area: Split View (List + Details) */}
          {loading ? (
            <LoadingSkeleton type="table" count={4} />
          ) : error ? (
            <ErrorBanner title="Failed to load processing runs" message={error} onRetry={refresh} />
          ) : runs.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No Processing Runs Recorded"
              description="Enter a field folder path above to start your first camera-trap batch processing run."
              actionLabel="Refresh List"
              onAction={refresh}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Processing Run List (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Search & Filters */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search runs by name or path..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  {/* Status Pills */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {(['ALL', 'COMPLETED', 'IN_PROGRESS', 'FAILED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1 rounded-md border font-medium transition-colors cursor-pointer ${
                          statusFilter === status
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {status === 'ALL' ? 'All Runs' : status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Runs List Items */}
                <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
                  {filteredRuns.length === 0 ? (
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                      No runs matching filter standard.
                    </div>
                  ) : (
                    filteredRuns.map((r) => {
                      const isSelected = selectedRun?.id === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => selectRun(r.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                            isSelected
                              ? 'bg-slate-900 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xs font-bold text-white truncate">{r.name}</h3>
                              </div>
                              <span className="text-[10px] font-mono text-amber-400">{r.id}</span>
                            </div>
                            <StatusBadge
                              label={r.status}
                              variant={
                                r.status === 'COMPLETED'
                                  ? 'success'
                                  : r.status === 'FAILED'
                                  ? 'critical'
                                  : 'warning'
                              }
                              size="sm"
                            />
                          </div>

                          {/* Folder Path */}
                          <p className="text-[11px] text-slate-400 font-mono truncate">{r.folderPath}</p>

                          {/* Progress Bar if IN_PROGRESS */}
                          {r.status === 'IN_PROGRESS' && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-amber-400 font-medium animate-pulse">
                                  Processing: {r.currentStage}
                                </span>
                                <span className="text-slate-300 font-mono">{r.progressPercentage}%</span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                <div
                                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${r.progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Mini Summary Stats */}
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                            <div>
                              <span className="text-slate-400 text-[10px]">Total</span>
                              <div className="font-mono font-bold text-slate-200">{r.totalImages.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px]">Blanks</span>
                              <div className="font-mono font-bold text-emerald-400">{r.blankImagesCount.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px]">Tigers</span>
                              <div className="font-mono font-bold text-amber-400">{r.tigerDetectionsCount}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Processing Run Details (7 cols) */}
              <div className="lg:col-span-7">
                {selectedRun ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl sticky top-20">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-amber-400 font-semibold">{selectedRun.id}</span>
                          <StatusBadge
                            label={selectedRun.status}
                            variant={
                              selectedRun.status === 'COMPLETED'
                                ? 'success'
                                : selectedRun.status === 'FAILED'
                                ? 'critical'
                                : 'warning'
                            }
                          />
                        </div>
                        <h2 className="text-xl font-bold text-white font-heading">{selectedRun.name}</h2>
                        <p className="text-xs text-slate-400 font-mono">{selectedRun.folderPath}</p>
                      </div>

                      <div className="text-right sm:border-l border-slate-800 sm:pl-4 space-y-1 shrink-0">
                        <div className="text-2xl font-extrabold text-white font-mono">
                          {selectedRun.progressPercentage}%
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Duration: <span className="font-mono font-semibold text-slate-200">{formatDuration(selectedRun.processingDurationSeconds)}</span>
                        </div>
                      </div>
                    </div>



                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-300">Pipeline Stage: {selectedRun.currentStage}</span>
                        <span className="text-amber-400 font-mono">{selectedRun.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            selectedRun.status === 'FAILED'
                              ? 'bg-red-500'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${selectedRun.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>



                    {/* Detailed Stats Grid (Task 2 Field List) */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Run Metrics & Results Breakdown
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="text-[11px] text-slate-400">Total Images</div>
                          <div className="text-base font-bold text-white font-mono mt-0.5">
                            {selectedRun.totalImages.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="text-[11px] text-slate-400">Processed Images</div>
                          <div className="text-base font-bold text-blue-400 font-mono mt-0.5">
                            {selectedRun.processedImages.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="text-[11px] text-slate-400">Blank Images</div>
                          <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                            {selectedRun.blankImagesCount.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="text-[11px] text-slate-400">Tiger Images</div>
                          <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                            {selectedRun.tigerDetectionsCount}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="text-[11px] text-slate-400">Quarantined Images</div>
                          <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                            {selectedRun.quarantinedImagesCount.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="text-[11px] text-slate-400">Error Count</div>
                          <div className={`text-base font-bold font-mono mt-0.5 ${selectedRun.errorCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                            {selectedRun.errorCount}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="text-[11px] text-slate-400">Human Reviews</div>
                          <div className="text-base font-bold text-purple-400 font-mono mt-0.5">
                            {selectedRun.humanReviewRequiredCount}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="text-[11px] text-slate-400">Storage Saved</div>
                          <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                            {(selectedRun.storageSavedMB / 1024).toFixed(1)} GB
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Log Section if errors > 0 */}
                    {selectedRun.errors && selectedRun.errors.length > 0 && (
                      <div className="space-y-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>Pipeline Errors Encountered ({selectedRun.errors.length})</span>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedRun.errors.map((err) => (
                            <div key={err.id} className="p-2.5 bg-slate-950/80 border border-red-500/20 rounded-lg text-xs space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-mono text-red-300 font-bold">{err.code}</span>
                                <span className="text-slate-500 font-mono">{formatDateTime(err.timestamp)}</span>
                              </div>
                              <p className="text-slate-300 leading-snug">{err.message}</p>
                              {err.filename && (
                                <p className="text-[10px] text-slate-400 font-mono">File: {err.filename}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                    Select a processing run from the list to view complete details.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Safe Quarantine Manager Tab View */
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Safe Delete Protocol:</strong> Blank frames are safely quarantined into staging. No image is permanently deleted automatically.
              </span>
            </div>
            <span className="font-mono text-slate-400">{quarantineList.length} Frames Staged</span>
          </div>

          {quarantineLoading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : quarantineList.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="Quarantine Queue Empty"
              description="No blank images currently quarantined. All false triggers remain staging-ready."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quarantineList.map((img) => (
                <div
                  key={img.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-3 p-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                      <img
                        src={img.thumbnailUrl}
                        alt={img.filename}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-slate-700">
                        {Math.round(img.aiBlankConfidence * 100)}% Blank Conf
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono truncate">{img.filename}</div>
                      <div className="text-[11px] text-slate-400">
                        Reason: <span className="text-amber-400 font-semibold">{img.reason}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{img.folderPath}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreImage(img.id)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore Frame to Dataset
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
  Upload,
  X,
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

  const [folderPath, setFolderPath] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      const relativePath = firstFile.webkitRelativePath || firstFile.name;
      const folderName = relativePath.split('/')[0] || relativePath.split('\\')[0];
      setFolderPath(`E:\\FieldData\\${folderName}`);
    }
  };
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
          <h1 className="text-2xl font-extrabold text-stone-900 font-heading tracking-tight">
            Processing History & Ingestion Archive
          </h1>
          <p className="text-xs text-stone-600">
            Complete historical log of camera-trap batch processing runs and quarantined blank frame staging.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-stone-200/70 border border-stone-300 rounded-lg p-1 self-start">
          <button
            onClick={() => setActiveTab('RUNS')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'RUNS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Run History ({runs.length})
          </button>
          <button
            onClick={() => setActiveTab('QUARANTINE')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'QUARANTINE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
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
          <div className="p-6 bg-slate-50/90 border border-slate-300/80 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-stone-900 font-heading uppercase tracking-wider flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-emerald-700" />
                Start New Processing Batch
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
                  placeholder="Select folder or enter path e.g. E:\FieldData\CameraTrap_Batch"
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
                <div className="bg-slate-50/90 border border-slate-300/80 rounded-xl p-4 space-y-3 shadow-xs">
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search runs by name or path..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
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
                            ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                            : 'bg-stone-100 text-stone-600 border-stone-200 hover:text-stone-900 hover:bg-stone-200/60'
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
                    <div className="p-6 bg-white border border-stone-200 rounded-xl text-center text-xs text-stone-500">
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
                              ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-400'
                              : 'bg-white border-stone-200 hover:border-emerald-400 hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xs font-bold text-stone-900 truncate">{r.name}</h3>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-700 font-semibold">{r.id}</span>
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
                  <div className="bg-slate-50/90 border border-slate-300/80 rounded-xl p-6 space-y-6 shadow-xs sticky top-20 text-stone-900">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-emerald-700 font-bold">{selectedRun.id}</span>
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
                        <h2 className="text-xl font-bold text-stone-900 font-heading">{selectedRun.name}</h2>
                        <p className="text-xs text-stone-500 font-mono">{selectedRun.folderPath}</p>
                      </div>

                      <div className="text-right sm:border-l border-stone-200 sm:pl-4 space-y-1 shrink-0">
                        <div className="text-2xl font-extrabold text-stone-900 font-mono">
                          {selectedRun.progressPercentage}%
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Duration: <span className="font-mono font-semibold text-stone-800">{formatDuration(selectedRun.processingDurationSeconds)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-stone-700">Pipeline Stage: {selectedRun.currentStage}</span>
                        <span className="text-emerald-700 font-mono">{selectedRun.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden border border-stone-300">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            selectedRun.status === 'FAILED'
                              ? 'bg-rose-500'
                              : 'bg-gradient-to-r from-emerald-500 to-green-600'
                          }`}
                          style={{ width: `${selectedRun.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Detailed Stats Grid (Task 2 Field List) */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                        Run Metrics & Results Breakdown
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <div className="text-[11px] text-stone-500">Total Images</div>
                          <div className="text-base font-bold text-stone-900 font-mono mt-0.5">
                            {selectedRun.totalImages.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <div className="text-[11px] text-stone-500">Processed Images</div>
                          <div className="text-base font-bold text-blue-700 font-mono mt-0.5">
                            {selectedRun.processedImages.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <div className="text-[11px] text-stone-500">Blank Images</div>
                          <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                            {selectedRun.blankImagesCount.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <div className="text-[11px] text-stone-500">Tiger Images</div>
                          <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">
                            {selectedRun.tigerDetectionsCount}
                          </div>
                        </div>

                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <div className="text-[11px] text-stone-500">Quarantined Images</div>
                          <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                            {selectedRun.quarantinedImagesCount.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <div className="text-[11px] text-stone-500">Error Count</div>
                          <div className={`text-base font-bold font-mono mt-0.5 ${selectedRun.errorCount > 0 ? 'text-rose-600' : 'text-stone-700'}`}>
                            {selectedRun.errorCount}
                          </div>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <div className="text-[11px] text-stone-500">Human Reviews</div>
                          <div className="text-base font-bold text-purple-700 font-mono mt-0.5">
                            {selectedRun.humanReviewRequiredCount}
                          </div>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <div className="text-[11px] text-stone-500">Storage Saved</div>
                          <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                            {(selectedRun.storageSavedMB / 1024).toFixed(1)} GB
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Log Section if errors > 0 */}
                    {selectedRun.errors && selectedRun.errors.length > 0 && (
                      <div className="space-y-2 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>Pipeline Errors Encountered ({selectedRun.errors.length})</span>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedRun.errors.map((err) => (
                            <div key={err.id} className="p-2.5 bg-white border border-rose-200 rounded-lg text-xs space-y-1 shadow-xs">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-mono text-rose-800 font-bold">{err.code}</span>
                                <span className="text-stone-500 font-mono">{formatDateTime(err.timestamp)}</span>
                              </div>
                              <p className="text-stone-800 leading-snug">{err.message}</p>
                              {err.filename && (
                                <p className="text-[10px] text-stone-500 font-mono">File: {err.filename}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 bg-white border border-stone-200 rounded-xl text-center text-xs text-stone-500">
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
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>
                <strong>Safe Delete Protocol:</strong> Blank frames are safely quarantined into staging. No image is permanently deleted automatically.
              </span>
            </div>
            <span className="font-mono text-emerald-800 font-bold">{quarantineList.length} Frames Staged</span>
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
                  className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs space-y-3 p-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                      <img
                        src={img.thumbnailUrl}
                        alt={img.filename}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-white/90 text-emerald-800 border border-emerald-300 shadow-xs">
                        {Math.round(img.aiBlankConfidence * 100)}% Blank Conf
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 font-mono truncate">{img.filename}</div>
                      <div className="text-[11px] text-stone-600">
                        Reason: <span className="text-emerald-800 font-semibold">{img.reason}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono truncate">{img.folderPath}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreImage(img.id)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 rounded-lg border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

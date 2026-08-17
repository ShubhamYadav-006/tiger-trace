import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Play,
  CheckCircle2,
  RefreshCw,
  Shield,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { getLatestRun, startProcessingRun, getQuarantinedImages, restoreQuarantinedImage } from '../services/runs';
import type { ProcessingRun, PipelineStage, QuarantinedImage } from '../types/run';

export const ProcessingPage: React.FC = () => {
  const [folderPath, setFolderPath] = useState('E:\\FieldData\\Pench_SDCard_Batch08');
  const [run, setRun] = useState<ProcessingRun | null>(null);
  const [quarantineList, setQuarantineList] = useState<QuarantinedImage[]>([]);
  const [activeTab, setActiveTab] = useState<'RUN' | 'QUARANTINE'>('RUN');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [r, q] = await Promise.all([getLatestRun(), getQuarantinedImages()]);
      setRun(r);
      setQuarantineList(q);
    }
    loadData();
  }, []);

  const handleStartRun = async () => {
    setIsStarting(true);
    try {
      const newRun = await startProcessingRun(folderPath);
      setRun(newRun);
    } finally {
      setIsStarting(false);
    }
  };

  const handleRestoreImage = async (id: string) => {
    await restoreQuarantinedImage(id);
    setQuarantineList((prev) => prev.filter((img) => img.id !== id));
  };

  const pipelineStages: { stage: PipelineStage; label: string; desc: string }[] = [
    { stage: 'INGESTION', label: '1. Metadata Ingestion', desc: 'Read SD card timestamps & station EXIF' },
    { stage: 'BLANK_FILTERING', label: '2. Blank Filtering', desc: 'Isolate heat shimmer, moving grass & blanks' },
    { stage: 'TIGER_DETECTION', label: '3. Tiger Detection', desc: 'MegaDetector object crop' },
    { stage: 'INDIVIDUAL_REID', label: '4. Tiger Re-ID', desc: 'Stripe feature extraction & similarity matching' },
    { stage: 'SPATIAL_ANALYSIS', label: '5. Spatial Intelligence', desc: 'Update centroids & occupied area' },
    { stage: 'ALERT_GENERATION', label: '6. Alert Engine', desc: 'Evaluate range shift & movement rules' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
            Processing Run & Blank Quarantine
          </h1>
          <p className="text-xs text-slate-400">
            Batch process raw camera-trap SD card folders without cloud or internet connectivity.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 self-start">
          <button
            onClick={() => setActiveTab('RUN')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'RUN'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Processing Run
          </button>
          <button
            onClick={() => setActiveTab('QUARANTINE')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
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

      {activeTab === 'RUN' ? (
        <div className="space-y-6">
          {/* Folder Path Selection Card */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-lg">
            <h2 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
              Select Field SD-Card Folder
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FolderOpen className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/60"
                  placeholder="E:\FieldData\CameraTrap_Batch"
                />
              </div>
              <button
                onClick={handleStartRun}
                disabled={isStarting}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isStarting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                Start Processing Batch
              </button>
            </div>
          </div>

          {/* Run Progress Status */}
          {run && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-amber-400">{run.id}</span>
                    <StatusBadge
                      label={run.status}
                      variant={run.status === 'COMPLETED' ? 'success' : 'warning'}
                    />
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">{run.folderPath}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white font-mono">{run.progressPercentage}%</div>
                  <div className="text-[11px] text-slate-400">Pipeline Execution Progress</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${run.progressPercentage}%` }}
                ></div>
              </div>

              {/* Pipeline Stage Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pipelineStages.map((st) => {
                  const isDone = run.status === 'COMPLETED';
                  return (
                    <div
                      key={st.stage}
                      className={`p-3 rounded-lg border flex items-start gap-3 ${
                        isDone
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                          : 'bg-slate-950 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">{st.label}</div>
                        <div className="text-[11px] text-slate-400">{st.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Run Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Total Frames</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {run.totalImages.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Blanks Quarantined</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    {run.blankImagesCount.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Tiger Detections</div>
                  <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                    {run.tigerDetectionsCount}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Storage Saved</div>
                  <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">
                    {(run.storageSavedMB / 1024).toFixed(1)} GB
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Safe Quarantine Manager View */
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
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Frame to Dataset
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

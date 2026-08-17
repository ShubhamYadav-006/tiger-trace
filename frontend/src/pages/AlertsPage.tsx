import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Filter,
  Check,
  CheckCircle,
} from 'lucide-react';
import { getMovementAlerts, acknowledgeAlert } from '../services/alerts';
import type { MovementAlert } from '../types/alert';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<MovementAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<MovementAlert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await getMovementAlerts();
        setAlerts(data);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isAcknowledged: true } : a))
    );
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert({ ...selectedAlert, isAcknowledged: true });
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
            Actionable Movement Deviation Alerts
          </h1>
          <p className="text-xs text-slate-400">
            Explainable movement alerts corrected for survey effort and historical baseline.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-transparent focus:outline-none text-xs text-slate-200 cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">All Severities</option>
            <option value="CRITICAL" className="bg-slate-900">Critical</option>
            <option value="WARNING" className="bg-slate-900">Warning</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="h-32" />
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              onClick={() => setSelectedAlert(alt)}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alt.severity === 'CRITICAL'
                  ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/60'
                  : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <img
                  src={alt.tigerThumbnail}
                  alt={alt.tigerName}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">{alt.tigerId}</span>
                    <span className="text-xs text-slate-400 font-semibold">• {alt.tigerName}</span>
                    <StatusBadge
                      label={alt.type.replace(/_/g, ' ')}
                      variant={alt.severity === 'CRITICAL' ? 'critical' : 'warning'}
                      size="sm"
                    />
                    {alt.isAcknowledged && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Acknowledged
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white font-heading">{alt.title}</h3>
                  <p className="text-xs text-slate-300 max-w-2xl">{alt.evidence.whatChanged}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAlert(alt);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  View Evidence & Map
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explainable Alert Evidence Modal */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title="Explainable Deviation Evidence & Spatial Context"
        maxWidth="2xl"
      >
        {selectedAlert && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAlert.tigerThumbnail}
                  alt={selectedAlert.tigerName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">{selectedAlert.tigerId}</span>
                    <h3 className="text-sm font-bold text-white">{selectedAlert.tigerName}</h3>
                  </div>
                  <div className="text-xs text-slate-400">{selectedAlert.type}</div>
                </div>
              </div>
              <StatusBadge
                label={selectedAlert.severity}
                variant={selectedAlert.severity === 'CRITICAL' ? 'critical' : 'warning'}
              />
            </div>

            {/* Evidence Breakdown Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white font-heading uppercase tracking-wider">
                Automated Evidence Breakdown
              </h4>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] text-amber-400 font-semibold uppercase">What Changed</span>
                <p className="text-slate-200">{selectedAlert.evidence.whatChanged}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Previous Baseline</span>
                  <p className="text-slate-300 mt-1">{selectedAlert.evidence.previousState}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Current Observed State</span>
                  <p className="text-slate-300 mt-1">{selectedAlert.evidence.currentState}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Survey Effort</span>
                  <p className="text-emerald-400 font-bold mt-0.5">{selectedAlert.evidence.surveyEffortStatus}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Evidence Confidence</span>
                  <p className="text-amber-400 font-bold mt-0.5">{selectedAlert.evidence.confidenceLevel}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Captures Count</span>
                  <p className="text-white font-bold font-mono mt-0.5">{selectedAlert.evidence.supportingCapturesCount} Frames</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              {!selectedAlert.isAcknowledged ? (
                <button
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Acknowledge Alert
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Alert Acknowledged by Forest Officer
                </span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

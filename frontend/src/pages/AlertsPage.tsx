import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Filter,
  Check,
  CheckCircle,
  Bell,
  Search,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { getMovementAlerts, acknowledgeAlert } from '../services/alerts';
import type { MovementAlert, DeviationType } from '../types/alert';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ReserveMap } from '../components/map/ReserveMap';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<MovementAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<MovementAlert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await getMovementAlerts();
        setAlerts(data);
      } catch (err) {
        console.error('Failed to load movement alerts', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isAcknowledged: true, acknowledgedAt: new Date().toISOString() } : a))
    );
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert({
        ...selectedAlert,
        isAcknowledged: true,
        acknowledgedAt: new Date().toISOString(),
      });
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tigerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tigerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.stationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'ALL' || a.type === filterType;
    const matchesSeverity = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesStatus =
      filterStatus === 'ALL'
        ? true
        : filterStatus === 'UNACKNOWLEDGED'
        ? !a.isAcknowledged
        : a.isAcknowledged;

    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getAlertCategoryLabel = (type: DeviationType) => {
    switch (type) {
      case 'RANGE_SHIFT':
        return 'Range / Centroid Shift';
      case 'NEW_STATION':
        return 'New Station Detection';
      case 'BUFFER_VILLAGE_MOVEMENT':
        return 'Buffer / Village Movement';
      case 'PROLONGED_ABSENCE':
        return 'Prolonged Absence';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-heading tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-emerald-700" />
            Movement & Occupancy Deviation Alerts
          </h1>
          <p className="text-xs text-stone-600">
            Explainable spatial movement alerts provided by the backend, corrected for survey effort and baseline history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            {alerts.filter((a) => !a.isAcknowledged).length} Unacknowledged Alerts
          </span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 border border-slate-300/80 rounded-xl p-4 shadow-xs">
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Tiger ID, Name, or Station..."
            className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-stone-800 cursor-pointer"
            >
              <option value="ALL" className="bg-white">All Alert Categories</option>
              <option value="RANGE_SHIFT" className="bg-white">Range / Centroid Shift</option>
              <option value="NEW_STATION" className="bg-white">New Station</option>
              <option value="BUFFER_VILLAGE_MOVEMENT" className="bg-white">Buffer / Village Movement</option>
              <option value="PROLONGED_ABSENCE" className="bg-white">Prolonged Absence</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-stone-800 cursor-pointer"
            >
              <option value="ALL" className="bg-white">All Severities</option>
              <option value="CRITICAL" className="bg-white">Critical</option>
              <option value="WARNING" className="bg-white">Warning</option>
              <option value="INFO" className="bg-white">Info</option>
            </select>
          </div>

          {/* Acknowledge Status Filter */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-stone-800 cursor-pointer"
            >
              <option value="ALL" className="bg-white">All Statuses</option>
              <option value="UNACKNOWLEDGED" className="bg-white">Unacknowledged</option>
              <option value="ACKNOWLEDGED" className="bg-white">Acknowledged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Alert List / State Handling */}
      {loading ? (
        <LoadingSkeleton type="card" count={3} height="h-36" />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No movement alerts found."
          description="There are currently no active movement deviations matching your filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setFilterType('ALL');
            setFilterSeverity('ALL');
            setFilterStatus('ALL');
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              onClick={() => setSelectedAlert(alt)}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alt.severity === 'CRITICAL'
                  ? 'bg-rose-50/60 border-rose-200 hover:border-rose-400'
                  : alt.severity === 'WARNING'
                  ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                  : 'bg-white border-stone-200 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-start gap-4">
                <img
                  src={alt.tigerThumbnail}
                  alt={alt.tigerName}
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-100"
                />
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-700">{alt.tigerId}</span>
                    <span className="text-xs text-stone-700 font-semibold">• {alt.tigerName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                      {getAlertCategoryLabel(alt.type)}
                    </span>
                    <StatusBadge
                      label={alt.severity}
                      variant={alt.severity === 'CRITICAL' ? 'critical' : 'warning'}
                      size="sm"
                    />
                    {alt.isAcknowledged && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Acknowledged
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-stone-900 font-heading">{alt.title}</h3>
                  <p className="text-xs text-stone-600 max-w-2xl">{alt.evidence.whatChanged}</p>

                  <div className="flex items-center gap-4 text-[11px] text-stone-500 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" /> {alt.stationName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" /> {formatDateTime(alt.timestamp)}
                    </span>
                    <span>
                      Confidence: <strong className="text-emerald-700">{alt.evidence.confidenceLevel}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAlert(alt);
                  }}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  View Details & Evidence
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Alert Evidence Modal */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title="Alert Details & Automated Evidence Analysis"
        maxWidth="2xl"
      >
        {selectedAlert && (
          <div className="space-y-6 text-stone-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAlert.tigerThumbnail}
                  alt={selectedAlert.tigerName}
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200 bg-stone-100"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-700">{selectedAlert.tigerId}</span>
                    <h3 className="text-sm font-bold text-stone-900">{selectedAlert.tigerName}</h3>
                  </div>
                  <div className="text-xs text-stone-600 font-medium">{getAlertCategoryLabel(selectedAlert.type)}</div>
                  <div className="text-[10px] text-stone-400 font-mono">Detected: {formatDateTime(selectedAlert.timestamp)}</div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <StatusBadge
                  label={selectedAlert.severity}
                  variant={selectedAlert.severity === 'CRITICAL' ? 'critical' : 'warning'}
                />
                <span className="text-[10px] font-mono text-stone-500">{selectedAlert.id}</span>
              </div>
            </div>

            {/* Evidence Breakdown Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-stone-900 font-heading uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700" /> Automated Evidence Breakdown
              </h4>

              {/* What Changed Summary */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] text-emerald-800 font-bold uppercase">What Changed</span>
                <p className="text-stone-800 leading-relaxed font-medium">{selectedAlert.evidence.whatChanged}</p>
              </div>

              {/* Previous vs Current State Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Previous Baseline State</span>
                  <p className="text-stone-800 font-medium">{selectedAlert.evidence.previousState}</p>
                </div>
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Current Observed State</span>
                  <p className="text-stone-800 font-medium">{selectedAlert.evidence.currentState}</p>
                </div>
              </div>

              {/* Key Alert Metrics */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Survey Effort</span>
                  <p className="text-emerald-700 font-bold font-mono mt-0.5">{selectedAlert.evidence.surveyEffortStatus}</p>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Confidence Score</span>
                  <p className="text-emerald-800 font-bold font-mono mt-0.5">{selectedAlert.evidence.confidenceLevel}</p>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Supporting Frames</span>
                  <p className="text-stone-900 font-bold font-mono mt-0.5">{selectedAlert.evidence.supportingCapturesCount} Captures</p>
                </div>
              </div>
            </div>

            {/* Embedded Spatial Map Component */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-900 font-heading uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Alert Station Spatial Location
              </h4>
              <ReserveMap
                center={[selectedAlert.latitude, selectedAlert.longitude]}
                zoom={14}
                height="h-[220px]"
                showStations={true}
                showOccupancy={false}
                showMovementTrail={false}
              />
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <span className="text-xs text-stone-600">
                {selectedAlert.isAcknowledged ? (
                  <span className="text-emerald-800 font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-700" /> Acknowledged at {formatDateTime(selectedAlert.acknowledgedAt)}
                  </span>
                ) : (
                  'Unacknowledged Alert'
                )}
              </span>

              {!selectedAlert.isAcknowledged && (
                <button
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm shadow-emerald-600/30"
                >
                  <Check className="w-4 h-4" />
                  Acknowledge Alert
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

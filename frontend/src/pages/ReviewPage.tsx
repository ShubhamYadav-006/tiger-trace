import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  CheckCircle,
  PlusCircle,
  XCircle,
  Check,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Layers,
} from 'lucide-react';
import { getPendingReviews, submitReviewDecision } from '../services/review';
import type { ReviewItem, ReviewActionType } from '../types/review';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';

export const ReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStation, setFilterStation] = useState('ALL');

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingReviews();
      setReviews(data);
      if (data.length > 0) {
        setSelectedReview(data[0]);
        if (data[0].candidates.length > 0) {
          setSelectedCandidateId(data[0].candidates[0].tigerId);
        }
      } else {
        setSelectedReview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSelectReviewItem = (item: ReviewItem) => {
    setSelectedReview(item);
    if (item.candidates.length > 0) {
      setSelectedCandidateId(item.candidates[0].tigerId);
    } else {
      setSelectedCandidateId(null);
    }
  };

  const handleDecision = async (action: ReviewActionType, tigerIdOverride?: string) => {
    if (!selectedReview) return;
    setSubmitting(true);

    const targetTigerId =
      tigerIdOverride ||
      (action === 'CONFIRM_CANDIDATE'
        ? selectedReview.suggestedTigerId || selectedCandidateId
        : action === 'SELECT_OTHER_CANDIDATE'
        ? selectedCandidateId || undefined
        : undefined);

    try {
      await submitReviewDecision({
        reviewId: selectedReview.id,
        action,
        selectedTigerId: targetTigerId || undefined,
      });

      const messageMap: Record<ReviewActionType, string> = {
        CONFIRM_CANDIDATE: `Confirmed candidate ${targetTigerId} for capture ${selectedReview.id}`,
        SELECT_OTHER_CANDIDATE: `Assigned candidate ${targetTigerId} for capture ${selectedReview.id}`,
        CREATE_NEW_INDIVIDUAL: `Enrolled capture ${selectedReview.id} as a NEW individual tiger`,
        REJECT: `Rejected capture ${selectedReview.id} from tiger database`,
      };

      setFeedbackMessage(messageMap[action]);
      setTimeout(() => setFeedbackMessage(null), 4000);

      // Remove resolved item from local queue
      const updatedQueue = reviews.filter((r) => r.id !== selectedReview.id);
      setReviews(updatedQueue);

      if (updatedQueue.length > 0) {
        setSelectedReview(updatedQueue[0]);
        if (updatedQueue[0].candidates.length > 0) {
          setSelectedCandidateId(updatedQueue[0].candidates[0].tigerId);
        }
      } else {
        setSelectedReview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review decision');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.suggestedTigerId && r.suggestedTigerId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStation = filterStation === 'ALL' || r.stationName === filterStation;
    return matchesSearch && matchesStation;
  });

  const uniqueStations = Array.from(new Set(reviews.map((r) => r.stationName)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-heading tracking-tight">
            Human Review Queue & Re-ID Verification
          </h1>
          <p className="text-xs text-stone-600">
            Verify ambiguous tiger flank matches falling below the automatic decision confidence threshold (0.85).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReviews}
            className="p-2.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-400 text-stone-700 transition-colors cursor-pointer shadow-2xs"
            title="Refresh Review Queue"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            {reviews.length} Captures Awaiting Review
          </span>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700" />
            <span>{feedbackMessage}</span>
          </div>
          <span className="text-[10px] uppercase font-mono text-emerald-800 font-bold">Decision Saved</span>
        </div>
      )}

      {/* Main Content View State Handling */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5"><LoadingSkeleton type="table" count={3} /></div>
          <div className="lg:col-span-7"><LoadingSkeleton type="card" count={2} /></div>
        </div>
      ) : error ? (
        <ErrorBanner title="Failed to load review queue" message={error} onRetry={fetchReviews} />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="Review Queue Clear"
          description="All field camera-trap tiger captures have been auto-approved or verified by forest staff."
          actionLabel="Refresh Queue"
          onAction={fetchReviews}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Review Queue List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-slate-50/90 border border-slate-300/80 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, Station or Candidate..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {uniqueStations.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <select
                    value={filterStation}
                    onChange={(e) => setFilterStation(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Camera Stations</option>
                    {uniqueStations.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Review Items Queue List */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredReviews.length === 0 ? (
                <div className="p-6 bg-white border border-stone-200 rounded-xl text-center text-xs text-stone-500">
                  No items match query standard.
                </div>
              ) : (
                filteredReviews.map((item) => {
                  const isSelected = selectedReview?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectReviewItem(item)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-400'
                          : 'bg-white border-stone-200 hover:border-emerald-400 hover:bg-stone-50'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-700">{item.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Below Threshold
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-emerald-800">
                          {Math.round(item.aiConfidence * 100)}% AI Conf
                        </span>
                      </div>

                      {/* Content Preview */}
                      <div className="flex items-center gap-3">
                        <img
                          src={item.flankCropUrl || item.rawImageUrl}
                          alt="Crop Preview"
                          className="w-16 h-14 rounded-lg object-cover border border-stone-200 bg-stone-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <h4 className="text-xs font-bold text-stone-900 truncate">{item.stationName}</h4>
                          <div className="text-[11px] text-stone-600 truncate">
                            Suggested: <span className="text-emerald-800 font-semibold">{item.suggestedTigerId || 'None'}</span>
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {formatDateTime(item.timestamp)}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>

                      {/* Candidate ID Badges */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100 text-[10px]">
                        <span className="text-stone-500">Candidates:</span>
                        {item.candidates.map((cand) => (
                          <span
                            key={cand.tigerId}
                            className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700 font-mono"
                          >
                            {cand.tigerId} ({Math.round(cand.similarityScore * 100)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Review Workstation (7 cols) */}
          <div className="lg:col-span-7">
            {selectedReview ? (
              <div className="bg-slate-50/90 border border-slate-300/80 rounded-xl p-6 space-y-6 shadow-xs sticky top-20 text-stone-900">
                {/* Header & Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-700">{selectedReview.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        PENDING HUMAN AUDIT
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-stone-900 font-heading mt-1">{selectedReview.stationName}</h2>
                    <p className="text-xs text-stone-500 font-mono">Captured: {formatDateTime(selectedReview.timestamp)}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-emerald-700 font-mono">
                      {Math.round(selectedReview.aiConfidence * 100)}%
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium">Top Match Confidence Score</div>
                  </div>
                </div>

                {/* Large Source Image with Bounding Box Crop Overlay */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-700 font-semibold flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-700" /> Source Field Image & Isolated Flank Crop
                    </span>
                    <span className="text-stone-500 text-[11px] font-mono">Station ID: {selectedReview.stationId}</span>
                  </div>

                  <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
                    <img
                      src={selectedReview.rawImageUrl}
                      alt="Source Capture Frame"
                      className="w-full h-full object-cover"
                    />
                    {/* Bounding Box Crop Highlight */}
                    <div
                      className="absolute border-2 border-emerald-600 bg-emerald-500/20 rounded shadow-md pointer-events-none"
                      style={{
                        left: `${(selectedReview.bbox.x / 800) * 100}%`,
                        top: `${(selectedReview.bbox.y / 600) * 100}%`,
                        width: `${(selectedReview.bbox.width / 800) * 100}%`,
                        height: `${(selectedReview.bbox.height / 600) * 100}%`,
                      }}
                    >
                      <span className="absolute -top-6 left-0 bg-emerald-700 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow">
                        Flank Crop Region
                      </span>
                    </div>
                  </div>

                  {/* Isolated Flank Crop Image */}
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-4">
                    <img
                      src={selectedReview.flankCropUrl}
                      alt="Extracted Flank Crop"
                      className="w-24 h-18 rounded-lg object-cover border-2 border-emerald-600 shadow-xs bg-white"
                    />
                    <div className="text-xs text-stone-700 space-y-1">
                      <div className="font-bold text-stone-900">Extracted Stripe Feature Crop</div>
                      <div className="text-stone-600 text-[11px]">
                        Suggested Match: <strong className="text-emerald-700 font-mono">{selectedReview.suggestedTigerId || 'Unassigned'}</strong>
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        Coordinates: {selectedReview.latitude ? `${selectedReview.latitude}° N, ${selectedReview.longitude}° E` : 'EXIF GPS Active'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Reference Images & Confidence Scores */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-700" />
                      Candidate Match Database ({selectedReview.candidates.length})
                    </h3>
                    <span className="text-[11px] text-stone-500">Click card to select candidate</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedReview.candidates.map((cand) => {
                      const isSelected = selectedCandidateId === cand.tigerId;
                      return (
                        <div
                          key={cand.tigerId}
                          onClick={() => setSelectedCandidateId(cand.tigerId)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                            isSelected
                              ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-400'
                              : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                            <img
                              src={cand.referenceImageUrl}
                              alt={cand.tigerName}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-emerald-700 font-mono">{cand.tigerId}</div>
                              <div className="text-[11px] font-semibold text-stone-900 truncate">{cand.tigerName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-emerald-700 font-mono">
                                {Math.round(cand.similarityScore * 100)}%
                              </div>
                              <div className="text-[9px] text-stone-500 uppercase font-semibold">Similarity</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* API Contract Decision Actions Panel */}
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                    Submit Human Decision
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Action 1: CONFIRM_CANDIDATE */}
                    <button
                      onClick={() => handleDecision('CONFIRM_CANDIDATE')}
                      disabled={submitting}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm Candidate ({selectedCandidateId || selectedReview.suggestedTigerId})
                    </button>

                    {/* Action 2: SELECT_OTHER_CANDIDATE */}
                    <button
                      onClick={() => handleDecision('SELECT_OTHER_CANDIDATE')}
                      disabled={submitting || !selectedCandidateId}
                      className="py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                      Select Candidate ({selectedCandidateId || 'Choose Above'})
                    </button>

                    {/* Action 3: CREATE_NEW_INDIVIDUAL */}
                    <button
                      onClick={() => handleDecision('CREATE_NEW_INDIVIDUAL')}
                      disabled={submitting}
                      className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs border border-blue-300 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-600" />
                      Create New Individual
                    </button>

                    {/* Action 4: REJECT */}
                    <button
                      onClick={() => handleDecision('REJECT')}
                      disabled={submitting}
                      className="py-3 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-300 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Reject Detection
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 bg-white border border-stone-200 rounded-xl text-center text-xs text-stone-500">
                Select an item from the review queue list to view details and submit a decision.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

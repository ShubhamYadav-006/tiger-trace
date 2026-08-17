import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  CheckCircle,
  PlusCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { getPendingReviews, submitReviewDecision } from '../services/review';
import type { ReviewItem } from '../types/review';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await getPendingReviews();
        setReviews(data);
        if (data.length > 0 && data[0].candidates.length > 0) {
          setSelectedCandidateId(data[0].candidates[0].tigerId);
        }
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const currentReview = reviews[selectedIndex];

  const handleAction = async (action: 'CONFIRM' | 'SELECT' | 'CREATE_NEW') => {
    if (!currentReview) return;
    const targetTiger = action === 'CONFIRM' ? currentReview.suggestedTigerId : selectedCandidateId;

    await submitReviewDecision(currentReview.id, action, targetTiger || undefined);

    setActionSuccess(`Review completed: ${action === 'CREATE_NEW' ? 'Enrolled New Tiger' : `Assigned to ${targetTiger}`}`);
    setTimeout(() => setActionSuccess(null), 3000);

    // Remove from queue
    const updated = reviews.filter((_, i) => i !== selectedIndex);
    setReviews(updated);
    if (updated.length > 0) {
      const nextIdx = Math.min(selectedIndex, updated.length - 1);
      setSelectedIndex(nextIdx);
      if (updated[nextIdx].candidates.length > 0) {
        setSelectedCandidateId(updated[nextIdx].candidates[0].tigerId);
      }
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} height="h-64" />;
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No Ambiguous Identifications Pending"
        description="All camera trap tiger captures have been auto-assigned or human-reviewed. Excellent job!"
        icon={UserCheck}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
            Human Review Queue — Ambiguous Re-ID
          </h1>
          <p className="text-xs text-slate-400">
            Review tiger stripe pattern matches falling below automatic decision confidence (0.85).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {reviews.length} Captures Awaiting Review
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {actionSuccess}
        </div>
      )}

      {/* Review Workstation Split Grid */}
      {currentReview && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Target Capture Image & Flank Crop */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-amber-400 font-mono">{currentReview.id}</span>
                  <h3 className="text-sm font-bold text-white">{currentReview.stationName}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    AI Confidence: {Math.round(currentReview.aiConfidence * 100)}%
                  </span>
                  <div className="text-[10px] text-slate-400">Below 85% Auto Threshold</div>
                </div>
              </div>

              {/* Full Raw Image Display */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={currentReview.rawImageUrl}
                  alt="Camera Trap Target Capture"
                  className="w-full h-full object-cover"
                />
                {/* Flank Crop Bounding Box Highlight Overlay */}
                <div
                  className="absolute border-2 border-amber-400 bg-amber-400/20 rounded shadow-lg pointer-events-none"
                  style={{
                    left: `${(currentReview.bbox.x / 800) * 100}%`,
                    top: `${(currentReview.bbox.y / 600) * 100}%`,
                    width: `${(currentReview.bbox.width / 800) * 100}%`,
                    height: `${(currentReview.bbox.height / 600) * 100}%`,
                  }}
                >
                  <span className="absolute -top-6 left-0 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow">
                    Flank Region Crop
                  </span>
                </div>
              </div>

              {/* Crop & Metadata Footer */}
              <div className="flex items-center gap-4 pt-2">
                <img
                  src={currentReview.flankCropUrl}
                  alt="Flank Crop Preview"
                  className="w-20 h-16 rounded-lg object-cover border-2 border-amber-500/60 shadow-md"
                />
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Station: {currentReview.stationName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Timestamp: {new Date(currentReview.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Candidate Tigers & Decision Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white font-heading">
                    Ranked Similarity Candidates
                  </h3>
                  <span className="text-xs text-slate-400">Select best visual match</span>
                </div>

                {/* Candidate List */}
                <div className="space-y-3">
                  {currentReview.candidates.map((cand) => {
                    const isSelected = selectedCandidateId === cand.tigerId;
                    return (
                      <div
                        key={cand.tigerId}
                        onClick={() => setSelectedCandidateId(cand.tigerId)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-md'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={cand.referenceImageUrl}
                            alt={cand.tigerName}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-400">{cand.tigerId}</span>
                              <span className="text-xs font-semibold text-white">{cand.tigerName}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Last seen: {cand.lastSeenStation}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-extrabold text-amber-400 font-mono">
                            {Math.round(cand.similarityScore * 100)}%
                          </span>
                          <div className="text-[10px] text-slate-500">Stripe Match</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleAction('CONFIRM')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm Selected Match ({selectedCandidateId || currentReview.suggestedTigerId})
                </button>

                <button
                  onClick={() => handleAction('CREATE_NEW')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Reject Matches & Enroll New Tiger Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

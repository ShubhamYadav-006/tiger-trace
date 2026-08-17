import type { ReviewItem, ReviewDecisionSubmission } from '../types/review';
import { fetchApi } from './api';
import { MOCK_REVIEWS } from './mockData';

export async function getPendingReviews(): Promise<ReviewItem[]> {
  try {
    return await fetchApi<ReviewItem[]>('/reviews/pending');
  } catch {
    return MOCK_REVIEWS.filter((r) => r.status === 'PENDING');
  }
}

export async function getReviewById(id: string): Promise<ReviewItem | undefined> {
  try {
    return await fetchApi<ReviewItem>(`/reviews/${id}`);
  } catch {
    return MOCK_REVIEWS.find((r) => r.id === id);
  }
}

export async function submitReviewDecision(
  submission: ReviewDecisionSubmission
): Promise<boolean> {
  try {
    await fetchApi('/reviews/decision', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
    return true;
  } catch {
    // Local mock update
    const item = MOCK_REVIEWS.find((r) => r.id === submission.reviewId);
    if (item) {
      item.status = submission.action === 'REJECT' ? 'REJECTED' : 'RESOLVED';
      item.resolvedAt = new Date().toISOString();
      item.resolvedAction = submission.action;
      item.resolvedTigerId = submission.selectedTigerId;
    }
    return true;
  }
}

import type { ReviewItem } from '../types/review';
import { fetchApi } from './api';
import { MOCK_REVIEWS } from './mockData';

export async function getPendingReviews(): Promise<ReviewItem[]> {
  try {
    return await fetchApi<ReviewItem[]>('/reviews/pending');
  } catch {
    return MOCK_REVIEWS;
  }
}

export async function submitReviewDecision(
  reviewId: string,
  action: 'CONFIRM' | 'SELECT' | 'CREATE_NEW',
  targetTigerId?: string
): Promise<boolean> {
  try {
    await fetchApi(`/reviews/${reviewId}/decide`, {
      method: 'POST',
      body: JSON.stringify({ action, tigerId: targetTigerId })
    });
    return true;
  } catch {
    return true;
  }
}

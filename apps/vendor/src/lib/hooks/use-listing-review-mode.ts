'use client';

import { useGetPayoutSettingsQuery } from '@/redux/services/users/users.api-slice';

export type ListingReviewMode = 'review_first' | 'live_first';

/**
 * How a published listing reaches the shop (platform setting
 * `listing_review_mode`). review_first: hidden until Qlozet approves it.
 * live_first: visible at once while it waits for review. Falls back to
 * review first, the backend default, while loading.
 */
export const useListingReviewMode = (): ListingReviewMode => {
  const { data } = useGetPayoutSettingsQuery();
  return data?.data?.listing_review_mode === 'live_first'
    ? 'live_first'
    : 'review_first';
};

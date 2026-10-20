'use client';

import { useGetPlatformSettingsQuery } from '@/redux/services/settings/settings.api-slice';
import type { ListingReviewMode } from '@/redux/services/settings/settings.api-slice';

/**
 * How new listings reach the shop (platform setting `listing_review_mode`).
 * Falls back to review first, the backend default, while loading or when
 * this account cannot read settings.
 */
export const useListingReviewMode = (): ListingReviewMode => {
  const { data } = useGetPlatformSettingsQuery();
  return data?.data?.listing_review_mode === 'live_first'
    ? 'live_first'
    : 'review_first';
};

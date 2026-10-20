'use client';

// What a vendor is told about review depends on the platform's listing review
// mode, so every line about it lives here and reads the setting.

import { useListingReviewMode } from '@/lib/hooks/use-listing-review-mode';

/** Under the publish checklist: when a published listing reaches the shop. */
export const ReviewTimingNote = () => {
  const mode = useListingReviewMode();
  return mode === 'live_first'
    ? 'Published listings go live straight away, and Qlozet reviews them after.'
    : 'Published listings go live once Qlozet approves them.';
};

/** On a published listing that is waiting for review. */
export const PendingReviewNote = () => {
  const mode = useListingReviewMode();
  return (
    <p className="mt-2 text-xs text-amber-600">
      {mode === 'live_first'
        ? 'Live in the shop while Qlozet reviews it.'
        : 'Under review by Qlozet. It goes live once approved.'}
    </p>
  );
};

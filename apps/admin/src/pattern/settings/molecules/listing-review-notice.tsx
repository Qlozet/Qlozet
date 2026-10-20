'use client';

// Listing Review Notice - Molecule
// Shown on the Catalogue tab while review first is selected. Published
// listings still waiting for review are hidden from the shop in that mode,
// so the admin sees how many before saving a switch, and afterwards as a
// reminder of the backlog.

import { EyeOff } from 'lucide-react';
import { useGetListingReviewImpactQuery } from '@/redux/services/settings/settings.api-slice';

export const ListingReviewNotice = ({ mode }: { mode: string }) => {
  const { data } = useGetListingReviewImpactQuery();
  const count = data?.data?.published_awaiting_review ?? 0;
  if (mode !== 'review_first' || count === 0) return null;

  const listings = count === 1 ? 'listing is' : 'listings are';
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        <strong>
          {count.toLocaleString()} published {listings} waiting for review.
        </strong>{' '}
        With review first, they stay out of the shop until approved. Clear them
        from each vendor&apos;s catalogue with the Under review filter.
      </p>
    </div>
  );
};

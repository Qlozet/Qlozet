'use client';

// Reviews drawer.
//
// Opened from the "N reviews" button in the customer detail header, and it
// shows the same N: the reviews this customer WROTE, from
// GET /admin/customer/:id/reviews.
//
// Ratings are embedded in products rather than kept in a reviews collection, so
// a row is a rating plus the product it was left on. The customer is the
// reviewer on every row — the design's per-row name would just repeat the page
// heading — so the two lines carry the product and the vendor who sold it
// instead.

import { useMemo, useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { ArrowLeft, MessageSquare, Star } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { readApiError } from '@/redux/services/types';
import {
  useGetCustomerReviewsQuery,
  type CustomerReview,
  type CustomerReviewsSummary,
} from '@/redux/services/customers/customers.api-slice';

const PAGE_SIZE = 20;

/**
 * The five buckets, worst-value last, with the ramp the design uses: brown
 * darkest at the top, grey for the bottom bucket.
 */
const BUCKETS: {
  label: string;
  read: (summary: CustomerReviewsSummary) => number;
  bar: string;
}[] = [
  { label: 'Excellent', read: (s) => s.five_star, bar: 'bg-primary' },
  { label: 'Good', read: (s) => s.four_star, bar: 'bg-brown3' },
  { label: 'Average', read: (s) => s.three_star, bar: 'bg-brown2' },
  {
    label: 'Avg. Below',
    read: (s) => s.two_star,
    bar: 'bg-[hsla(14,8%,58%,1)]',
  },
  { label: 'Poor', read: (s) => s.one_star, bar: 'bg-[hsla(0,0%,42%,1)]' },
];

/** Two digits, like the design's "05" — the counts read as a column. */
const padCount = (value: number): string =>
  value < 10 ? `0${value}` : `${value}`;

/**
 * Five stars showing `value`, halves included.
 *
 * Rendered as a clipped overlay rather than rounding to whole stars: a 4.8 that
 * draws five solid stars is a different claim from the number beside it.
 */
const Stars = ({ value, className }: { value: number; className?: string }) => {
  const filled = Math.max(0, Math.min(5, value));

  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      role="img"
      aria-label={`${value} out of 5`}
    >
      <span className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="size-4 text-gray-200 dark:text-gray-700" />
        ))}
      </span>
      <span
        className="absolute inset-y-0 left-0 flex overflow-hidden"
        style={{ width: `${(filled / 5) * 100}%` }}
        aria-hidden="true"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="size-4 shrink-0 fill-warning text-warning" />
        ))}
      </span>
    </span>
  );
};

const RatingBars = ({ summary }: { summary: CustomerReviewsSummary }) => {
  // Share of all their reviews. Scaling to the tallest bucket instead would
  // make a lone 1-star review draw a full-width "Poor" bar.
  const total = summary.total_reviews || 1;

  return (
    <div className="space-y-4">
      {BUCKETS.map((bucket) => {
        const count = bucket.read(summary);
        return (
          <div key={bucket.label} className="flex items-center gap-4">
            <span className="w-20 shrink-0 text-sm font-medium text-grey-black dark:text-white">
              {bucket.label}
            </span>
            <span className="h-6 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-muted">
              <span
                className={cn('block h-full rounded-full', bucket.bar)}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </span>
            <span className="w-8 shrink-0 text-right text-sm text-grey-black dark:text-white">
              {padCount(count)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ReviewRow = ({ review }: { review: CustomerReview }) => (
  <article className="flex gap-4 border-b border-border py-5 last:border-b-0">
    <div className="size-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-muted">
      {review.product_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={review.product_image}
          alt={review.product_name ?? 'Product'}
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>

    <div className="min-w-0 flex-1">
      <Stars value={review.rating} />
      <p className="mt-1 truncate text-sm font-semibold text-grey-black dark:text-white">
        {review.product_name ?? 'Product no longer listed'}
      </p>
      {review.vendor_name && (
        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
          {review.vendor_name}
        </p>
      )}
      {/* Stars alone are a review — a rating with no comment shows none. */}
      {review.comment && (
        <p className="mt-2 text-sm text-grey-black dark:text-gray-300">
          {review.comment}
        </p>
      )}
    </div>
  </article>
);

const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
    <MessageSquare className="size-7 text-gray-300 dark:text-gray-600" />
    <p className="text-sm font-medium text-grey-black dark:text-white">
      {title}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

interface CustomerReviewsDrawerProps {
  customerId: string;
  /** Named in the empty state so the panel says who wrote nothing. */
  customerName?: string;
}

export const CustomerReviewsDrawer = create<CustomerReviewsDrawerProps>(
  ({ customerId, customerName }) => {
    const { visible, remove } = useModal();
    // Pages accumulate rather than replace: the reader is scrolling one list.
    const [size, setSize] = useState(PAGE_SIZE);

    const { data, isLoading, isFetching, isError, error } =
      useGetCustomerReviewsQuery(
        { customerId, page: 1, size },
        { skip: !customerId }
      );

    const page = data?.data;
    const reviews = useMemo(() => page?.reviews ?? [], [page]);
    const summary = page?.summary;
    const total = summary?.total_reviews ?? 0;
    const hasMore = reviews.length < total;
    const close = () => remove();

    return (
      <Sheet open={visible} onOpenChange={(next) => !next && close()}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <SheetHeader className="shrink-0 space-y-0 px-6 py-5 max-lg:px-4">
            <button
              type="button"
              onClick={close}
              aria-label="Back to customer"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-grey3 text-white transition-opacity hover:opacity-90"
            >
              <ArrowLeft className="size-4" />
            </button>
            <SheetTitle className="pt-4 text-left text-2xl font-bold">
              Reviews
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6 max-lg:px-4">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
              </div>
            ) : isError ? (
              <EmptyState
                title="Couldn't load reviews"
                message={readApiError(
                  error,
                  'Their reviews could not be loaded.'
                )}
              />
            ) : !total ? (
              <EmptyState
                title="No reviews yet"
                message={`${
                  customerName ?? 'This customer'
                } hasn't reviewed anything they've bought.`}
              />
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <Stars
                    value={summary?.average_rating ?? 0}
                    className="gap-1"
                  />
                  <span className="text-2xl font-bold text-grey-black dark:text-white">
                    {(summary?.average_rating ?? 0).toFixed(1)}
                  </span>
                </div>

                <p className="mt-3 text-sm text-grey-black dark:text-gray-300">
                  Overall rating of {total} {total === 1 ? 'review' : 'reviews'}
                </p>

                {summary && (
                  <div className="mt-6">
                    <RatingBars summary={summary} />
                  </div>
                )}

                <div className="mt-6 border-t border-border">
                  {reviews.map((review, i) => (
                    <ReviewRow
                      // A rating has no id of its own, and one customer can
                      // review the same product only once, so the product is
                      // the key — with the index as a guard for legacy rows.
                      key={`${review.product_id}-${i}`}
                      review={review}
                    />
                  ))}
                </div>

                {hasMore && (
                  <button
                    type="button"
                    disabled={isFetching}
                    onClick={() => setSize((current) => current + PAGE_SIZE)}
                    className="mt-4 w-full cursor-pointer rounded-xl border border-border py-3 text-sm font-medium text-grey-black transition-colors hover:bg-gray-50 disabled:cursor-default disabled:opacity-60 dark:text-white dark:hover:bg-muted/60"
                  >
                    {isFetching
                      ? 'Loading…'
                      : `Show more (${total - reviews.length} left)`}
                  </button>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);

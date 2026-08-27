'use client';

// The reviews panel, for whatever a review can be about.
//
// Ratings live embedded on products, so "the reviews a customer wrote", "the
// reviews a vendor received" and "the reviews left on one product" are the same
// rows with a different $match behind them — and the API returns all three in
// one shape: summary buckets, a page of rows, its pagination. This renders that
// shape; the wrappers supply the query and the wording.

import { useState, type ReactNode } from 'react';
import { useModal } from '@ebay/nice-modal-react';
import { MessageSquare, SlidersHorizontal, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { timeAgo } from '@/lib/orders';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { readApiError } from '@/redux/services/types';

export const REVIEWS_PAGE_SIZE = 20;

export interface ReviewsSummary {
  total_reviews: number;
  average_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

export interface ReviewRowData {
  rating: number;
  /** A rating may carry no comment — stars alone are a review. */
  comment?: string | null;
  /** Heading line: the reviewer for a product's reviews, the product for a customer's. */
  title?: string | null;
  /** Second line: the vendor, or the reviewer's email. */
  subtitle?: string | null;
  /** Ratings carry no timestamp; the API derives one from the ObjectId. */
  createdAt?: string | null;
  image?: string | null;
  key: string;
}

export type ReviewSort = 'recent' | 'highest' | 'lowest';

const SORT_LABELS: Record<ReviewSort, string> = {
  recent: 'Most recent',
  highest: 'Highest rated',
  lowest: 'Lowest rated',
};

/**
 * The five buckets, worst-value last, with the ramp the design uses: brown
 * darkest at the top, grey for the bottom bucket.
 */
const BUCKETS: {
  label: string;
  read: (summary: ReviewsSummary) => number;
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
export const Stars = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
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

const RatingBars = ({ summary }: { summary: ReviewsSummary }) => {
  // Share of all reviews. Scaling to the tallest bucket instead would make a
  // lone 1-star review draw a full-width "Poor" bar.
  const total = summary.total_reviews || 1;

  return (
    <div className="space-y-3">
      {BUCKETS.map((bucket) => {
        const count = bucket.read(summary);
        return (
          <div key={bucket.label} className="flex items-center gap-4">
            <span className="w-[86px] shrink-0 text-sm font-medium text-grey-black dark:text-white">
              {bucket.label}
            </span>
            <span className="h-5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-muted">
              <span
                className={cn('block h-full rounded-full', bucket.bar)}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </span>
            <span className="w-6 shrink-0 text-right text-sm text-grey-black dark:text-white">
              {padCount(count)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ReviewRow = ({ review }: { review: ReviewRowData }) => (
  <article className="border-b border-border py-4 last:border-b-0">
    <div className="flex items-start justify-between gap-3">
      <Stars value={review.rating} />
      {review.createdAt && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {timeAgo(review.createdAt)}
        </span>
      )}
    </div>

    <div className="mt-2 flex gap-3">
      {/* Only the customer's list carries a thumbnail — on a product's own
          reviews it would be the same picture on every row. */}
      {review.image !== undefined && (
        <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-muted">
          {review.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.image}
              alt={review.title ?? ''}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {review.title && (
          <p className="truncate text-sm font-semibold text-grey-black dark:text-white">
            {review.title}
          </p>
        )}
        {review.subtitle && (
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {review.subtitle}
          </p>
        )}
        {/* Stars alone are a review — a rating with no comment shows none. */}
        {review.comment && (
          <p className="mt-1 text-sm leading-relaxed text-grey-black dark:text-gray-300">
            {review.comment}
          </p>
        )}
      </div>
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

export interface ReviewsDrawerViewProps {
  summary?: ReviewsSummary;
  reviews: ReviewRowData[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error?: unknown;
  /** Current sort, and the setter behind the header's control. */
  sort: ReviewSort;
  onSortChange: (sort: ReviewSort) => void;
  /** Shown when the subject has no reviews at all. */
  emptyMessage: string;
  errorMessage: string;
  /** Ask the wrapper for another page. */
  onShowMore: () => void;
  header?: ReactNode;
}

/**
 * The panel itself. Pages accumulate rather than replace — the reader is
 * scrolling one list — so the wrapper grows its page size and passes the whole
 * list back down.
 */
export const ReviewsDrawerView = ({
  summary,
  reviews,
  isLoading,
  isFetching,
  isError,
  error,
  sort,
  onSortChange,
  emptyMessage,
  errorMessage,
  onShowMore,
  header,
}: ReviewsDrawerViewProps) => {
  const { visible, remove } = useModal();
  const total = summary?.total_reviews ?? 0;
  const hasMore = reviews.length < total;
  const close = () => remove();

  return (
    <Sheet open={visible} onOpenChange={(next) => !next && close()}>
      {/* `mobileBottomSheet={false}` is what pins this to the right edge. The
          default bottom-sheet mode adds `sm:left-auto sm:right-auto`, which
          cancels the `right-0` the side variant sets — the panel then falls
          back to its static position and opens flush against the LEFT edge on
          desktop. It also gets the proper slide-in-from-right animation. */}
      <SheetContent
        side="right"
        mobileBottomSheet={false}
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[385px]"
      >
        <SheetHeader className="shrink-0 space-y-0 px-6 pb-2 pt-4 max-lg:px-4">
          {/* Grab handle, as in the design — a panel that reads as draggable. */}
          <span
            aria-hidden="true"
            className="mx-auto h-1 w-10 shrink-0 rounded-full bg-gray-300 dark:bg-muted"
          />

          <div className="flex items-center justify-between gap-3 pt-4">
            <SheetTitle className="text-left text-2xl font-bold">
              Reviews
            </SheetTitle>

            {/* Sorting is server-side (the endpoint takes sortBy), so it
                reorders every review, not the page already loaded. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Sort reviews — ${SORT_LABELS[sort]}`}
                  className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent"
                >
                  <SlidersHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {(Object.keys(SORT_LABELS) as ReviewSort[]).map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => onSortChange(option)}
                    className={cn(option === sort && 'font-semibold')}
                  >
                    {SORT_LABELS[option]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
              message={readApiError(error, errorMessage)}
            />
          ) : !total ? (
            <EmptyState title="No reviews yet" message={emptyMessage} />
          ) : (
            <>
              {header}

              <div className="flex items-center gap-3">
                <Stars
                  value={summary?.average_rating ?? 0}
                  className="gap-0.5"
                />
                <span className="text-2xl font-bold text-grey-black dark:text-white">
                  {(summary?.average_rating ?? 0).toFixed(1)}
                </span>
              </div>

              <p className="mt-2 text-sm text-grey-black dark:text-gray-300">
                Overall rating of {total}{' '}
                {total === 1 ? "customer's review" : "customers' reviews"}
              </p>

              {summary && (
                <div className="mt-6">
                  <RatingBars summary={summary} />
                </div>
              )}

              <div className="mt-6 border-t border-border pt-1">
                {reviews.map((review) => (
                  <ReviewRow key={review.key} review={review} />
                ))}
              </div>

              {hasMore && (
                <button
                  type="button"
                  disabled={isFetching}
                  onClick={onShowMore}
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
};

/**
 * Grows the requested page size; pages accumulate into one scrolling list.
 * Changing the sort resets it — the accumulated pages were in the old order.
 */
export const useAccumulatingPage = () => {
  const [size, setSize] = useState(REVIEWS_PAGE_SIZE);
  const [sort, setSortState] = useState<ReviewSort>('recent');

  return {
    size,
    sort,
    showMore: () => setSize((current) => current + REVIEWS_PAGE_SIZE),
    setSort: (next: ReviewSort) => {
      setSortState(next);
      setSize(REVIEWS_PAGE_SIZE);
    },
  };
};

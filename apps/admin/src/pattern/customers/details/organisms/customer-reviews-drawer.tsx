'use client';

// Reviews drawer for a customer.
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
//
// The panel itself is shared with the product drawer; only the query and the
// wording differ.

import { useMemo } from 'react';
import { create } from '@ebay/nice-modal-react';
import {
  ReviewsDrawerView,
  useAccumulatingPage,
  type ReviewRowData,
} from '@/pattern/common/organisms/reviews-drawer';
import { useGetCustomerReviewsQuery } from '@/redux/services/customers/customers.api-slice';

interface CustomerReviewsDrawerProps {
  customerId: string;
  /** Named in the empty state so the panel says who wrote nothing. */
  customerName?: string;
}

export const CustomerReviewsDrawer = create<CustomerReviewsDrawerProps>(
  ({ customerId, customerName }) => {
    const { size, showMore } = useAccumulatingPage();

    const { data, isLoading, isFetching, isError, error } =
      useGetCustomerReviewsQuery(
        { customerId, page: 1, size },
        { skip: !customerId }
      );

    const page = data?.data;

    const reviews = useMemo<ReviewRowData[]>(
      () =>
        (page?.reviews ?? []).map((review, index) => ({
          rating: review.rating,
          comment: review.comment,
          title: review.product_name ?? 'Product no longer listed',
          subtitle: review.vendor_name,
          image: review.product_image ?? null,
          // A rating has no id of its own, and one customer can review the same
          // product only once, so the product is the key — with the index as a
          // guard for legacy rows.
          key: `${review.product_id}-${index}`,
        })),
      [page]
    );

    return (
      <ReviewsDrawerView
        summary={page?.summary}
        reviews={reviews}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        error={error}
        backLabel="Back to customer"
        emptyMessage={`${
          customerName ?? 'This customer'
        } hasn't reviewed anything they've bought.`}
        errorMessage="Their reviews could not be loaded."
        onShowMore={showMore}
      />
    );
  }
);

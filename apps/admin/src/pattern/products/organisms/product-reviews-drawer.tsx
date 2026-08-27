'use client';

// Reviews drawer for one product.
//
// Opened from the rating in the product detail header, and it shows the same
// number: the reviews left ON this product, from
// GET /admin/products/:id/reviews.
//
// The product is the same on every row, so — unlike the customer drawer, which
// leads with the product — the rows lead with the reviewer, and there is no
// thumbnail to repeat the gallery already on the page.

import { useMemo } from 'react';
import { create } from '@ebay/nice-modal-react';
import {
  ReviewsDrawerView,
  useAccumulatingPage,
  type ReviewRowData,
} from '@/pattern/common/organisms/reviews-drawer';
import { useGetAdminProductReviewsQuery } from '@/redux/services/products/admin-products.api-slice';

interface ProductReviewsDrawerProps {
  productId: string;
  /** Named in the empty state so the panel says what nobody reviewed. */
  productName?: string;
}

export const ProductReviewsDrawer = create<ProductReviewsDrawerProps>(
  ({ productId, productName }) => {
    const { size, showMore } = useAccumulatingPage();

    const { data, isLoading, isFetching, isError, error } =
      useGetAdminProductReviewsQuery(
        { productId, page: 1, size },
        { skip: !productId }
      );

    const page = data?.data;

    const reviews = useMemo<ReviewRowData[]>(
      () =>
        (page?.reviews ?? []).map((review, index) => ({
          rating: review.rating,
          comment: review.comment,
          title: review.reviewer?.name ?? 'A customer',
          subtitle: review.reviewer?.email,
          key: `${review.reviewer?._id ?? 'anon'}-${index}`,
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
        backLabel="Back to product"
        emptyMessage={`Nobody has reviewed ${
          productName ?? 'this product'
        } yet.`}
        errorMessage="The reviews could not be loaded."
        onShowMore={showMore}
      />
    );
  }
);

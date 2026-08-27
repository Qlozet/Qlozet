'use client';

import { create } from '@ebay/nice-modal-react';
import { EscalateModalView } from '@/pattern/common/organisms/escalate-modal';
import { useEscalateProductMutation } from '@/redux/services/products/admin-products.api-slice';

interface EscalateProductModalProps {
  productId: string;
  productName?: string;
}

/**
 * Raises a support ticket about one listing.
 *
 * A ticket belongs to a business, so the ticket is raised against the product's
 * vendor and the API names the listing in the description — whoever picks it up
 * needs to know which product it is about.
 */
export const EscalateProductModal = create<EscalateProductModalProps>(
  ({ productId, productName }) => {
    const [escalate, { isLoading }] = useEscalateProductMutation();

    return (
      <EscalateModalView
        isLoading={isLoading}
        subjectLine={`This raises a support ticket about ${
          productName ?? 'this product'
        } against its vendor, visible in the support queue.`}
        onSubmit={(values) => escalate({ productId, ...values }).unwrap()}
      />
    );
  }
);

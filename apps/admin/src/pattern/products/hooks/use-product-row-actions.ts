'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NiceModal from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { getProductName, getProductStatus } from '@/lib/products';
import { readApiError } from '@/redux/services/types';
import { ConfirmActionModal } from '@/pattern/common/organisms/confirm-action-modal';
import { ScheduleProductActivationModal } from '../organisms/schedule-product-activation-modal';
import type { ProductAction } from '../molecules/product-actions-cell';
import type { Product } from '@/redux/services/products/products.api-slice';
import { useDeleteProductMutation } from '@/redux/services/products/products.api-slice';
import {
  useApproveAdminProductMutation,
  useRejectAdminProductMutation,
  useUpdateAdminProductStatusMutation,
} from '@/redux/services/products/admin-products.api-slice';

/**
 * Every row action in the product tables, wired to its endpoint.
 *
 * The menu previously routed all eight items to the "Work in Progress" modal.
 * Each now maps onto a real call:
 *
 *   view / edit        → navigation
 *   activate           → PATCH /admin/products/{id}/status  { active }
 *   deactivate         → PATCH /admin/products/{id}/status  { archived }
 *   schedule           → PATCH /admin/products/{id}/schedule-activation
 *   approve / reject   → POST  /admin/products/{id}/approve | /reject
 *   delete             → DELETE /products/{id}
 *
 * The destructive four go through a confirmation first, and rejection collects
 * the reason the vendor is shown.
 */
export const useProductRowActions = () => {
  const router = useRouter();
  const [updateStatus] = useUpdateAdminProductStatusMutation();
  const [approve] = useApproveAdminProductMutation();
  const [reject] = useRejectAdminProductMutation();
  const [remove] = useDeleteProductMutation();

  return useCallback(
    (action: ProductAction, product: Product) => {
      const id = product?._id;
      const name = getProductName(product);

      if (!id) {
        toast.error('This product is missing an id — reload and try again.');
        return;
      }

      // Wraps a mutation so every action reports the same way: the server's own
      // message on failure, a named confirmation on success.
      const run = async (
        promise: Promise<unknown>,
        success: string,
        failure: string
      ) => {
        try {
          await promise;
          toast.success(success);
        } catch (error) {
          const message = readApiError(error, failure);
          toast.error(message);
          throw error; // keeps the confirm dialog open
        }
      };

      switch (action) {
        case 'view':
          router.push(`${APP_ROUTES.productDetails}?id=${id}`);
          return;

        case 'edit':
          router.push(`${APP_ROUTES.productsAdd}?id=${id}`);
          return;

        case 'schedule':
          NiceModal.show(ScheduleProductActivationModal, { product });
          return;

        case 'activate':
          void run(
            updateStatus({ id, status: 'active' }).unwrap(),
            `${name} is now active`,
            'Could not activate this product.'
          ).catch(() => {});
          return;

        case 'approve':
          void run(
            approve({ id }).unwrap(),
            `${name} approved`,
            'Could not approve this product.'
          ).catch(() => {});
          return;

        case 'deactivate':
          NiceModal.show(ConfirmActionModal, {
            title: 'Deactivate product?',
            description: `${name} will be archived and pulled from the storefront. The vendor can republish it.`,
            confirmLabel: 'Deactivate',
            destructive: true,
            reason: {
              label: 'Reason (optional)',
              placeholder: 'Shared with the vendor',
            },
            onConfirm: (reason?: string) =>
              run(
                updateStatus({ id, status: 'archived', reason }).unwrap(),
                `${name} deactivated`,
                'Could not deactivate this product.'
              ),
          });
          return;

        case 'reject':
          NiceModal.show(ConfirmActionModal, {
            title: 'Reject product?',
            description: `${name} will be flagged and taken out of the catalogue. Nothing is deleted — the vendor can fix it and resubmit.`,
            confirmLabel: 'Reject product',
            destructive: true,
            reason: {
              label: 'Reason for rejection',
              placeholder: 'e.g. images do not match the description',
              required: true,
            },
            onConfirm: (reason?: string) =>
              run(
                reject({ id, reason: reason ?? '' }).unwrap(),
                `${name} rejected`,
                'Could not reject this product.'
              ),
          });
          return;

        case 'delete':
          NiceModal.show(ConfirmActionModal, {
            title: 'Delete product?',
            description: `${name} will be permanently removed. This cannot be undone — deactivate instead if you only want it off the storefront.`,
            confirmLabel: 'Delete',
            destructive: true,
            onConfirm: () =>
              run(
                remove(id).unwrap(),
                `${name} deleted`,
                'Could not delete this product.'
              ),
          });
          return;

        default: {
          // Exhaustiveness guard: a new ProductAction must be handled here.
          const unhandled: never = action;
          toast.error(`Unsupported action: ${String(unhandled)}`);
        }
      }
    },
    [router, updateStatus, approve, reject, remove]
  );
};

/** Re-exported so tables can grey out actions that make no sense for a row. */
export { getProductStatus };

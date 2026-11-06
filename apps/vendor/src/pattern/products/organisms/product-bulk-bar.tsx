'use client';

// Shown above a products table while selecting. Acts on every ticked product
// at once, across pages. The backend applies the action to the ones that
// qualify and names the rest (e.g. a draft with no price cannot go live).

import { show } from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DeleteProductConfirmationModal } from '@/pattern/common/organisms/delete-confirmation-modal';
import {
  BulkProductAction,
  useBulkProductActionMutation,
} from '@/redux/services/products/products.api-slice';
import { readApiError } from '@/redux/services/types';

interface ProductBulkBarProps {
  selectedIds: string[];
  /** Clears the ticks after a successful action. */
  onDone: () => void;
  onCancel: () => void;
}

const plural = (n: number) => `${n} ${n === 1 ? 'product' : 'products'}`;

export function ProductBulkBar({
  selectedIds,
  onDone,
  onCancel,
}: ProductBulkBarProps) {
  const [runBulk, { isLoading }] = useBulkProductActionMutation();
  const count = selectedIds.length;

  const run = async (action: BulkProductAction) => {
    try {
      const res = await runBulk({ product_ids: selectedIds, action }).unwrap();
      const skipped = res?.data?.skipped ?? [];
      const applied = res?.data?.apply?.length ?? 0;
      if (applied > 0) toast.success(res?.message ?? 'Done');
      if (skipped.length > 0) {
        // Name the first few so the vendor knows what to fix.
        const lines = skipped
          .slice(0, 3)
          .map((s) => `${s.name}: ${s.reason}`)
          .join('\n');
        const more =
          skipped.length > 3 ? `\n…and ${skipped.length - 3} more` : '';
        toast.warning(`${plural(skipped.length)} skipped`, {
          description: lines + more,
          duration: 10000,
        });
      }
      onDone();
    } catch (error) {
      toast.error(readApiError(error, 'Could not update those products'));
    }
  };

  const confirmDelete = () => {
    show(DeleteProductConfirmationModal, {
      title: `Delete ${plural(count)}?`,
      description:
        'They come off sale and out of your products list. Past orders keep their details. This cannot be undone here.',
      actionText: `Delete ${plural(count)}`,
    }).then(() => run('delete'));
  };

  return (
    <div
      role="region"
      aria-label="Selected products"
      className="flex flex-wrap items-center gap-2 border-b px-4 py-3 bg-muted/40"
    >
      <span className="text-sm font-medium mr-auto">
        {count === 0 ? 'Tick the products to change' : `${count} selected`}
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={count === 0 || isLoading}
        onClick={() => run('activate')}
      >
        Activate
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={count === 0 || isLoading}
        onClick={() => run('archive')}
      >
        Archive
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 hover:text-red-600"
        disabled={count === 0 || isLoading}
        onClick={confirmDelete}
      >
        Delete
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel} disabled={isLoading}>
        Cancel
      </Button>
    </div>
  );
}

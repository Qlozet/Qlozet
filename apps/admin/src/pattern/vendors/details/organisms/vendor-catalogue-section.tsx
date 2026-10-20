'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import NiceModal from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import { Check, EyeOff, X } from 'lucide-react';
import { ConfirmActionModal } from '@/pattern/common/organisms/confirm-action-modal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { readApiError } from '@/redux/services/types';
import {
  useApproveAdminProductMutation,
  useGetAdminProductsQuery,
  useRejectAdminProductMutation,
  type AdminProductsParams,
} from '@/redux/services/products/admin-products.api-slice';
import type { Product } from '@/redux/services/products/products.api-slice';
import { useListingReviewMode } from '@/lib/hooks/use-listing-review-mode';
import {
  formatProductPrice,
  getProductImage,
  getProductModeration,
  getProductName,
  getProductStatus,
  getStorefrontVisibility,
} from '@/lib/products';

// Divisible by every column count the grid takes (3, 4, 6, 8), so no page
// ends in a ragged row.
const PAGE_SIZE = 24;

const STATUS_VARIANT: Record<
  string,
  'success' | 'warning' | 'error' | 'blue' | 'secondary'
> = {
  active: 'success',
  draft: 'warning',
  scheduled: 'blue',
  rejected: 'error',
  inactive: 'secondary',
  archived: 'secondary',
};

/**
 * The states an admin actually sorts a catalogue by. Each is a server-side
 * filter, so the counts and pages are true for the whole catalogue, not just
 * the page in view. "Live" is what a shopper can buy: published by the vendor
 * and approved by us. "Under review" is published but not yet approved.
 */
const FILTERS: { key: string; label: string; params: AdminProductsParams }[] = [
  { key: 'all', label: 'All', params: {} },
  {
    key: 'live',
    label: 'Live',
    params: { status: 'active', moderation_status: 'approved' },
  },
  {
    key: 'review',
    label: 'Under review',
    params: { status: 'active', moderation_status: 'pending' },
  },
  { key: 'draft', label: 'Drafts', params: { status: 'draft' } },
  { key: 'scheduled', label: 'Scheduled', params: { status: 'scheduled' } },
  {
    key: 'rejected',
    label: 'Rejected',
    params: { moderation_status: 'rejected' },
  },
  { key: 'archived', label: 'Archived', params: { status: 'archived' } },
];

const KINDS: { key: string; label: string }[] = [
  { key: '', label: 'All kinds' },
  { key: 'clothing', label: 'Clothing' },
  { key: 'fabric', label: 'Fabric' },
  { key: 'accessory', label: 'Accessories' },
];

const Chip = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors',
      active
        ? 'bg-primary text-primary-foreground'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-muted dark:text-gray-300 dark:hover:bg-muted/70'
    )}
  >
    {children}
  </button>
);

/**
 * The vendor's catalogue, as the admin needs to see it when deciding whether to
 * approve them, or when a complaint names a listing.
 *
 * Deliberately NOT "top products": that table ranks by order volume, so a
 * vendor awaiting approval — who by definition has never sold anything — shows
 * an empty table. This reads /admin/products, which returns every status from
 * every vendor and is not subject to the approval gate, so drafts and
 * unpublished listings show too. Those are usually all a new vendor has.
 *
 * A grid of small cards rather than a table because the question being
 * answered is "do these photos look professional", which a row of text cannot
 * answer; small, because the answer comes from the set, not from one photo,
 * and a click opens the full product.
 */
export const VendorCatalogueSection = ({
  businessId,
}: {
  businessId: string;
}) => {
  const router = useRouter();
  const reviewMode = useListingReviewMode();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [kind, setKind] = useState('');

  const filterParams = useMemo(
    () => FILTERS.find((f) => f.key === filter)?.params ?? {},
    [filter]
  );

  const { data, isLoading, isFetching, isError, error } =
    useGetAdminProductsQuery({
      business_id: businessId,
      page,
      size: PAGE_SIZE,
      ...filterParams,
      ...(kind ? { kind } : {}),
    });

  const products = useMemo(() => data?.data?.data ?? [], [data]);
  const totalItems = data?.data?.total_items ?? products.length;
  const totalPages = data?.data?.total_pages ?? 1;
  const filtering = filter !== 'all' || kind !== '';

  const pick = (nextFilter: string, nextKind: string) => {
    setFilter(nextFilter);
    setKind(nextKind);
    setPage(1);
  };

  const open = (id: string) =>
    router.push(`${APP_ROUTES.productDetails}?id=${id}`);

  // Moderation from the card, so a new vendor's catalogue can be cleared in
  // one pass instead of one product page at a time. Same calls, and the same
  // required reason for a rejection, as the product page.
  const [approveProduct] = useApproveAdminProductMutation();
  const [rejectProduct] = useRejectAdminProductMutation();
  const [busyId, setBusyId] = useState<string | null>(null);

  const approve = async (product: Product) => {
    setBusyId(product._id);
    try {
      await approveProduct({ id: product._id }).unwrap();
      toast.success(`${getProductName(product)} approved`);
    } catch (err) {
      toast.error(readApiError(err, 'Could not approve this product.'));
    } finally {
      setBusyId(null);
    }
  };

  const reject = (product: Product) =>
    NiceModal.show(ConfirmActionModal, {
      title: `Reject ${getProductName(product)}?`,
      description:
        'The listing stays with the vendor but is hidden from shoppers, and the vendor is told why. Nothing is deleted.',
      confirmLabel: 'Reject listing',
      destructive: true,
      reason: {
        label: 'What should the vendor fix?',
        placeholder: 'e.g. photos are blurred; show the garment on a model',
        required: true,
      },
      onConfirm: async (reason?: string) => {
        try {
          await rejectProduct({
            id: product._id,
            reason: reason ?? '',
          }).unwrap();
          toast.success(`${getProductName(product)} rejected`);
        } catch (err) {
          toast.error(readApiError(err, 'Could not reject this product.'));
          throw err; // keeps the dialog open
        }
      },
    });

  const pending = products.filter((p) => getProductModeration(p) === 'pending');

  const approveAll = () =>
    NiceModal.show(ConfirmActionModal, {
      title: `Approve ${pending.length} ${pending.length === 1 ? 'listing' : 'listings'}?`,
      description:
        'Every listing waiting for review on this page goes live in the shop. Open any you have not looked at first.',
      confirmLabel: 'Approve all',
      onConfirm: async () => {
        let done = 0;
        for (const product of pending) {
          try {
            await approveProduct({ id: product._id }).unwrap();
            done += 1;
          } catch {
            /* counted below */
          }
        }
        if (done === pending.length) toast.success(`${done} approved`);
        else
          toast.error(
            `${done} of ${pending.length} approved; the rest failed. Try them one by one.`
          );
      },
    });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white dark:bg-card custom-card-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Catalogue
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Every listing this vendor has created, including drafts. Click one
            to open it, or approve and reject the ones waiting for review.
          </p>
        </div>
        {totalItems > 0 && (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'product' : 'products'}
            {filtering ? ' match' : ''}
          </span>
        )}
      </div>

      {/* Filters: state on the left, kind on the right. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              active={filter === f.key}
              onClick={() => pick(f.key, kind)}
            >
              {f.label}
            </Chip>
          ))}
        </div>
        <div className="inline-flex items-center rounded-full bg-gray-100 p-0.5 text-xs font-medium dark:bg-muted">
          {KINDS.map((k) => (
            <button
              key={k.key || 'all'}
              type="button"
              aria-pressed={kind === k.key}
              onClick={() => pick(filter, k.key)}
              className={cn(
                'cursor-pointer rounded-full px-2.5 py-1 transition-colors',
                kind === k.key
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-card dark:text-white'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {filter === 'review' && pending.length > 1 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-50 px-4 py-2.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <span>
              {pending.length} listings on this page are waiting for review.
            </span>
            <Button size="sm" onClick={approveAll} className="h-8 gap-1.5">
              <Check className="size-3.5" />
              Approve all on this page
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-2.5 w-1/2 rounded" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-destructive">
              Could not load the catalogue
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {readApiError(error)}
            </p>
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {filtering ? 'Nothing matches' : 'Nothing listed yet'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtering
                ? 'No listing is in that state. Try another filter.'
                : 'This vendor has not created any products — there is nothing to review here yet.'}
            </p>
            {filtering && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => pick('all', '')}
              >
                Show everything
              </Button>
            )}
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div
            className={cn(
              'grid grid-cols-3 gap-3 transition-opacity sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8',
              isFetching && 'opacity-60'
            )}
          >
            {products.map((product) => {
              const image = getProductImage(product);
              const status = getProductStatus(product);
              // Published but not yet approved: looks live to the vendor,
              // invisible to shoppers. Worth a mark, since that is the
              // state an admin is usually here to clear.
              const hidden =
                status.key === 'active' &&
                !getStorefrontVisibility(product, reviewMode).visible;
              const name = getProductName(product);
              const moderation = getProductModeration(product);
              return (
                <div key={product._id} className="flex min-w-0 flex-col">
                  <button
                    type="button"
                    onClick={() => open(product._id)}
                    title={`Open ${name}`}
                    className="group rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {/* 3:4, the ratio the shop's PDP and cards crop to — so the
                      admin judges the same framing a customer will see. */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-border bg-muted">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={name}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center px-2 text-center text-[11px] text-muted-foreground">
                          No image
                        </div>
                      )}
                      <Badge
                        variant={STATUS_VARIANT[status.key] ?? 'secondary'}
                        shape="square"
                        className="absolute left-1.5 top-1.5 h-5 px-1.5 text-[10px] font-medium"
                      >
                        {status.label}
                      </Badge>
                      {hidden && (
                        <span
                          title="Published by the vendor but not visible to shoppers until it is approved."
                          className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white"
                        >
                          <EyeOff className="size-3" />
                          Not in shop
                        </span>
                      )}
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-primary/90 py-1 text-center text-[11px] font-medium text-primary-foreground transition-transform group-hover:translate-y-0 group-focus-visible:translate-y-0">
                        View
                      </span>
                    </div>

                    <p className="mt-1.5 truncate text-xs font-medium text-gray-900 dark:text-white">
                      {name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {formatProductPrice(product)}
                      {product.kind ? ` · ${product.kind}` : ''}
                    </p>
                  </button>
                  {moderation === 'pending' && (
                    <div className="mt-1.5 grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => approve(product)}
                        disabled={busyId === product._id}
                        aria-label={`Approve ${name}`}
                        title="Approve"
                        className="inline-flex h-7 cursor-pointer items-center justify-center gap-1 rounded-md bg-emerald-50 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                      >
                        <Check className="size-3.5" />
                        <span className="hidden xl:inline">Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => reject(product)}
                        disabled={busyId === product._id}
                        aria-label={`Reject ${name}`}
                        title="Reject"
                        className="inline-flex h-7 cursor-pointer items-center justify-center gap-1 rounded-md bg-red-50 text-[11px] font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/50"
                      >
                        <X className="size-3.5" />
                        <span className="hidden xl:inline">Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

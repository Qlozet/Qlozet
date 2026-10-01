'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/routes';
import { readApiError } from '@/redux/services/types';
import { useGetAdminProductsQuery } from '@/redux/services/products/admin-products.api-slice';
import {
  formatProductPrice,
  getProductImage,
  getProductName,
  getProductStatus,
} from '@/lib/products';

const PAGE_SIZE = 12;

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
 * The vendor's catalogue, as the admin needs to see it when deciding whether to
 * approve them.
 *
 * Deliberately NOT "top products": that table ranks by order volume, so a
 * vendor awaiting approval — who by definition has never sold anything — shows
 * an empty table. This reads /admin/products, which returns every status from
 * every vendor and is not subject to the approval gate, so drafts and
 * unpublished listings show too. Those are usually all a new vendor has.
 *
 * A grid rather than a table because the question being answered is "do these
 * photos look professional", which a row of text cannot answer.
 */
export const VendorCatalogueSection = ({
  businessId,
}: {
  businessId: string;
}) => {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, error } =
    useGetAdminProductsQuery({
      business_id: businessId,
      page,
      size: PAGE_SIZE,
    });

  const products = useMemo(() => data?.data?.data ?? [], [data]);
  const totalItems = data?.data?.total_items ?? products.length;
  const totalPages = data?.data?.total_pages ?? 1;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white dark:bg-card custom-card-shadow">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Catalogue
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Every listing this vendor has created, including drafts.
          </p>
        </div>
        {totalItems > 0 && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'product' : 'products'}
          </span>
        )}
      </div>

      <div className="p-6">
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
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
              Nothing listed yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This vendor has not created any products — there is nothing to
              review here yet.
            </p>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div
            className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 lg:grid-cols-4 ${
              isFetching ? 'opacity-60' : ''
            }`}
          >
            {products.map((product) => {
              const image = getProductImage(product);
              const status = getProductStatus(product);
              return (
                <button
                  key={product._id}
                  type="button"
                  onClick={() =>
                    router.push(`${APP_ROUTES.products}/${product._id}`)
                  }
                  className="group text-left"
                >
                  {/* 3:4, the ratio the shop's PDP and cards crop to — so the
                      admin judges the same framing a customer will see. */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-border bg-muted">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={getProductName(product)}
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center px-3 text-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                    <Badge
                      variant={STATUS_VARIANT[status.key] ?? 'secondary'}
                      shape="square"
                      className="absolute left-2 top-2 h-[22px] px-2 text-[11px] font-medium"
                    >
                      {status.label}
                    </Badge>
                  </div>

                  <p className="mt-2 truncate text-sm font-medium text-gray-900 dark:text-white">
                    {getProductName(product)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatProductPrice(product)}
                    {product.kind ? ` · ${product.kind}` : ''}
                  </p>
                </button>
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

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type {
  AdminProductFilterOptions,
  ProductModerationStatus,
  ProductStatus,
} from '@/redux/services/products/admin-products.api-slice';

export interface ProductFilters {
  status?: ProductStatus;
  moderation_status?: ProductModerationStatus;
  product_type?: string;
  category?: string;
  audience?: string;
  tag?: string;
  business_id?: string;
  minPrice?: string;
  maxPrice?: string;
  in_stock?: boolean;
  on_sale?: boolean;
}

export const EMPTY_PRODUCT_FILTERS: ProductFilters = {};

const STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  scheduled: 'Scheduled',
  archived: 'Archived',
};

const MODERATION_LABELS: Record<ProductModerationStatus, string> = {
  pending: 'Awaiting review',
  approved: 'Approved',
  rejected: 'Rejected',
};

/** Filters the user has actually set — drives the badge and the Clear button. */
export const countActiveFilters = (filters: ProductFilters): number =>
  Object.values(filters).filter(
    (value) => value !== undefined && value !== '' && value !== false
  ).length;

interface ProductFiltersControlProps {
  value: ProductFilters;
  onChange: (value: ProductFilters) => void;
  /** Values present in the catalogue, from GET /admin/products/filters. */
  options?: AdminProductFilterOptions;
  isLoading?: boolean;
  className?: string;
}

const Field = ({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label
      htmlFor={htmlFor}
      className="text-xs font-medium text-grey3 dark:text-gray-400"
    >
      {label}
    </label>
    {children}
  </div>
);

const selectClass =
  'h-10 w-full rounded-lg border border-border bg-transparent px-3 text-sm text-foreground outline-none focus:border-primary';

/**
 * "Filter By" popover for the product catalogue tables.
 *
 * Every option comes from GET /admin/products/filters, which reads the values
 * out of the catalogue itself — so the menu can never offer a product type or
 * category that would return an empty table. The draft is only committed on
 * Apply, so a half-built filter doesn't fire a request per keystroke.
 */
export const ProductFiltersControl = ({
  value,
  onChange,
  options,
  isLoading = false,
  className,
}: ProductFiltersControlProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProductFilters>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const activeCount = useMemo(() => countActiveFilters(value), [value]);
  const active = activeCount > 0;

  const invalidPrice = Boolean(
    draft.minPrice &&
    draft.maxPrice &&
    Number(draft.minPrice) > Number(draft.maxPrice)
  );

  const set = <K extends keyof ProductFilters>(
    key: K,
    next: ProductFilters[K]
  ) =>
    setDraft((prev) => ({
      ...prev,
      // An empty select or input means "no filter", not "match the empty value".
      [key]: next === '' || next === false ? undefined : next,
    }));

  const apply = () => {
    if (invalidPrice) return;
    onChange(draft);
    setOpen(false);
  };

  const clear = () => {
    onChange(EMPTY_PRODUCT_FILTERS);
    setDraft(EMPTY_PRODUCT_FILTERS);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative shrink-0', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Filter products"
        className={cn(
          'h-10 w-10 shrink-0 gap-2 px-0 text-sm text-gray-600 dark:text-gray-400 sm:w-auto sm:px-4',
          active && 'border-primary text-grey-black dark:text-white'
        )}
      >
        <span className="relative flex items-center sm:hidden">
          <SlidersHorizontal className="size-4" />
          {active && (
            <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-primary" />
          )}
        </span>

        <span className="hidden items-center gap-2 sm:flex">
          Filter By :
          {active && (
            <>
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
                {activeCount}
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear filters"
                onClick={(event) => {
                  event.stopPropagation();
                  clear();
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    clear();
                  }
                }}
                className="flex size-4 items-center justify-center rounded-full text-grey3 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-muted/80"
              >
                <X className="size-3" />
              </span>
            </>
          )}
        </span>
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Filter products"
          className="absolute left-0 z-50 mt-2 max-h-[70vh] w-80 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-xl border border-border bg-white p-4 shadow-xl dark:bg-card sm:left-auto sm:right-0"
        >
          <div className="space-y-3">
            <Field label="Status" htmlFor="filter-status">
              <select
                id="filter-status"
                className={selectClass}
                value={draft.status ?? ''}
                onChange={(e) =>
                  set('status', (e.target.value || undefined) as ProductStatus)
                }
              >
                <option value="">Any status</option>
                {(options?.statuses ?? []).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status] ?? status}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Review state" htmlFor="filter-moderation">
              <select
                id="filter-moderation"
                className={selectClass}
                value={draft.moderation_status ?? ''}
                onChange={(e) =>
                  set(
                    'moderation_status',
                    (e.target.value || undefined) as ProductModerationStatus
                  )
                }
              >
                <option value="">Any review state</option>
                {(options?.moderation_statuses ?? []).map((state) => (
                  <option key={state} value={state}>
                    {MODERATION_LABELS[state] ?? state}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Product type" htmlFor="filter-product-type">
              <select
                id="filter-product-type"
                className={selectClass}
                value={draft.product_type ?? ''}
                onChange={(e) => set('product_type', e.target.value)}
              >
                <option value="">Any type</option>
                {(options?.product_types ?? []).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Category" htmlFor="filter-category">
              <select
                id="filter-category"
                className={selectClass}
                value={draft.category ?? ''}
                onChange={(e) => set('category', e.target.value)}
              >
                <option value="">Any category</option>
                {(options?.categories ?? []).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Audience" htmlFor="filter-audience">
              <select
                id="filter-audience"
                className={selectClass}
                value={draft.audience ?? ''}
                onChange={(e) => set('audience', e.target.value)}
              >
                <option value="">Any audience</option>
                {(options?.audiences ?? []).map((audience) => (
                  <option
                    key={audience}
                    value={audience}
                    className="capitalize"
                  >
                    {audience}
                  </option>
                ))}
              </select>
            </Field>

            {Boolean(options?.tags?.length) && (
              <Field label="Tag" htmlFor="filter-tag">
                <select
                  id="filter-tag"
                  className={selectClass}
                  value={draft.tag ?? ''}
                  onChange={(e) => set('tag', e.target.value)}
                >
                  <option value="">Any tag</option>
                  {(options?.tags ?? []).map((tag) => (
                    <option key={tag.slug} value={tag.slug}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {Boolean(options?.vendors?.length) && (
              <Field label="Vendor" htmlFor="filter-vendor">
                <select
                  id="filter-vendor"
                  className={selectClass}
                  value={draft.business_id ?? ''}
                  onChange={(e) => set('business_id', e.target.value)}
                >
                  <option value="">Any vendor</option>
                  {(options?.vendors ?? []).map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} ({vendor.count})
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Field label="Min price" htmlFor="filter-min-price">
                <Input
                  id="filter-min-price"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  value={draft.minPrice ?? ''}
                  onChange={(e) => set('minPrice', e.target.value)}
                />
              </Field>
              <Field label="Max price" htmlFor="filter-max-price">
                <Input
                  id="filter-max-price"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Any"
                  value={draft.maxPrice ?? ''}
                  onChange={(e) => set('maxPrice', e.target.value)}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={Boolean(draft.in_stock)}
                  onChange={(e) => set('in_stock', e.target.checked)}
                />
                In stock only
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={Boolean(draft.on_sale)}
                  onChange={(e) => set('on_sale', e.target.checked)}
                />
                On sale only
              </label>
            </div>

            {invalidPrice && (
              <p className="text-xs text-error">
                The maximum price can&apos;t be below the minimum.
              </p>
            )}

            {isLoading && (
              <p className="text-xs text-grey3 dark:text-gray-400">
                Loading filter options…
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={clear}>
                Clear
              </Button>
              <Button type="button" onClick={apply} disabled={invalidPrice}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

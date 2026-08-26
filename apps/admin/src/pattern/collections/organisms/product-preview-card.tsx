'use client';

import { useMemo, useState } from 'react';
import { X, Plus, Search, Undo2, ChevronDown } from 'lucide-react';
import type { useProductConditions } from '../hooks/use-product-conditions';

type ConditionState = ReturnType<typeof useProductConditions>;

const cardCls =
  'rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900';

function productName(p: any): string {
  return (
    p?.clothing?.name ??
    p?.accessory?.name ??
    p?.fabric?.name ??
    p?.name ??
    'Product'
  );
}
function productPrice(p: any): number {
  const d = Number(p?.discounted_price) || 0;
  return d > 0 ? d : Number(p?.base_price) || 0;
}
function productImage(p: any): string | undefined {
  return (
    p?.clothing?.color_variants?.[0]?.variants?.[0]?.images?.[0] ??
    p?.clothing?.color_variants?.[0]?.images?.[0] ??
    p?.accessory?.images?.[0] ??
    p?.fabric?.images?.[0] ??
    (typeof p?.images?.[0] === 'string' ? p.images[0] : p?.images?.[0]?.url)
  );
}

function Row({
  p,
  right,
  badge,
}: {
  p: any;
  right: React.ReactNode;
  badge?: string;
}) {
  const img = productImage(p);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-2 dark:border-gray-800">
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
          {productName(p)}
        </p>
        <p className="text-xs text-gray-500">
          ₦{productPrice(p).toLocaleString()}
        </p>
      </div>
      {badge && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {badge}
        </span>
      )}
      {right}
    </div>
  );
}

export function ProductPreviewCard({
  conditionState,
}: {
  conditionState: ConditionState;
}) {
  const {
    allRawProducts,
    matchingProducts,
    manualIncludes,
    manualExcludes,
    handleExclude,
    handleInclude,
    handleUndoExclude,
    handleRemoveInclude,
    isLoading,
  } = conditionState;

  const [search, setSearch] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const visibleMatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return matchingProducts;
    return matchingProducts.filter((p: any) =>
      productName(p).toLowerCase().includes(q)
    );
  }, [matchingProducts, search]);

  const matchedIds = useMemo(
    () => new Set(matchingProducts.map((p: any) => p._id)),
    [matchingProducts]
  );
  const pickerResults = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return allRawProducts
      .filter((p: any) => !matchedIds.has(p._id))
      .filter((p: any) => !q || productName(p).toLowerCase().includes(q))
      .slice(0, 20);
  }, [allRawProducts, matchedIds, pickerSearch]);

  const excluded = useMemo(
    () => allRawProducts.filter((p: any) => manualExcludes.has(p._id)),
    [allRawProducts, manualExcludes]
  );

  return (
    <div className={cardCls}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Matching products
        </h3>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {isLoading ? '…' : `${matchingProducts.length} matched`}
        </span>
      </div>

      {/* Search matches */}
      <div className="mb-3 flex items-center gap-2 rounded-md border border-input bg-background px-3">
        <Search className="size-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search matched products"
          className="h-9 w-full bg-transparent text-sm outline-none"
        />
      </div>

      {/* Matched list */}
      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {visibleMatches.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">
            {isLoading
              ? 'Loading products…'
              : 'No products match these conditions yet.'}
          </p>
        ) : (
          visibleMatches.map((p: any) => (
            <Row
              key={p._id}
              p={p}
              badge={manualIncludes.has(p._id) ? 'Manual' : undefined}
              right={
                <button
                  type="button"
                  onClick={() =>
                    manualIncludes.has(p._id)
                      ? handleRemoveInclude(p._id)
                      : handleExclude(p._id)
                  }
                  title="Remove"
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
                >
                  <X className="size-4" />
                </button>
              }
            />
          ))
        )}
      </div>

      {/* Manual add picker */}
      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        className="mt-3 flex w-full items-center justify-between rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <span className="flex items-center gap-1.5">
          <Plus className="size-4" /> Add products manually
        </span>
        <ChevronDown
          className={`size-4 transition-transform ${pickerOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {pickerOpen && (
        <div className="mt-2 rounded-md border border-gray-100 p-2 dark:border-gray-800">
          <div className="mb-2 flex items-center gap-2 rounded-md border border-input bg-background px-3">
            <Search className="size-4 text-gray-400" />
            <input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search all products"
              className="h-9 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="flex max-h-52 flex-col gap-2 overflow-y-auto">
            {pickerResults.map((p: any) => (
              <Row
                key={p._id}
                p={p}
                right={
                  <button
                    type="button"
                    onClick={() => handleInclude(p._id)}
                    className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                  >
                    Include
                  </button>
                }
              />
            ))}
            {pickerResults.length === 0 && (
              <p className="py-4 text-center text-xs text-gray-400">
                No products to add.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Excluded */}
      {excluded.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Excluded
          </p>
          <div className="flex flex-col gap-2">
            {excluded.map((p: any) => (
              <Row
                key={p._id}
                p={p}
                right={
                  <button
                    type="button"
                    onClick={() => handleUndoExclude(p._id)}
                    title="Undo"
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Undo2 className="size-3.5" /> Undo
                  </button>
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

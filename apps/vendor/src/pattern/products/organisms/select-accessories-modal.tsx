'use client';

import { useMemo, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Check, Info, Package, Plus, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProductsByVendorQuery } from '@/redux/services/products/products.api-slice';
import { AddAccessoryModal } from './add-accessories-modal';
import { cn } from '@/lib/utils';

export interface SelectedAccessory {
  id: string;
  name: string;
  imageUrl?: string;
  price?: number;
}

// Loose shape — accessories may carry extra fields beyond the base Product type.
interface AccessoryLike {
  _id?: string;
  id?: string;
  name?: string;
  base_price?: number;
  kind?: string;
  accessory?: any;
  images?: (string | { url?: string })[];
  taxonomy?: { product_type?: string; categories?: string[] };
  tags?: any[];
}

const accessoryId = (a: AccessoryLike): string => a._id ?? a.id ?? '';
const accessoryImage = (a: AccessoryLike): string | undefined => {
  const inner = a.accessory || a;
  const imgs = inner?.images ?? a.images ?? [];
  const first = imgs[0];
  return typeof first === 'string' ? first : first?.url;
};
const accessoryName = (a: AccessoryLike): string => {
  return a.accessory?.name || a.name || 'Accessory';
};
const accessoryPrice = (a: AccessoryLike): number | undefined => {
  return a.accessory?.price ?? a.base_price ?? undefined;
};
const accessoryType = (a: AccessoryLike): string => {
  return (
    a.taxonomy?.product_type ||
    a.accessory?.taxonomy?.product_type ||
    ''
  );
};

// Product type categories for accessory filtering
const ACCESSORY_TYPES = [
  'All',
  'Buttons',
  'Threads',
  'Zippers',
  'Buckles',
  'Beads',
  'Lining',
  'Patches',
  'Ribbons',
  'Embellishments',
];

// "Select Accessories" picker — data-driven from the accessory catalogue
// (GET /products/by-vendor?kind=accessory). Resolves with the chosen accessories, or null.
export const SelectAccessoriesModal = NiceModal.create(() => {
  const modal = useModal();

  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, SelectedAccessory>>({});

  const { data, isLoading, isFetching } = useGetProductsByVendorQuery({
    kind: 'accessory',
    page: 1,
    size: 100,
  });

  const accessories = useMemo(
    () => (data?.data?.data ?? []) as AccessoryLike[],
    [data]
  );

  const visibleAccessories = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filterType = typeFilter.toLowerCase();

    return accessories.filter((acc) => {
      const name = accessoryName(acc).toLowerCase();
      const type = accessoryType(acc).toLowerCase();

      // Type filter
      if (typeFilter !== 'All' && type !== filterType) return false;

      // Search
      if (query && !name.includes(query)) return false;

      return true;
    });
  }, [accessories, typeFilter, search]);

  if (!modal.visible) return null;

  const toggle = (acc: SelectedAccessory) =>
    setSelected((prev) => {
      const next = { ...prev };
      if (next[acc.id]) delete next[acc.id];
      else next[acc.id] = acc;
      return next;
    });

  const selectedList = Object.values(selected);

  const cancel = () => {
    modal.resolve(null);
    modal.remove();
  };

  const useAccessories = () => {
    modal.resolve(selectedList);
    modal.remove();
  };

  const loading = isLoading || isFetching;

  return (
    <Dialog open={modal.visible} onOpenChange={(open) => !open && cancel()}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden sm:rounded-[16px] bg-card border-none sm:border-solid">
        <div className="flex max-h-[85vh] sm:max-h-[90vh] h-full w-full flex-col sm:rounded-[16px]">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-border p-6 pr-12">
            <DialogTitle className="text-base font-semibold text-grey-black dark:text-white shrink-0 m-0">
              Select Accessories
            </DialogTitle>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search accessories..."
                className="h-10 w-full rounded-lg border border-input bg-accent dark:bg-muted pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => NiceModal.show(AddAccessoryModal)}
                className="flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Add Accessory
                <Plus className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-[hsla(27,97%,12%,0.06)] p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Info className="size-4" />
              </span>
              <p className="text-sm text-grey-black dark:text-white">
                Choose accessories to offer as customization options on your
                clothing product
              </p>
            </div>

            {/* Type filter tabs */}
            <div className="flex flex-wrap gap-4 border-b border-border">
              {ACCESSORY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    '-mb-px border-b-2 pb-2 text-sm transition-colors',
                    typeFilter === type
                      ? 'border-foreground font-medium text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Accessory grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                ))}
              </div>
            ) : visibleAccessories.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {visibleAccessories.map((acc) => {
                  const id = accessoryId(acc);
                  const name = accessoryName(acc);
                  const imageUrl = accessoryImage(acc);
                  const price = accessoryPrice(acc);
                  const isSelected = Boolean(selected[id]);

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        toggle({ id, name, imageUrl, price })
                      }
                      className={cn(
                        'flex flex-col gap-1.5 rounded-lg border bg-card p-2 text-left transition-colors',
                        isSelected
                          ? 'border-primary ring-1 ring-primary'
                          : 'border-input hover:border-primary/50'
                      )}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-accent">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <Package className="size-7" />
                          </div>
                        )}
                        {isSelected && (
                          <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-[5px] bg-primary text-primary-foreground">
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs font-medium text-foreground">
                        {name}
                      </p>
                      {price != null && price > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          ₦{price.toLocaleString()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center">
                <Package className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {typeFilter !== 'All'
                    ? `No ${typeFilter.toLowerCase()} found.`
                    : 'No accessories found. Create one first.'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-6">
            <button
              type="button"
              onClick={useAccessories}
              disabled={selectedList.length === 0}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use Accessories
              {selectedList.length > 0
                ? ` (${selectedList.length})`
                : ''}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

'use client';

import { useMemo, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Check, Info, Layers, Plus, Search, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProductsByVendorQuery } from '@/redux/services/products/products.api-slice';
import { AddFabricModal } from './add-fabric-modal';
import { cn } from '@/lib/utils';

export interface SelectedFabric {
  id: string;
  name: string;
  imageUrl?: string;
  yards?: number;
  colorHex?: string;
  /** Yards of this fabric needed per clothing order */
  yardsPerOrder?: number;
}

// Loose shape over the vendor Product — fabrics may carry extra fields
// (material/yard_length) not present on the base Product type, and images may
// be plain URLs or objects.
interface FabricLike {
  _id?: string;
  id?: string;
  name?: string;
  material?: string;
  yard_length?: number;
  images?: (string | { url?: string })[];
  metafields?: any;
  fabric?: any;
  colour?: string;
  color?: string;
}

const fabricId = (f: FabricLike): string => f._id ?? f.id ?? '';
const fabricImage = (f: FabricLike): string | undefined => {
  const first = f.images?.[0];
  return typeof first === 'string' ? first : first?.url;
};

const fabricColor = (f: FabricLike): string | undefined => {
  return f.metafields?.swatch || f.metafields?.color || f.metafields?.colour || f.color || f.colour || f.fabric?.color || f.fabric?.colour;
};

// Fabric material families → their materials (sub-tabs). Used purely to filter
// the real fabric catalogue by each fabric's `material`.
const FAMILIES: { label: string; materials: string[] }[] = [
  { label: 'Natural', materials: ['Cotton', 'Linen', 'Silk', 'Wool', 'Canvas', 'Sateen'] },
  { label: 'Synthetic', materials: ['Polyester', 'Nylon', 'Acrylic', 'Spandex'] },
  { label: 'Blends', materials: ['Viscose', 'Rayon', 'Modal'] },
  { label: 'Knits', materials: ['Jersey', 'Rib', 'Interlock'] },
  { label: 'Woven', materials: ['Twill', 'Denim', 'Poplin'] },
  { label: 'Specialty', materials: ['Lace', 'Velvet', 'Chiffon', 'Satin'] },
];

const num = (value: unknown): number | undefined =>
  typeof value === 'number' && !Number.isNaN(value) ? value : undefined;

// "Select Fabric" picker — data-driven from the fabric catalogue
// (GET /products?kind=fabric). Resolves with the chosen fabrics, or null.
export const SelectFabricModal = NiceModal.create(() => {
  const modal = useModal();

  const [family, setFamily] = useState('Natural');
  const [material, setMaterial] = useState('Linen');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, SelectedFabric>>({});

  const { data, isLoading, isFetching } = useGetProductsByVendorQuery({
    kind: 'fabric',
    page: 1,
    size: 100,
  });

  const fabrics = useMemo(
    () => (data?.data?.data ?? []) as FabricLike[],
    [data]
  );
  const subTabs = FAMILIES.find((f) => f.label === family)?.materials ?? [];

  const visibleFabrics = useMemo(() => {
    const query = search.trim().toLowerCase();
    return fabrics.filter((fabric) => {
      const mat = String(fabric.material ?? '').toLowerCase();
      // Product type may not carry `material`; only filter when present.
      const matchesMaterial = !mat || !material || mat === material.toLowerCase();
      const matchesSearch =
        !query || String(fabric.name ?? '').toLowerCase().includes(query);
      return matchesMaterial && matchesSearch;
    });
  }, [fabrics, material, search]);

  if (!modal.visible) return null;

  const toggle = (fabric: SelectedFabric) =>
    setSelected((prev) => {
      const next = { ...prev };
      if (next[fabric.id]) delete next[fabric.id];
      else next[fabric.id] = fabric;
      return next;
    });

  const selectedList = Object.values(selected);

  const cancel = () => {
    modal.resolve(null);
    modal.remove();
  };

  const useFabric = () => {
    modal.resolve(selectedList);
    modal.remove();
  };

  const changeFamily = (fam: string) => {
    setFamily(fam);
    setMaterial(FAMILIES.find((f) => f.label === fam)?.materials[0] ?? '');
  };

  const loading = isLoading || isFetching;

  return (
    <Dialog open={modal.visible} onOpenChange={(open) => !open && cancel()}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden sm:rounded-[16px] bg-card border-none sm:border-solid">
        <div className="flex max-h-[85vh] sm:max-h-[90vh] h-full w-full flex-col sm:rounded-[16px]">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border p-6 pr-12">
          <DialogTitle className="text-base font-semibold text-grey-black dark:text-white shrink-0 m-0">
            Select Fabric
          </DialogTitle>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-lg border border-input bg-accent dark:bg-muted pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => NiceModal.show(AddFabricModal)}
              className="flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Add Fabric
              <Plus className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-[hsla(27,97%,12%,0.06)] p-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Info className="size-4" />
            </span>
            <p className="text-sm text-grey-black dark:text-white">
              Choose the fabrics you would like to present to your customers
            </p>
          </div>

          {/* Family tabs */}
          <div className="flex flex-wrap gap-4 border-b border-border">
            {FAMILIES.map((fam) => (
              <button
                key={fam.label}
                type="button"
                onClick={() => changeFamily(fam.label)}
                className={cn(
                  '-mb-px border-b-2 pb-2 text-sm transition-colors',
                  family === fam.label
                    ? 'border-foreground font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {fam.label}
              </button>
            ))}
          </div>

          {/* Material sub-tabs */}
          {subTabs.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-lg bg-accent p-1">
              {subTabs.map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setMaterial(mat)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                    material === mat
                      ? 'bg-background font-medium text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {mat}
                </button>
              ))}
            </div>
          )}

          {/* Fabric grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : visibleFabrics.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {visibleFabrics.map((fabric) => {
                const id = fabricId(fabric);
                const yards = num(fabric.yard_length);
                const imageUrl = fabricImage(fabric);
                const colorHex = fabricColor(fabric);
                const isSelected = Boolean(selected[id]);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      toggle({
                        id,
                        name: fabric.name ?? 'Fabric',
                        imageUrl,
                        yards,
                        colorHex,
                      })
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
                          <Layers className="size-7" />
                        </div>
                      )}
                      {isSelected && (
                        <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-[5px] bg-primary text-primary-foreground">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-foreground">
                      {fabric.name ?? 'Fabric'}
                    </p>
                    {yards !== undefined && (
                      <span
                        className={cn(
                          'w-fit rounded px-1.5 py-0.5 text-[11px] font-medium text-white',
                          yards < 5 ? 'bg-destructive' : 'bg-success'
                        )}
                      >
                        {yards} Yards
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
              No fabrics found for this material.
            </div>
          )}
        </div>

        {/* Selected fabrics — yards per order */}
        {selectedList.length > 0 && (
          <div className="border-t border-border px-6 py-4 space-y-3 max-h-48 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Yards per order
            </p>
            {selectedList.map((sf) => (
              <div key={sf.id} className="flex items-center gap-3">
                {sf.colorHex ? (
                  <div
                    className="size-6 shrink-0 rounded-full border border-input"
                    style={{ backgroundColor: sf.colorHex }}
                  />
                ) : sf.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sf.imageUrl} alt="" className="size-6 shrink-0 rounded object-cover" />
                ) : null}
                <span className="flex-1 truncate text-sm text-foreground">{sf.name}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={sf.yardsPerOrder ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSelected((prev) => ({
                        ...prev,
                        [sf.id]: { ...prev[sf.id], yardsPerOrder: isNaN(val) ? undefined : val },
                      }));
                    }}
                    placeholder="0"
                    className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm text-right outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-xs text-muted-foreground">yds</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border p-6">
          <button
            type="button"
            onClick={useFabric}
            disabled={selectedList.length === 0}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use Fabric{selectedList.length > 0 ? ` (${selectedList.length})` : ''}
          </button>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
});

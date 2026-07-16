'use client';

import { ChevronDown, ImageIcon, Info, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { NumberStepper } from '../molecules/number-stepper';
import { cn } from '@/lib/utils';

export const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
export type SizeKey = (typeof ALL_SIZES)[number];

export interface SizeDetail {
  stock: number;
  yardsPerOrder: number;
  price: number;
  sku: string;
  selected: boolean;
}

export interface VariantRow {
  id: string;
  colorHex: string;
  /** For fabric variants: the fabric swatch image + name. */
  imageUrl?: string;
  label?: string;
  /** Sizes toggled on for this colour (subset of ALL_SIZES). */
  availableSizes: string[];
  details: Record<string, SizeDetail>;
  /** Per-colour product image URLs (max 5 shown). */
  images: string[];
  imageFiles?: File[];
  expanded: boolean;
  selected: boolean;
}

export const makeSizeDetail = (): SizeDetail => ({
  stock: 0,
  yardsPerOrder: 0,
  price: 0,
  sku: '',
  selected: false,
});

interface SetVariantsTableProps {
  variants: VariantRow[];
  onChange: (next: VariantRow[]) => void;
}

const HeaderInfo = ({ label }: { label: string }) => (
  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
    {label}
    <Info className="size-3" />
  </span>
);

// Full-width "Set Variants" table: one row per colour (sizes, images), each
// expandable into a per-size detail grid (stock / yards / price / SKU).
export const SetVariantsTable = ({
  variants,
  onChange,
}: SetVariantsTableProps) => {
  if (variants.length === 0) return null;

  const patchVariant = (id: string, patch: Partial<VariantRow>) =>
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const patchDetail = (
    id: string,
    size: string,
    patch: Partial<SizeDetail>
  ) =>
    onChange(
      variants.map((v) =>
        v.id === id
          ? {
              ...v,
              details: {
                ...v.details,
                [size]: { ...(v.details[size] ?? makeSizeDetail()), ...patch },
              },
            }
          : v
      )
    );

  const generateSkus = (id: string) =>
    onChange(
      variants.map((v) => {
        if (v.id !== id) return v;
        const colorCode = v.colorHex.replace('#', '').slice(0, 4).toUpperCase();
        const details = { ...v.details };
        v.availableSizes.forEach((size) => {
          details[size] = {
            ...(details[size] ?? makeSizeDetail()),
            sku: `CLO-${colorCode}-${size}`,
          };
        });
        return { ...v, details };
      })
    );

  const deleteSelected = () => {
    const anySelected = variants.some((v) => v.selected);
    onChange(
      anySelected ? variants.filter((v) => !v.selected) : variants.slice(0, -1)
    );
  };

  return (
    <div className="rounded-lg bg-card p-4 md:p-6 custom-card-shadow overflow-hidden flex flex-col">
      <h3 className="mb-4 text-sm font-semibold text-grey-black dark:text-white shrink-0">
        Set Variants
      </h3>

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2">
        <div className="min-w-[800px]">
          {/* Column header */}
          <div className="flex items-center gap-4 border-b border-border pb-3">
            <span className="w-[110px] text-xs font-medium text-muted-foreground shrink-0">
              Colours
            </span>
        <span className="flex-1 text-xs font-medium text-muted-foreground">
          Available Sizes
        </span>
        <span className="w-[260px] text-xs font-medium text-muted-foreground">
          Add Product images
        </span>
        <div className="flex w-10 justify-center">
          <button
            type="button"
            onClick={deleteSelected}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Delete selected variants"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {variants.map((variant) => (
          <div key={variant.id}>
            {/* Colour row */}
            <div className="flex items-center gap-4 py-3">
              <button
                type="button"
                onClick={() =>
                  patchVariant(variant.id, { expanded: !variant.expanded })
                }
                className="flex w-[110px] items-center gap-2 rounded-md border border-input px-2 py-1.5"
              >
                {variant.imageUrl ? (
                  <span className="size-6 overflow-hidden rounded border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={variant.imageUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </span>
                ) : (
                  <span
                    style={{ backgroundColor: variant.colorHex }}
                    className="size-6 rounded border border-border"
                  />
                )}
                <ChevronDown
                  className={cn(
                    'ml-auto size-4 text-muted-foreground transition-transform',
                    variant.expanded && 'rotate-180'
                  )}
                />
              </button>

              {/* Available sizes are read-only here — set when the variant was
                  added in Select Options. */}
              <div className="flex flex-1 flex-wrap gap-2">
                {ALL_SIZES.filter((s) => variant.availableSizes.includes(s)).map(
                  (size) => (
                    <span
                      key={size}
                      className="min-w-[44px] rounded-md border border-input px-3 py-1.5 text-center text-sm text-foreground"
                    >
                      {size}
                    </span>
                  )
                )}
              </div>

              <div className="flex w-[260px] items-center gap-1.5 relative">
                <input 
                  type="file" 
                  accept="image/jpeg,image/png" 
                  multiple 
                  className="hidden" 
                  id={`file-${variant.id}`} 
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files).slice(0, 5 - variant.images.length);
                      if (files.length > 0) {
                        const newImages = [...variant.images, ...files.map(f => URL.createObjectURL(f))];
                        const newFiles = [...(variant.imageFiles || []), ...files];
                        patchVariant(variant.id, { images: newImages, imageFiles: newFiles });
                      }
                    }
                  }}
                />
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => document.getElementById(`file-${variant.id}`)?.click()}
                    className="flex size-9 items-center justify-center overflow-hidden rounded-md border border-input bg-accent hover:border-primary transition"
                  >
                    {variant.images[i] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={variant.images[i]}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="size-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex w-10 justify-center">
                <Checkbox
                  checked={variant.selected}
                  onCheckedChange={(c) =>
                    patchVariant(variant.id, { selected: c === true })
                  }
                  aria-label="Select variant"
                />
              </div>
            </div>

            {/* Expanded per-size detail */}
            {variant.expanded && variant.availableSizes.length > 0 && (
              <div className="pb-4">
                <div className="grid grid-cols-[90px_1fr_1fr_1fr_1.3fr_40px] items-center gap-3 border-y border-border py-2">
                  <HeaderInfo label="Size" />
                  <HeaderInfo label="Stock" />
                  <HeaderInfo label="Yards/order" />
                  <HeaderInfo label="Extra Cost" />
                  <div className="flex items-center justify-between gap-2">
                    <HeaderInfo label="SKU" />
                    <button
                      type="button"
                      onClick={() => generateSkus(variant.id)}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Generate
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        onChange(variants.filter((v) => v.id !== variant.id))
                      }
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete variant"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-3">
                  {ALL_SIZES.filter((s) => variant.availableSizes.includes(s)).map(
                    (size) => {
                      const detail = variant.details[size] ?? makeSizeDetail();
                      return (
                        <div
                          key={size}
                          className="grid grid-cols-[90px_1fr_1fr_1fr_1.3fr_40px] items-center gap-3"
                        >
                          <span className="rounded-md border border-input px-3 py-1.5 text-center text-sm text-foreground">
                            {size}
                          </span>
                          <NumberStepper
                            value={detail.stock}
                            onChange={(v) =>
                              patchDetail(variant.id, size, { stock: v })
                            }
                          />
                          <NumberStepper
                            value={detail.yardsPerOrder}
                            onChange={(v) =>
                              patchDetail(variant.id, size, { yardsPerOrder: v })
                            }
                          />
                          <div className="relative">
                            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              ₦
                            </span>
                            <Input
                              type="number"
                              min={0}
                              value={detail.price === 0 ? '' : detail.price}
                              onChange={(e) =>
                                patchDetail(variant.id, size, {
                                  price:
                                    e.target.value === ''
                                      ? 0
                                      : Number(e.target.value),
                                })
                              }
                              placeholder="0"
                              className="h-9 bg-accent dark:bg-muted pl-5 text-sm"
                            />
                          </div>
                          <Input
                            value={detail.sku}
                            onChange={(e) =>
                              patchDetail(variant.id, size, {
                                sku: e.target.value,
                              })
                            }
                            placeholder="SKU"
                            className="h-9 bg-accent dark:bg-muted text-sm"
                          />
                          <div className="flex justify-center">
                            <Checkbox
                              checked={detail.selected}
                              onCheckedChange={(c) =>
                                patchDetail(variant.id, size, { selected: c === true })
                              }
                              aria-label={`Select ${size}`}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
          </div>
        </div>
      </div>
    </div>
  );
};

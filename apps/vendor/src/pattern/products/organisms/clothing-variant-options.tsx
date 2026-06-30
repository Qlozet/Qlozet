'use client';

import { useEffect, useRef, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { ChevronDown, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldLabel } from '../atoms/field-label';
import {
  SelectFabricModal,
  type SelectedFabric,
} from './select-fabric-modal';
import { cn } from '@/lib/utils';

const SIZE_OPTIONS = [
  { value: 'xs', label: 'Extra small' },
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

// Maps the Select Options size values to the Set Variants size keys.
const SIZE_KEY: Record<string, string> = {
  xs: 'S',
  s: 'M',
  m: 'L',
  l: 'XL',
  xl: 'XXL',
};

const SWATCHES = ['#000000', '#3d2817', '#8a7060', '#991B1B', '#1E3A5F'];

export interface VariantDescriptor {
  colorHex?: string;
  imageUrl?: string;
  label?: string;
}

interface VariantSelectOptionsProps {
  /** Called with the chosen colour/fabric + size keys when "Add Variants" is clicked. */
  onAddVariant: (descriptor: VariantDescriptor, sizeKeys: string[]) => void;
}

// Size field: selected sizes show as inline chips with a clear (trash) button
// and a dropdown (chevron) to toggle the available sizes.
const SizeField = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div ref={ref} className="relative">
      <div className="flex min-h-10 items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5">
        <div className="flex flex-1 flex-wrap gap-2">
          {value.length === 0 && (
            <span className="text-sm text-muted-foreground">Select sizes</span>
          )}
          {value.map((v) => {
            const opt = SIZE_OPTIONS.find((o) => o.value === v);
            return (
              <span
                key={v}
                className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-sm text-foreground"
              >
                {opt?.label ?? v}
                <button
                  type="button"
                  onClick={() => toggle(v)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Clear sizes"
        >
          <Trash2 className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Toggle sizes"
        >
          <ChevronDown
            className={cn('size-4 transition-transform', open && 'rotate-180')}
          />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-card p-3 shadow-lg">
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((o) => {
              const selected = value.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                    selected
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-input text-foreground hover:bg-accent'
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// "Select Options (Variants)" card — pick colour or fabric + sizes, then add a
// variant row to the Set Variants table below.
export const VariantSelectOptions = ({
  onAddVariant,
}: VariantSelectOptionsProps) => {
  const [variantType, setVariantType] = useState<'colour' | 'fabric'>('colour');
  const [selectedColor, setSelectedColor] = useState(SWATCHES[0]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [fabrics, setFabrics] = useState<SelectedFabric[]>([]);
  const [activeFabricId, setActiveFabricId] = useState<string | null>(null);

  const activeFabric = fabrics.find((f) => f.id === activeFabricId) ?? null;
  const canAdd =
    selectedSizes.length > 0 &&
    (variantType === 'colour' || Boolean(activeFabric));

  const pickFabrics = async () => {
    const picked = (await NiceModal.show(SelectFabricModal)) as
      | SelectedFabric[]
      | null;
    if (!picked?.length) return;
    setFabrics((prev) => {
      const merged = [...prev];
      picked.forEach((f) => {
        if (!merged.some((m) => m.id === f.id)) merged.push(f);
      });
      return merged;
    });
    setActiveFabricId((cur) => cur ?? picked[0].id);
  };

  const clearFabrics = () => {
    setFabrics([]);
    setActiveFabricId(null);
  };

  const addVariant = () => {
    if (!canAdd) return;
    const sizeKeys = selectedSizes.map((s) => SIZE_KEY[s] ?? s.toUpperCase());
    if (variantType === 'fabric' && activeFabric) {
      onAddVariant(
        { imageUrl: activeFabric.imageUrl, label: activeFabric.name, colorHex: activeFabric.colorHex },
        sizeKeys
      );
    } else {
      onAddVariant({ colorHex: selectedColor }, sizeKeys);
    }
    setSelectedSizes([]);
  };

  return (
    <div className="rounded-lg bg-card p-6 custom-card-shadow">
      <h3 className="mb-4 text-sm font-semibold text-grey-black dark:text-white">
        Select Options (Variants)
      </h3>

      {/* Colour / Fabric toggle */}
      <div className="mb-4 flex items-center gap-6">
        {(['colour', 'fabric'] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setVariantType(opt)}
            className="flex items-center gap-2 text-sm capitalize text-grey-black dark:text-white"
          >
            <span
              className={cn(
                'flex size-4 items-center justify-center rounded-full border',
                variantType === opt ? 'border-primary' : 'border-input'
              )}
            >
              {variantType === opt && (
                <span className="size-2 rounded-full bg-primary" />
              )}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {/* Colour swatches */}
      {variantType === 'colour' ? (
        <div className="mb-4">
          <FieldLabel>Colour</FieldLabel>
          <div className="flex items-center gap-3 rounded-md border border-input bg-background p-3">
            {SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setSelectedColor(hex)}
                style={{ backgroundColor: hex }}
                className={cn(
                  'size-9 rounded-md border-2 transition',
                  selectedColor === hex
                    ? 'border-primary ring-2 ring-ring ring-offset-1'
                    : 'border-transparent'
                )}
                aria-label={`Select ${hex}`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Fabric picker: thumbnails left, trash + add-image right */
        <div className="mb-4">
          <FieldLabel>Fabric</FieldLabel>
          <div className="flex items-center gap-3 rounded-md border border-input bg-background p-2">
            <div className="flex flex-1 items-center gap-2 overflow-x-auto">
              {fabrics.length === 0 && (
                <span className="px-1 text-sm text-muted-foreground">
                  No fabric selected
                </span>
              )}
              {fabrics.map((fabric) => (
                <button
                  key={fabric.id}
                  type="button"
                  onClick={() => setActiveFabricId(fabric.id)}
                  title={fabric.name}
                  className={cn(
                    'h-8 w-12 shrink-0 overflow-hidden rounded border-2 bg-accent transition',
                    activeFabricId === fabric.id
                      ? 'border-primary ring-1 ring-ring'
                      : 'border-transparent'
                  )}
                >
                  {fabric.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fabric.imageUrl}
                      alt={fabric.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-[9px] text-muted-foreground">
                      {fabric.name.slice(0, 6)}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearFabrics}
              className="shrink-0 text-muted-foreground hover:text-destructive"
              aria-label="Clear fabrics"
            >
              <Trash2 className="size-5" />
            </button>
            <button
              type="button"
              onClick={pickFabrics}
              className="shrink-0 text-muted-foreground hover:text-primary"
              aria-label="Add fabric"
            >
              <ImagePlus className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Size field */}
      <div className="mb-4">
        <FieldLabel tooltip="Select sizes">Size</FieldLabel>
        <SizeField value={selectedSizes} onChange={setSelectedSizes} />
      </div>

      <Button onClick={addVariant} disabled={!canAdd} className="h-11 gap-2 px-5">
        <span className="flex size-5 items-center justify-center rounded-[5px] border border-primary-foreground/50">
          <Plus className="size-3.5" />
        </span>
        Add Variants
      </Button>
    </div>
  );
};

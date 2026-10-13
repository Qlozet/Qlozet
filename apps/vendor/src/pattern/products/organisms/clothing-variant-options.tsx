'use client';

import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { ChevronDown, ImagePlus, Plus, Trash2, X, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldLabel } from '../atoms/field-label';
import { SelectFabricModal, type SelectedFabric } from './select-fabric-modal';
import { cn } from '@/lib/utils';
import { ColorMenuPopover } from '../molecules/color-menu-popover';
import { PredefinedColor } from '../constants/predefined-colors';
import AdvancedColorPickerModal from './advanced-color-picker-modal';
import { AVAILABLE_COLORS, ColorOption } from '../types/variant.types';

export interface SizeOption {
  /** The size key stored on the variant and shown to shoppers, e.g. "M" or "42". */
  value: string;
  label: string;
}

/**
 * The fallback when the product has no size guide. A guide's own sizes
 * (numeric, kids, the vendor's labels) take over as soon as one is chosen;
 * the garment's sizes are whatever its chart says, not a fixed alphabet.
 */
export const STANDARD_SIZE_OPTIONS: SizeOption[] = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
];

const SWATCHES = ['#000000', '#3d2817', '#8a7060', '#991B1B', '#1E3A5F'];

export interface VariantDescriptor {
  colorHex?: string;
  imageUrl?: string;
  label?: string;
}

interface VariantSelectOptionsProps {
  /** Called with the chosen colour/fabric + size keys when "Add Variants" is clicked. */
  onAddVariant: (descriptor: VariantDescriptor, sizeKeys: string[]) => void;
  /** The sizes on offer: the product's size guide, or the standard set. */
  sizeOptions?: SizeOption[];
  /** One line under the size field saying where these sizes come from. */
  sizeSource?: React.ReactNode;
  /** Fabric swatches as a variant make sense for garments only. */
  allowFabric?: boolean;
  /** Sizes pre-selected for each new colour (e.g. "One size" for accessories). */
  defaultSizes?: string[];
}

// Size field: selected sizes show as inline chips with a clear (trash) button
// and a dropdown (chevron) to toggle the available sizes, plus a box to add
// a size the list does not have.
const SizeField = ({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  options: SizeOption[];
}) => {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const addCustom = () => {
    const label = custom.trim();
    if (!label) return;
    if (!value.includes(label)) onChange([...value, label]);
    setCustom('');
  };

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
            const opt = options.find((o) => o.value === v);
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
            {options.map((o) => {
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
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder="Another size, e.g. 3XL or 44"
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!custom.trim()}
              className="h-9 rounded-md border border-input px-3 text-sm text-foreground hover:bg-accent disabled:opacity-50"
            >
              Add
            </button>
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
  sizeOptions = STANDARD_SIZE_OPTIONS,
  sizeSource,
  allowFabric = true,
  defaultSizes = [],
}: VariantSelectOptionsProps) => {
  const colorPickerModal = useModal(AdvancedColorPickerModal);
  const [variantType, setVariantType] = useState<'colour' | 'fabric'>('colour');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState<ColorOption[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(defaultSizes);
  const [fabrics, setFabrics] = useState<SelectedFabric[]>([]);
  const [activeFabricId, setActiveFabricId] = useState<string | null>(null);

  const displayColors = [...AVAILABLE_COLORS, ...customColors];

  const handlePredefinedColorSelect = (color: PredefinedColor) => {
    const colorOption: ColorOption = {
      value: color.value,
      label: color.label,
      hex: color.hex,
    };
    if (!displayColors.find((c) => c.value === color.value)) {
      setCustomColors((prev) => [...prev, colorOption]);
    }
    setSelectedColors((prev) =>
      prev.includes(color.value)
        ? prev.filter((c) => c !== color.value)
        : [...prev, color.value]
    );
  };

  const handleOpenCustomPicker = async () => {
    const result = (await colorPickerModal.show({
      initialColor: '#A855F7',
    })) as { hex: string; label: string } | null;
    if (result) {
      const customColor: ColorOption = {
        value: result.hex.replace('#', '').toLowerCase(),
        label: result.label,
        hex: result.hex,
      };
      setCustomColors((prev) => [...prev, customColor]);
      if (!selectedColors.includes(customColor.value)) {
        setSelectedColors((prev) => [...prev, customColor.value]);
      }
    }
  };

  const activeFabric = fabrics.find((f) => f.id === activeFabricId) ?? null;
  const canAdd =
    selectedSizes.length > 0 &&
    (variantType === 'colour'
      ? selectedColors.length > 0
      : Boolean(activeFabric));

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
    const sizeKeys = selectedSizes.map((s) => s.trim());
    if (variantType === 'fabric' && activeFabric) {
      onAddVariant(
        {
          imageUrl: activeFabric.imageUrl,
          label: activeFabric.name,
          colorHex: activeFabric.colorHex,
        },
        sizeKeys
      );
    } else if (variantType === 'colour') {
      selectedColors.forEach((colorValue) => {
        const colorObj = displayColors.find((c) => c.value === colorValue);
        if (colorObj) {
          onAddVariant(
            { colorHex: colorObj.hex, label: colorObj.label },
            sizeKeys
          );
        }
      });
      setSelectedColors([]);
    }
    setSelectedSizes(defaultSizes);
  };

  return (
    <div className="rounded-lg border bg-card p-6 custom-card-shadow">
      <h3 className="mb-1 text-sm font-semibold text-grey-black dark:text-white">
        Add a colour and its sizes
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Pick a colour (or a fabric) and the sizes you sell it in, then add it.
        Repeat for each colour. Stock and photos per size come next.
      </p>

      {/* Colour / Fabric toggle */}
      {allowFabric && (
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
      )}

      {/* Colour swatches */}
      {variantType === 'colour' ? (
        <div className="mb-4">
          <FieldLabel>Colour</FieldLabel>
          <ColorMenuPopover
            onSelectColor={handlePredefinedColorSelect}
            onOpenCustomPicker={handleOpenCustomPicker}
            selectedColors={selectedColors}
          >
            <div className="min-h-[44px] flex items-center gap-2 flex-wrap px-3 py-2 border-2 border-border rounded-md cursor-pointer hover:border-border-input transition-colors bg-accent">
              {selectedColors.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  Select colors...
                </span>
              ) : (
                selectedColors.map((colorValue) => {
                  const color = displayColors.find(
                    (c) => c.value === colorValue
                  );
                  if (!color) return null;
                  return (
                    <div
                      key={color.value}
                      className="flex items-center gap-1 bg-card border border-border rounded-md px-2 py-1"
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs text-foreground">
                        {color.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedColors((prev) =>
                            prev.filter((c) => c !== color.value)
                          );
                        }}
                        className="ml-1 hover:bg-accent rounded-full p-0.5"
                      >
                        <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  );
                })
              )}
              <Palette className="w-4 h-4 text-muted-foreground ml-auto" />
            </div>
          </ColorMenuPopover>
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
        <FieldLabel tooltip="The sizes you sell this colour in.">
          Sizes
        </FieldLabel>
        <SizeField
          value={selectedSizes}
          onChange={setSelectedSizes}
          options={sizeOptions}
        />
        {sizeSource && (
          <p className="mt-2 text-xs text-muted-foreground">{sizeSource}</p>
        )}
      </div>

      <Button
        onClick={addVariant}
        disabled={!canAdd}
        className="h-11 gap-2 px-5"
      >
        <span className="flex size-5 items-center justify-center rounded-[5px] border border-primary-foreground/50">
          <Plus className="size-3.5" />
        </span>
        Add colour
      </Button>
    </div>
  );
};

'use client';

import { useState } from 'react';
import { Info, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ColourOption {
  name: string;
  hex: string;
}

export interface AccessoryVariantRow {
  id: string;
  colour: ColourOption;
  sizes: string[];
}

// Preset palette (matches the vendor app's AVAILABLE_COLORS) plus room for
// custom colours added via the picker.
const PRESET_COLOURS: ColourOption[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'Brown', hex: '#A8581F' },
  { name: 'Grey', hex: '#B7B7B7' },
  { name: 'Red', hex: '#991B1B' },
  { name: 'Purple', hex: '#7E22CE' },
  { name: 'Cyan', hex: '#67E8F9' },
  { name: 'Lime', hex: '#A3E635' },
];

export const ACCESSORY_SIZES = [
  'Extra small',
  'Small',
  'Medium',
  'Large',
  'Extra large',
];

interface AccessoryVariantsBuilderProps {
  variants: AccessoryVariantRow[];
  onAdd: (colours: ColourOption[], sizes: string[]) => void;
  onRemove: (id: string) => void;
}

const FieldLabel = ({ children }: { children: string }) => (
  <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
    {children}
    <Info className="size-3.5 text-gray-400" />
  </label>
);

export const AccessoryVariantsBuilder = ({
  variants,
  onAdd,
  onRemove,
}: AccessoryVariantsBuilderProps) => {
  const [palette, setPalette] = useState<ColourOption[]>(PRESET_COLOURS);
  const [selectedColours, setSelectedColours] = useState<ColourOption[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customColour, setCustomColour] = useState('#E8A33D');

  const isColourSelected = (hex: string) =>
    selectedColours.some((c) => c.hex === hex);

  const toggleColour = (colour: ColourOption) => {
    setSelectedColours((prev) =>
      prev.some((c) => c.hex === colour.hex)
        ? prev.filter((c) => c.hex !== colour.hex)
        : [...prev, colour]
    );
  };

  const addCustomColour = () => {
    if (palette.some((c) => c.hex === customColour)) return;
    const colour = { name: customColour.toUpperCase(), hex: customColour };
    setPalette((prev) => [...prev, colour]);
    setSelectedColours((prev) => [...prev, colour]);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAdd = () => {
    if (selectedColours.length === 0) return;
    onAdd(selectedColours, selectedSizes);
    setSelectedColours([]);
    setSelectedSizes([]);
  };

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-foreground">Add Variants</h3>

      {/* Colour */}
      <div className="space-y-2">
        <FieldLabel>Colour</FieldLabel>
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background p-2">
          {palette.map((colour) => (
            <button
              key={colour.hex}
              type="button"
              title={colour.name}
              onClick={() => toggleColour(colour)}
              style={{ backgroundColor: colour.hex }}
              className={cn(
                'size-7 rounded-md border border-black/10 transition',
                isColourSelected(colour.hex) &&
                  'ring-2 ring-primary ring-offset-1'
              )}
            />
          ))}

          <button
            type="button"
            aria-label="Clear selected colours"
            onClick={() => setSelectedColours([])}
            className="ml-auto flex size-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          >
            <Trash2 className="size-4" />
          </button>

          <label
            className="relative flex size-7 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-[#E8A33D] text-white"
            aria-label="Add custom colour"
          >
            <Plus className="size-4" />
            <input
              type="color"
              value={customColour}
              onChange={(e) => setCustomColour(e.target.value)}
              onBlur={addCustomColour}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>

      {/* Size */}
      <div className="space-y-2">
        <FieldLabel>Size</FieldLabel>
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background p-2">
          {ACCESSORY_SIZES.map((size) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={cn(
                  'rounded-md border px-3 py-1 text-xs transition',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        onClick={handleAdd}
        disabled={selectedColours.length === 0}
        className="gap-2"
      >
        <Plus className="size-4" />
        Add Variants
      </Button>

      {/* Set variants table */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Set variants</h4>
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 bg-[#F9FAFB] px-4 py-2.5 text-xs font-medium text-gray-500">
            <span>Colours</span>
            <span>Sizes</span>
            <span>Add product images</span>
            <span className="sr-only">Remove</span>
          </div>

          {variants.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No variant added yet
            </p>
          ) : (
            variants.map((variant) => (
              <div
                key={variant.id}
                className="grid grid-cols-[1fr_1fr_1.5fr_auto] items-center gap-2 border-t border-border px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: variant.colour.hex }}
                    className="size-4 rounded-full border border-black/10"
                  />
                  <span className="truncate text-gray-700">
                    {variant.colour.name}
                  </span>
                </span>
                <span className="flex flex-wrap gap-1">
                  {variant.sizes.length > 0 ? (
                    variant.sizes.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  Added on submit
                </span>
                <button
                  type="button"
                  aria-label="Remove variant"
                  onClick={() => onRemove(variant.id)}
                  className="flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

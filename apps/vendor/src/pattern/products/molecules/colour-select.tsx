'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Named fabric colours from the Figma "Colour menu".
export const NAMED_COLOURS: { name: string; hex: string }[] = [
  { name: 'Solid', hex: '#FFFFFF' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Dark-gray', hex: '#555555' },
  { name: 'Light-Gray', hex: '#CCCCCC' },
  { name: 'Black', hex: '#000000' },
  { name: 'Light-Yellow', hex: '#FFFFE0' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Turmeric', hex: '#E08000' },
  { name: 'Orange', hex: '#FF8C00' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Hot-pink', hex: '#FF69B4' },
  { name: 'Light-Green', hex: '#90EE90' },
  { name: 'Green', hex: '#008000' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Dark-Olive', hex: '#556B2F' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Khaki', hex: '#F0E68C' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Sky-Blue', hex: '#87CEEB' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Brown', hex: '#8B5A2B' },
  { name: 'Dark-Brown', hex: '#5C4033' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Silver', hex: '#C0C0C0' },
];

const RAINBOW =
  'conic-gradient(red, orange, yellow, green, cyan, blue, violet, red)';

interface ColourSelectProps {
  /** Selected colour name. */
  value: string;
  hex: string;
  onChange: (name: string, hex: string) => void;
}

// Colour field: a named-colour menu plus a Custom hex picker. Mirrors the Figma
// Colour menu used by the Add Fabric form.
export const ColourSelect = ({ value, hex, onChange }: ColourSelectProps) => {
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span className={cn(!value && 'text-muted-foreground')}>
          {value || 'Any fabric type'}
        </span>
        <span className="flex items-center gap-2">
          <span
            className="size-5 rounded border border-border"
            style={
              value === 'Colourful'
                ? { background: RAINBOW }
                : { backgroundColor: hex }
            }
          />
          <ChevronDown
            className={cn('size-4 transition-transform', open && 'rotate-180')}
          />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-card p-3 shadow-lg">
          <div className="grid grid-cols-2 gap-1.5">
            {NAMED_COLOURS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  onChange(c.name, c.hex);
                  setOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent',
                  value === c.name && 'bg-accent'
                )}
              >
                <span
                  className="size-4 shrink-0 rounded-full border border-border"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="truncate text-foreground">{c.name}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onChange('Colourful', hex);
                setOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent',
                value === 'Colourful' && 'bg-accent'
              )}
            >
              <span
                className="size-4 shrink-0 rounded-full border border-border"
                style={{ background: RAINBOW }}
              />
              <span className="text-foreground">Colourful</span>
            </button>
          </div>

          {/* Custom hex */}
          <label className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 text-sm text-foreground">
            <span>Custom</span>
            <span className="flex items-center gap-2">
              <input
                type="color"
                value={hex}
                onChange={(e) => onChange(e.target.value, e.target.value)}
                className="size-7 cursor-pointer rounded border border-input bg-transparent"
              />
              <span className="font-mono text-xs uppercase text-muted-foreground">
                {hex}
              </span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

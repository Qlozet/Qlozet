'use client';

// Order Media Panel — Molecule
//
// Companion media viewer that sits beside the order drawer, toggled by the
// vertical handle on the drawer's left edge. Open by default so the garment is
// visible as soon as the drawer opens; with no media it shows a neutral
// placeholder at the same dimensions rather than collapsing.
//
// Hidden below `sm`, where the drawer itself goes full-width and there is no
// room alongside it.

import { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Matches the drawer geometry: 440px wide, offset 24px from the right edge.
// Only the toggle handle is pinned to the drawer; the panel itself is centred
// on the viewport.
const DRAWER_WIDTH = 440;
const DRAWER_OFFSET = 24;

interface OrderMediaPanelProps {
  images: string[];
  title?: string;
  /**
   * Whether the owning drawer is open. The panel renders outside SheetContent,
   * so it has to be told — otherwise it lingers after the drawer closes.
   */
  drawerOpen: boolean;
  /** What the handle does — dismiss just this panel, or the drawer with it. */
  onClose: () => void;
  /** Accessible name for the handle, matching what `onClose` actually does. */
  closeLabel?: string;
}

export const OrderMediaPanel = ({
  images,
  title = 'Order media',
  drawerOpen,
  onClose,
  closeLabel = 'Close order details',
}: OrderMediaPanelProps) => {
  const [index, setIndex] = useState(0);

  const count = images.length;
  const hasMultiple = count > 1;
  const step = (delta: number) =>
    setIndex((prev) => (prev + delta + count) % count);

  // Lives and dies with the drawer.
  if (!drawerOpen) return null;

  return (
    // `pointer-events-auto` is required: a modal Radix dialog sets
    // `pointer-events: none` on <body> and re-enables it only inside its own
    // layer, so without this the panel isn't hit-testable at all.
    //
    // Radix still reports a click here as an "interact outside" the drawer.
    // That used to need cancelling per-surface; the drawer now refuses every
    // outside dismissal outright, so this panel, the item modal and the media
    // preview are all covered without marking each one.
    <div data-order-media-panel className="pointer-events-auto hidden sm:block">
      {/* Handle — a tab on the drawer's left edge. Dismisses the drawer and
          this panel together. */}
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="fixed top-1/2 z-[56] flex h-20 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white text-grey3 shadow-[0px_4px_16px_rgba(0,0,0,0.12)] transition-colors hover:text-primary dark:bg-card dark:text-gray-300 cursor-pointer"
        style={{ right: DRAWER_WIDTH + DRAWER_OFFSET - 12 }}
      >
        <ArrowLeftRight className="size-3.5" />
      </button>

      {/* Centred on the viewport. The width cap keeps the panel from running
          under the drawer on narrower screens: a centred element of width W
          clears a right-hand drawer of width D when W ≤ 100vw − 2D. */}
      <div className="fixed left-1/2 top-1/2 z-[55] w-[469px] max-w-[calc(100vw-960px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.18)] dark:bg-card">
        {/* 469 × 559, per the design. */}
        <div className="relative aspect-[469/559] w-full rounded-2xl bg-[#F5F2EE] dark:bg-[#4A4949]">
          {count === 0 ? (
            <div className="flex size-full flex-col items-center justify-center gap-2 rounded-2xl bg-[#E5E7EB] dark:bg-[#4A4949]">
              <ImageOff className="size-8 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No media for this order
              </p>
            </div>
          ) : (
            <Image
              key={images[index]}
              data-testid="order-media-panel-image"
              src={images[index]}
              alt={title}
              fill
              className="rounded-2xl object-cover"
              sizes="469px"
              priority
            />
          )}

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 cursor-pointer"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {images.map((url, i) => (
                  <span
                    key={url}
                    className={cn(
                      'size-1.5 rounded-full transition-colors',
                      i === index ? 'bg-white' : 'bg-white/60'
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

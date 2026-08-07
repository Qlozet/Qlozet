'use client';

// Media Preview Modal — Organism
//
// Full-size lightbox for order media (product photos, garment references).
// Opens above the order drawer and the item detail modal, so its z-index sits
// one layer higher than both.

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { create, useModal } from '@ebay/nice-modal-react';
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface MediaPreviewModalProps {
  /** One or more image URLs. Arrows appear only when there's more than one. */
  images: string[];
  /** Index to open on. */
  startIndex?: number;
  /** Accessible label — also used as the image alt text. */
  title?: string;
}

export const MediaPreviewModal = create<MediaPreviewModalProps>(
  ({ images, startIndex = 0, title = 'Order media' }) => {
    const { visible, hide, remove } = useModal();
    const [index, setIndex] = useState(startIndex);

    const count = images.length;
    const hasMultiple = count > 1;

    const onOpenChange = (open: boolean) => {
      if (!open) {
        hide();
        setTimeout(() => remove(), 300);
      }
    };

    const step = (delta: number) =>
      setIndex((prev) => (prev + delta + count) % count);

    // Arrow keys page through the set, matching the click targets.
    useEffect(() => {
      if (!visible || !hasMultiple) return;
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') step(-1);
        if (event.key === 'ArrowRight') step(1);
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, hasMultiple, count]);

    // No media is still a valid state — the modal opens and shows a neutral
    // placeholder at the same dimensions rather than silently doing nothing.
    return (
      <Dialog open={visible} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            'w-[469px] max-w-[92vw] gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 dark:bg-card',
            // Above the order drawer (z-50) and the item detail modal (z-60).
            'z-[70]'
          )}
          showCloseButton={false}
        >
          {/* Title is required for dialog accessibility but the design shows
              the image alone, so it's visually hidden. */}
          <DialogTitle className="sr-only">{title}</DialogTitle>

          {/* 469 × 559 at full size, scaled down proportionally on narrow
              viewports. */}
          <div className="relative aspect-[469/559] w-full rounded-2xl bg-[#F5F2EE] dark:bg-[#4A4949]">
            {count === 0 ? (
              <div className="flex size-full flex-col items-center justify-center gap-2 rounded-2xl bg-[#E5E7EB] dark:bg-[#4A4949]">
                <ImageOff className="size-8 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No media for this item
                </p>
              </div>
            ) : (
              <Image
                key={images[index]}
                src={images[index]}
                alt={title}
                fill
                className="rounded-2xl object-cover"
                sizes="(max-width: 640px) 92vw, 469px"
                priority
              />
            )}

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close preview"
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 cursor-pointer"
            >
              <X className="size-4" />
            </button>

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
                        i === index ? 'bg-white' : 'bg-white/50'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

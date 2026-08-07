'use client';

// Full-size media preview for order/product images.
//
// Opened from the item detail modal's hero thumbnail. Arrow keys and the on-screen
// controls step through the gallery; Escape closes.

import { useCallback, useEffect, useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';

interface OrderMediaPreviewModalProps {
  images: string[];
  title?: string;
}

export const OrderMediaPreviewModal = create<OrderMediaPreviewModalProps>(
  ({ images, title }) => {
    const modal = useModal();
    const [index, setIndex] = useState(0);

    const count = images.length;
    const close = useCallback(() => modal.remove(), [modal]);

    const step = useCallback(
      (delta: number) => {
        if (count === 0) return;
        setIndex((prev) => (prev + delta + count) % count);
      },
      [count]
    );

    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') close();
        if (event.key === 'ArrowRight') step(1);
        if (event.key === 'ArrowLeft') step(-1);
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [close, step]);

    if (!modal.visible) return null;

    const current = images[index];

    return (
      // Above the item detail modal (z-110) it opens from.
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80" onClick={close} />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={title ? `${title} media` : 'Media preview'}
          className="relative z-10 flex w-full max-w-3xl flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium text-white">
              {title}
              {count > 1 && (
                <span className="ml-2 text-white/60">
                  {index + 1} / {count}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close preview"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-black/40">
            {current ? (
              // Vendor-supplied hosts aren't in next/image remotePatterns.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current}
                alt={title ?? 'Preview'}
                className="max-h-[70vh] w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 py-16 text-white/70">
                <ImageOff className="size-8" strokeWidth={1.5} />
                <p className="text-sm">No image available</p>
              </div>
            )}

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

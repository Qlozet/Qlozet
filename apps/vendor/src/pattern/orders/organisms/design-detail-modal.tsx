'use client';

// Design Detail Modal — Organism
// Rich, image-forward breakdown of a customer's BESPOKE design: the generated
// design images, the chosen style selections, the fabric, reference images and
// the customer's brief/notes. Mirrors the order item detail modal so custom
// work reads consistently across the app.
//
// Responsive by construction: the shared Dialog renders a centered modal on
// desktop and a bottom sheet on mobile.

import React, { useMemo } from 'react';
import Image from 'next/image';
import { create, useModal } from '@ebay/nice-modal-react';
import { Shirt, Scissors, Palette, ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatNaira } from '../lib/order-fields';
import { OverlayScroll } from '@/components/OverlayScroll';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const firstImg = (images?: any[]): string | null => {
  if (!images?.length) return null;
  const f = images[0];
  if (typeof f === 'string') return f;
  if (f && typeof f === 'object' && f.url) return f.url;
  return null;
};

/* ------------------------------------------------------------------ */
/*  UI atoms                                                           */
/* ------------------------------------------------------------------ */

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5">
      {icon}
      <h4 className="text-xs font-semibold uppercase tracking-wider text-grey3 dark:text-gray-400">
        {title}
      </h4>
    </div>
    {children}
  </div>
);

const SpecRow: React.FC<{
  label: string;
  value: string;
  swatch?: string | null;
}> = ({ label, value, swatch }) => (
  <div className="flex items-center justify-between px-3 py-2.5">
    <span className="text-xs text-grey3 dark:text-gray-400">{label}</span>
    <span className="flex items-center gap-2 text-sm font-medium text-[#333333] dark:text-white">
      {swatch && (
        <span
          className="inline-block size-3.5 rounded-full border border-black/10"
          style={{ backgroundColor: swatch }}
        />
      )}
      {value}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const DesignDetailContent: React.FC<{ design: any }> = ({ design }) => {
  const images: string[] = design?.design_images ?? [];
  const refImages: string[] = design?.reference_images ?? [];
  const heroUrl = images[0] ?? null;

  const { notes, selections, brief } = useMemo(() => {
    try {
      const parsed = JSON.parse(design?.description ?? '{}');
      return {
        notes: parsed?.notes ?? '',
        selections: parsed?.selections ?? {},
        brief: parsed?.selections?.userPrompt ?? '',
      };
    } catch {
      return { notes: design?.description ?? '', selections: {}, brief: '' };
    }
  }, [design]);

  // Fabric can be a populated Product (with embedded .fabric) or a fabric doc.
  const fabricDoc = design?.fabric?.fabric ?? design?.fabric;
  const fabricName = fabricDoc?.name;
  const fabricImg = firstImg(fabricDoc?.images);
  const fabricSwatch = fabricDoc?.colors?.[0]?.hex ?? selections?.color;
  const pricePerYard = fabricDoc?.price_per_yard;

  // Style rows — only selections that resolved to a name + (ideally) an image.
  // Raw ids (unresolved strings) are skipped so we never show gibberish like "s2".
  const styleRows = (
    [
      ['Silhouette', selections?.silhouette],
      ['Neckline', selections?.neckline],
      ['Sleeve', selections?.sleeve],
      ['Collar', selections?.collar],
      ['Skirt', selections?.skirt],
      ['Trouser', selections?.trouser],
      ['Fit', selections?.fit],
    ] as [string, any][]
  )
    .map(([label, v]) =>
      v && typeof v === 'object' && v.name
        ? {
            label,
            name: v.name as string,
            image: v.image as string | undefined,
            emoji: v.emoji as string | undefined,
          }
        : null
    )
    .filter(Boolean) as {
    label: string;
    name: string;
    image?: string;
    emoji?: string;
  }[];

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="flex items-start gap-3.5">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-700">
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={design?.name ?? 'Design'}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <Shirt className="size-7 text-gray-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-[#0C0C0D] dark:text-white">
            {design?.name ?? 'Custom design'}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              Bespoke
            </span>
            {design?.category && (
              <span className="text-[11px] capitalize text-grey3 dark:text-gray-400">
                {design.category}
              </span>
            )}
            {design?.gender && (
              <span className="text-[11px] capitalize text-grey3 dark:text-gray-400">
                · {design.gender}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Customer brief (the prompt they described) */}
      {brief && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-900/20">
          <p className="text-xs italic leading-relaxed text-amber-800 dark:text-amber-200">
            &ldquo;{brief}&rdquo;
          </p>
        </div>
      )}

      {/* Design images */}
      {images.length > 0 && (
        <Section
          title="Design Images"
          icon={<ImageIcon className="size-3.5 text-grey3" />}
        >
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-border bg-gray-100"
              >
                <Image
                  src={img}
                  alt={`Design ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Fabric */}
      {fabricName && (
        <Section
          title="Fabric"
          icon={<Scissors className="size-3.5 text-grey3" />}
        >
          <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] dark:border-border bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] px-3 py-2.5">
            <div
              className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E7EB] dark:border-border bg-gray-100"
              style={
                !fabricImg && fabricSwatch
                  ? { backgroundColor: fabricSwatch }
                  : undefined
              }
            >
              {fabricImg ? (
                <Image
                  src={fabricImg}
                  alt={fabricName}
                  fill
                  className="object-cover"
                  sizes="44px"
                />
              ) : !fabricSwatch ? (
                <Scissors className="size-4 text-gray-400" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#333333] dark:text-white">
                {fabricName}
              </p>
              {pricePerYard ? (
                <p className="text-xs text-grey3 dark:text-gray-400">
                  {formatNaira(pricePerYard)}/yd
                </p>
              ) : null}
            </div>
          </div>
        </Section>
      )}

      {/* Style — each selection with its thumbnail + name */}
      {(styleRows.length > 0 || selections?.color) && (
        <Section
          title="Style"
          icon={<Palette className="size-3.5 text-grey3" />}
        >
          <div className="divide-y divide-[#F1F3F5] dark:divide-border rounded-xl border border-[#E5E7EB] dark:border-border bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949]">
            {styleRows.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E7EB] dark:border-border bg-gray-100 dark:bg-gray-700 text-lg">
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : s.emoji ? (
                    <span>{s.emoji}</span>
                  ) : (
                    <Palette className="size-4 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#333333] dark:text-white">
                    {s.name}
                  </p>
                  <p className="truncate text-xs text-grey3 dark:text-gray-400">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
            {selections?.color && (
              <SpecRow
                label="Colour"
                value={selections.color}
                swatch={selections.color}
              />
            )}
          </div>
        </Section>
      )}

      {/* Reference images */}
      {refImages.length > 0 && (
        <Section
          title="Reference Images"
          icon={<ImageIcon className="size-3.5 text-grey3" />}
        >
          <div className="flex gap-2 overflow-x-auto">
            {refImages.map((img, i) => (
              <div
                key={i}
                className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-border bg-gray-100"
              >
                <Image
                  src={img}
                  alt={`Reference ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Customer note */}
      {notes && (
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-grey3 dark:text-gray-400">
            Customer note
          </h4>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-900/20">
            <p className="text-xs italic leading-relaxed text-amber-800 dark:text-amber-200">
              &ldquo;{notes}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */

export const DesignDetailModal = create<{ design: any }>(({ design }) => {
  const { visible, hide, remove } = useModal();

  const onOpenChange = (open: boolean) => {
    if (!open) {
      hide();
      setTimeout(() => remove(), 300);
    }
  };

  return (
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-[520px] p-0 gap-0 bg-white dark:bg-card',
          'z-[60]'
        )}
      >
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="text-base font-semibold text-[#0C0C0D] dark:text-white">
            Design details
          </DialogTitle>
        </DialogHeader>
        <OverlayScroll className="max-h-[70vh] px-5 py-5 sm:max-h-[65vh]">
          <DesignDetailContent design={design} />
        </OverlayScroll>
      </DialogContent>
    </Dialog>
  );
});

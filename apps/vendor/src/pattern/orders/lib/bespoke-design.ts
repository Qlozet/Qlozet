// Bespoke design accessors.
//
// A bespoke order carries the customer's design on `bespoke_design`. The field
// is only *populated* on some responses — elsewhere it comes back as a bare
// ObjectId string — so every consumer has to check before rendering a preview.
// These helpers do that once, and normalise the image arrays, which the API
// sends either as plain URL strings or as `{ url }` objects.

import type { Order } from '@/redux/services/orders/orders.api-slice';

export interface BespokeDesignSummary {
  /** The populated design document. */
  design: Record<string, unknown>;
  /** Display name, never empty. */
  name: string;
  /** The chosen design, its back and any other versions shown, then the
   *  customer's references. */
  images: string[];
}

const toUrls = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (
        entry &&
        typeof entry === 'object' &&
        typeof (entry as { url?: unknown }).url === 'string'
      )
        return (entry as { url: string }).url.trim();
      return '';
    })
    .filter(Boolean);
};

export interface DesignViews {
  /** The version the customer chose: what the tailor makes. */
  chosen: string | null;
  /** Its back view, when the customer made one. */
  back: string | null;
  /** Other versions they kept; empty when they chose not to show them. */
  others: string[];
}

/**
 * What the tailor should see of a design. design_images[0] is the chosen
 * version; `back_views` ties a back to the front it was made from; and the
 * customer can hide the other versions (`show_other_versions: false`).
 */
export const designViews = (design: unknown): DesignViews => {
  const d = (design && typeof design === 'object' ? design : {}) as Record<
    string,
    unknown
  >;
  const fronts = toUrls(d.design_images);
  const chosen = fronts[0] ?? null;
  const backs = Array.isArray(d.back_views) ? (d.back_views as unknown[]) : [];
  const match = backs.find(
    (v) =>
      !!v &&
      typeof v === 'object' &&
      (v as { front?: unknown }).front === chosen &&
      typeof (v as { back?: unknown }).back === 'string'
  ) as { back: string } | undefined;
  return {
    chosen,
    back: match?.back?.trim() || null,
    others: d.show_other_versions === false ? [] : fronts.slice(1),
  };
};

/** The chosen design, its back, then any other versions shown to tailors. */
export const designImagesForTailor = (design: unknown): string[] => {
  const v = designViews(design);
  return [v.chosen, v.back, ...v.others].filter((x): x is string => !!x);
};

/**
 * The populated bespoke design on an order, or null when the order isn't
 * bespoke / the design wasn't populated.
 */
export const readBespokeDesign = (
  order: Pick<Order, 'bespoke_design'> | null | undefined
): BespokeDesignSummary | null => {
  const raw = (order as { bespoke_design?: unknown } | null | undefined)
    ?.bespoke_design;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const design = raw as Record<string, unknown>;
  const name =
    typeof design.name === 'string' && design.name.trim()
      ? design.name.trim()
      : 'Custom design';

  const images = Array.from(
    new Set([
      ...designImagesForTailor(design),
      ...toUrls(design.reference_images),
    ])
  );

  return { design, name, images };
};

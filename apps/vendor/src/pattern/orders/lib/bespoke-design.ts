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
  /** Generated design images first, then the customer's references. */
  images: string[];
}

const toUrls = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (entry && typeof entry === 'object' && typeof (entry as { url?: unknown }).url === 'string')
        return (entry as { url: string }).url.trim();
      return '';
    })
    .filter(Boolean);
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
      ...toUrls(design.design_images),
      ...toUrls(design.reference_images),
    ])
  );

  return { design, name, images };
};

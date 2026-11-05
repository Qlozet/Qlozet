/**
 * Default styles on a made-to-order listing — mirrors the backend rule in
 * products/style-defaults.ts (keep the two in step).
 *
 * Each part of the garment (neckline, sleeve, collar...) has one default:
 * the style the vendor marked, else the cheapest. Its price is included in
 * the listing price, and an order that leaves the part empty gets it.
 */

export const STYLE_PARTS = [
  'neckline',
  'sleeve',
  'collar',
  'skirt',
  'trouser',
  'full_body',
  'bodice',
  'hemline',
  'back',
] as const;

const PART_LABELS: Record<string, string> = {
  neckline: 'Neckline',
  sleeve: 'Sleeves',
  collar: 'Collar',
  skirt: 'Skirt',
  trouser: 'Trousers',
  full_body: 'Silhouette',
  bodice: 'Bodice',
  hemline: 'Hemline',
  back: 'Back',
};

const clean = (v: unknown) =>
  String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

interface StyleItemLike {
  id: string;
  category?: string;
  price: number;
  isDefault?: boolean;
  originalData?: { categories?: string[]; type?: string } | null;
}

/** The part a style tile belongs to, read the same way the backend reads it. */
export function partOf(item: StyleItemLike): string {
  const parts = STYLE_PARTS as readonly string[];
  const cats = [
    ...(item.originalData?.categories ?? []),
    item.category ?? '',
  ].map(clean);
  const type = clean(item.originalData?.type);
  return (
    cats.find((c) => parts.includes(c)) ??
    (parts.includes(type) ? type : null) ??
    (cats.find(Boolean) || type || 'other')
  );
}

export function partLabel(part: string): string {
  return (
    PART_LABELS[part] ??
    part.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
  );
}

/** Tile ids that are their part's default: the marked one, else the cheapest. */
export function defaultStyleIds(items: StyleItemLike[]): Set<string> {
  const marked = new Map<string, StyleItemLike>();
  const cheapest = new Map<string, StyleItemLike>();
  for (const it of items) {
    const part = partOf(it);
    if (it.isDefault && !marked.has(part)) marked.set(part, it);
    const best = cheapest.get(part);
    if (!best || (Number(it.price) || 0) < (Number(best.price) || 0))
      cheapest.set(part, it);
  }
  const ids = new Set<string>();
  for (const [part, it] of cheapest) ids.add((marked.get(part) ?? it).id);
  return ids;
}

/** Tiles grouped by part, in the order parts first appear. */
export function groupByPart<T extends StyleItemLike>(
  items: T[]
): { part: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const it of items) {
    const part = partOf(it);
    groups.set(part, [...(groups.get(part) ?? []), it]);
  }
  return [...groups].map(([part, list]) => ({ part, items: list }));
}

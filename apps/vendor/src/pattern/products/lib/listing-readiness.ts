/**
 * What a clothing listing needs before it can go live - the same rules the
 * server enforces on publish (listing-rules.ts in the backend), computed
 * live so the vendor sees them as a progress list while they type, not as a
 * toast after they have filled in the whole form.
 *
 * Pure: no React, no API. The card renders whatever this returns.
 */

export const LISTING_RULES = {
  TITLE_MIN: 10,
  TITLE_MAX: 120,
  DESCRIPTION_MIN: 150,
  MIN_PHOTOS: 3,
} as const;

/** The text a shopper reads: tags gone, entities decoded, spaces collapsed. */
export const visibleText = (html: string | undefined | null): string =>
  (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

export interface ReadinessVariant {
  sizes: { stock: number }[];
}

export interface ReadinessInput {
  title: string;
  descriptionHtml: string;
  photoCount: number;
  price: string | number;
  productType: string;
  audience: string;
  variants: ReadinessVariant[];
  /** Customers choose options and the vendor makes it: styles, fabrics, add-ons. */
  madeToOrder: boolean;
  turnaroundDays: string | number;
  /** Styles + fabrics + accessories + add-on variants the vendor has added. */
  optionCount: number;
}

export interface ReadinessItem {
  key: string;
  /** What is needed, with the live count where there is one. */
  label: string;
  ok: boolean;
}

export interface Readiness {
  items: ReadinessItem[];
  ready: boolean;
  done: number;
  total: number;
  /** The first unmet requirement, worded for a toast. Null when ready. */
  firstProblem: string | null;
}

const isShouting = (title: string) => {
  // Letters only: "2XL KAFTAN" is not shouting, "KAFTAN FOR MEN SALE" is.
  const letters = title.replace(/[^A-Za-z]/g, '');
  return letters.length >= 10 && letters === letters.toUpperCase();
};

export function listingReadiness(input: ReadinessInput): Readiness {
  const title = input.title.trim();
  const descriptionChars = visibleText(input.descriptionHtml).length;
  const price = Number(input.price);
  const items: ReadinessItem[] = [];

  const titleOk =
    title.length >= LISTING_RULES.TITLE_MIN &&
    title.length <= LISTING_RULES.TITLE_MAX &&
    !isShouting(title);
  items.push({
    key: 'title',
    label:
      title.length > LISTING_RULES.TITLE_MAX
        ? `Title under ${LISTING_RULES.TITLE_MAX} characters (${title.length})`
        : isShouting(title)
          ? 'Title in normal case, not all capitals'
          : `Title of ${LISTING_RULES.TITLE_MIN}+ characters (${title.length})`,
    ok: titleOk,
  });

  items.push({
    key: 'description',
    label: `Description of ${LISTING_RULES.DESCRIPTION_MIN}+ characters (${descriptionChars})`,
    ok: descriptionChars >= LISTING_RULES.DESCRIPTION_MIN,
  });

  items.push({
    key: 'photos',
    label: `${LISTING_RULES.MIN_PHOTOS}+ photos (${input.photoCount})`,
    ok: input.photoCount >= LISTING_RULES.MIN_PHOTOS,
  });

  items.push({ key: 'price', label: 'A price above ₦0', ok: price > 0 });
  items.push({
    key: 'type',
    label: 'Product type chosen',
    ok: Boolean(input.productType),
  });
  items.push({
    key: 'audience',
    label: 'Audience chosen',
    ok: Boolean(input.audience),
  });

  const hasVariants = input.variants.length > 0;
  const anyStock = input.variants.some((v) =>
    v.sizes.some((s) => (s.stock ?? 0) > 0)
  );
  if (input.madeToOrder) {
    // Made to order: colours and sizes are optional; if listed, something
    // must be in stock, as the server checks.
    if (hasVariants) {
      items.push({
        key: 'stock',
        label: 'Stock on at least one size',
        ok: anyStock,
      });
    }
    items.push({
      key: 'turnaround',
      label: 'Days to make it (1 or more)',
      ok: Number(input.turnaroundDays) >= 1,
    });
    items.push({
      key: 'options',
      label: 'At least one style, fabric or add-on option',
      ok: input.optionCount > 0,
    });
  } else {
    items.push({
      key: 'stock',
      label: hasVariants
        ? 'Stock on at least one size'
        : 'At least one colour with sizes and stock',
      ok: hasVariants && anyStock,
    });
  }

  const done = items.filter((i) => i.ok).length;
  const first = items.find((i) => !i.ok) ?? null;
  return {
    items,
    ready: done === items.length,
    done,
    total: items.length,
    firstProblem: first ? `Still needed: ${first.label.toLowerCase()}.` : null,
  };
}

export interface FabricReadinessInput {
  title: string;
  description: string;
  photoCount: number;
  material: string;
  pricePerYard: string | number;
  yardsInStock: string | number;
  minCut: string | number;
  widthInches: string | number;
  /** How it is sold: 'yard' (default), 'piece' (whole pieces) or 'both'. */
  soldBy?: 'yard' | 'piece' | 'both';
  pieceYards?: string | number;
  piecePrice?: string | number;
}

/**
 * A fabric listing's publish rules: the server's general ones (title,
 * description, photos, price) plus what a bolt needs to be sellable - stock
 * in yards, a minimum cut a shopper can actually buy, and a width.
 */
export function fabricReadiness(input: FabricReadinessInput): Readiness {
  const title = input.title.trim();
  const descriptionChars = visibleText(input.description).length;
  const price = Number(input.pricePerYard) || 0;
  const yards = Number(input.yardsInStock) || 0;
  const minCut = Number(input.minCut) || 0;
  const width = Number(input.widthInches) || 0;
  const soldBy = input.soldBy ?? 'yard';
  const byYard = soldBy !== 'piece';
  const byPiece = soldBy !== 'yard';
  const pieceYards = Number(input.pieceYards) || 0;
  const piecePrice = Number(input.piecePrice) || 0;
  const items: ReadinessItem[] = [];

  items.push({
    key: 'title',
    label:
      title.length > LISTING_RULES.TITLE_MAX
        ? `Name under ${LISTING_RULES.TITLE_MAX} characters (${title.length})`
        : isShouting(title)
          ? 'Name in normal case, not all capitals'
          : `Name of ${LISTING_RULES.TITLE_MIN}+ characters (${title.length})`,
    ok:
      title.length >= LISTING_RULES.TITLE_MIN &&
      title.length <= LISTING_RULES.TITLE_MAX &&
      !isShouting(title),
  });
  items.push({
    key: 'description',
    label: `Description of ${LISTING_RULES.DESCRIPTION_MIN}+ characters (${descriptionChars})`,
    ok: descriptionChars >= LISTING_RULES.DESCRIPTION_MIN,
  });
  items.push({
    key: 'photos',
    label: `${LISTING_RULES.MIN_PHOTOS}+ photos (${input.photoCount})`,
    ok: input.photoCount >= LISTING_RULES.MIN_PHOTOS,
  });
  items.push({
    key: 'material',
    label: 'Material chosen',
    ok: Boolean(input.material),
  });
  // Mirrors the backend's normaliseFabricPieces (products/fabric-pieces).
  if (byYard) {
    items.push({
      key: 'price',
      label: 'A price per yard above ₦0',
      ok: price > 0,
    });
  }
  items.push({ key: 'stock', label: 'Yards in stock above 0', ok: yards > 0 });
  if (byYard) {
    items.push({
      key: 'min_cut',
      label:
        minCut > yards && yards > 0
          ? 'Minimum cut no more than the yards in stock'
          : 'A minimum cut of at least 0.1 yards',
      ok: minCut >= 0.1 && (yards <= 0 || minCut <= yards),
    });
  }
  if (byPiece) {
    items.push({
      key: 'piece_yards',
      label:
        pieceYards > yards && yards > 0
          ? 'A piece no longer than the yards in stock'
          : 'Yards in one piece (at least 0.5)',
      ok: pieceYards >= 0.5 && (yards <= 0 || pieceYards <= yards),
    });
    items.push({
      key: 'piece_price',
      label: 'A price per piece above ₦0',
      ok: piecePrice > 0,
    });
  }
  items.push({
    key: 'width',
    label: 'Width of at least 10 inches',
    ok: width >= 10,
  });

  const done = items.filter((i) => i.ok).length;
  const first = items.find((i) => !i.ok) ?? null;
  return {
    items,
    ready: done === items.length,
    done,
    total: items.length,
    firstProblem: first ? `Still needed: ${first.label.toLowerCase()}.` : null,
  };
}

export interface AccessoryReadinessInput {
  title: string;
  description: string;
  photoCount: number;
  price: string | number;
  productType: string;
  audience: string;
  variants: ReadinessVariant[];
}

/**
 * An accessory's publish rules: the server's general ones plus at least one
 * colour with stock, since the table is what a shopper buys from.
 */
export function accessoryReadiness(input: AccessoryReadinessInput): Readiness {
  const title = input.title.trim();
  const descriptionChars = visibleText(input.description).length;
  const price = Number(input.price) || 0;
  const items: ReadinessItem[] = [];

  items.push({
    key: 'title',
    label:
      title.length > LISTING_RULES.TITLE_MAX
        ? `Name under ${LISTING_RULES.TITLE_MAX} characters (${title.length})`
        : isShouting(title)
          ? 'Name in normal case, not all capitals'
          : `Name of ${LISTING_RULES.TITLE_MIN}+ characters (${title.length})`,
    ok:
      title.length >= LISTING_RULES.TITLE_MIN &&
      title.length <= LISTING_RULES.TITLE_MAX &&
      !isShouting(title),
  });
  items.push({
    key: 'description',
    label: `Description of ${LISTING_RULES.DESCRIPTION_MIN}+ characters (${descriptionChars})`,
    ok: descriptionChars >= LISTING_RULES.DESCRIPTION_MIN,
  });
  items.push({
    key: 'photos',
    label: `${LISTING_RULES.MIN_PHOTOS}+ photos (${input.photoCount})`,
    ok: input.photoCount >= LISTING_RULES.MIN_PHOTOS,
  });
  items.push({ key: 'price', label: 'A price above ₦0', ok: price > 0 });
  items.push({
    key: 'type',
    label: 'Product type chosen',
    ok: Boolean(input.productType),
  });
  items.push({
    key: 'audience',
    label: 'Audience chosen',
    ok: Boolean(input.audience),
  });
  const hasVariants = input.variants.length > 0;
  const anyStock = input.variants.some((v) =>
    v.sizes.some((s) => (s.stock ?? 0) > 0)
  );
  items.push({
    key: 'stock',
    label: hasVariants
      ? 'Stock on at least one colour'
      : 'At least one colour with stock',
    ok: hasVariants && anyStock,
  });

  const done = items.filter((i) => i.ok).length;
  const first = items.find((i) => !i.ok) ?? null;
  return {
    items,
    ready: done === items.length,
    done,
    total: items.length,
    firstProblem: first ? `Still needed: ${first.label.toLowerCase()}.` : null,
  };
}

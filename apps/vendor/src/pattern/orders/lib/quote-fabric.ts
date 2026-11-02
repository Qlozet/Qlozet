// Fabric on a bespoke quote, as GET /bespoke/quotes/:id returns it
// (`fabric_offer`). Mirrors the backend's bespoke/quote-fabric.ts so the
// tailor sees the same fabric price the customer will be charged; the backend
// recomputes it on every save, so this is only ever a live preview.
//
// - other_vendor:   the customer picked another vendor's fabric. Priced from
//                   that listing, paid by the customer ON TOP of the quote.
// - tailor_stock:   a fabric from this tailor's own shop. Priced from their
//                   listing, a line of the quote.
// - tailor_sourced: no fabric chosen; the tailor types what buying it costs.

export type FabricSource = 'other_vendor' | 'tailor_stock' | 'tailor_sourced';

export interface FabricOffer {
  source: FabricSource;
  product?: string;
  name?: string | null;
  supplier_name?: string | null;
  sold_by?: 'yard' | 'piece' | 'both';
  price_per_yard?: number | null;
  piece_yards?: number | null;
  piece_price?: number | null;
  min_cut?: number | null;
  yards_in_stock?: number | null;
}

/**
 * A garment can need more than one fabric: the main one plus a contrast and
 * a lining (`extra_fabric_offers`, one per role). Each is priced the same way
 * and, when inside the quote, has its own line: "Fabric", "Fabric (Lining)".
 */
export type FabricRole = 'main' | 'contrast' | 'lining';

export const FABRIC_ROLE_NAMES: Record<FabricRole, string> = {
  main: 'Fabric',
  contrast: 'Contrast fabric',
  lining: 'Lining',
};

export const fabricLineLabel = (role: FabricRole = 'main') =>
  role === 'main'
    ? 'Fabric'
    : `Fabric (${role[0].toUpperCase()}${role.slice(1)})`;

export const isFabricLine = (label?: string, role: FabricRole = 'main') =>
  String(label ?? '')
    .trim()
    .toLowerCase() === fabricLineLabel(role).toLowerCase();

/** Any fabric line, whichever fabric it is for. */
export const isAnyFabricLine = (label?: string) =>
  (['main', 'contrast', 'lining'] as FabricRole[]).some((r) =>
    isFabricLine(label, r)
  );

/** Yards charged for and their cost (whole pieces for piece-only fabric). */
export function priceFabricOffer(
  offer: FabricOffer | null | undefined,
  yards: number
): { yards: number; pieces: number | null; cost: number } {
  if (!offer || offer.source === 'tailor_sourced' || !(yards > 0)) {
    return { yards: yards > 0 ? yards : 0, pieces: null, cost: 0 };
  }
  const pieceYards = Number(offer.piece_yards);
  const piecePrice = Number(offer.piece_price);
  if (offer.sold_by === 'piece' && pieceYards > 0 && piecePrice > 0) {
    const pieces = Math.ceil(yards / pieceYards - 1e-9);
    return {
      yards: pieces * pieceYards,
      pieces,
      cost: Math.round(pieces * piecePrice),
    };
  }
  return {
    yards,
    pieces: null,
    cost: Math.round(yards * (Number(offer.price_per_yard) || 0)),
  };
}

/**
 * What the customer pays when they accept: the percentage of the quote, or
 * the fabric inside it if that is more (the tailor pays for fabric before
 * cutting). null = the whole quote is charged at once.
 */
export function depositFor(
  total: number,
  percent: number,
  fabricInQuote: number
): { amount: number; coversFabric: boolean } | null {
  if (!(percent > 0 && percent < 100) || total < 2) return null;
  if (fabricInQuote >= total) return null;
  const byPercent = Math.round((total * percent) / 100);
  const amount = Math.min(Math.max(byPercent, fabricInQuote, 1), total - 1);
  return { amount, coversFabric: fabricInQuote > byPercent };
}

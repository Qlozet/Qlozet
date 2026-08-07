// Percentage-change label for the metric cards.
//
// The backend exposes no period-over-period figures on /admin/dashboard — only
// current totals. So a change is only shown where we can derive it from a real
// "added this period" count. A card with no such source shows no change widget
// at all, rather than a placeholder like "2.5%".

/**
 * Growth versus the start of the period, given how many of `total` were added
 * during it.
 *
 *   previous = total - addedThisPeriod
 *   change   = addedThisPeriod / previous
 *
 * Returns null when the figure would be meaningless or misleading:
 *  - either input missing (nothing to compute from)
 *  - previous <= 0, so the change is undefined or infinite (e.g. the very
 *    first vendors ever added would read as "+∞%")
 *  - nothing was added, which is a flat 0% rather than a trend worth showing
 */
export const periodChangeLabel = (
  total: number | undefined,
  addedThisPeriod: number | undefined
): string | undefined => {
  if (typeof total !== 'number' || typeof addedThisPeriod !== 'number') {
    return undefined;
  }
  if (addedThisPeriod <= 0) return undefined;

  const previous = total - addedThisPeriod;
  if (previous <= 0) return undefined;

  const pct = (addedThisPeriod / previous) * 100;
  // One decimal, but drop a trailing ".0" so round numbers read cleanly.
  const formatted = pct.toFixed(1).replace(/\.0$/, '');
  return `${formatted}%`;
};

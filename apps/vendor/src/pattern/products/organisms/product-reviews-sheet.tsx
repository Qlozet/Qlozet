'use client';

import { create, useModal } from '@ebay/nice-modal-react';
import { Loader2, Star } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  useGetProductRatingsQuery,
  useGetVendorProductRatingsQuery,
} from '@/redux/services/products/products.api-slice';

// ─── Reviews sheet ────────────────────────────────────────────
// One sheet, two modes:
//   • { productId } → reviews for a single product (GET /products/:id/ratings)
//   • { businessId } → reviews across the vendor's products
//                      (GET /products/ratings/vendor)
// Mirrors the shop's vendor-profile reviews sheet: average + star breakdown +
// review list. Opened via NiceModal.show(ProductReviewsSheet, { productId }).

interface ProductReviewsSheetProps {
  productId?: string;
  businessId?: string;
  title?: string;
}

interface NormalReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  product?: string;
}

const BAND_LABELS = ['Excellent', 'Good', 'Average', 'Avg. Below', 'Poor'];

function dateFromObjectId(id?: string): string {
  if (!id || typeof id !== 'string' || id.length < 8) return '';
  const secs = parseInt(id.substring(0, 8), 16);
  if (!secs) return '';
  const diff = Date.now() - secs * 1000;
  const day = 86400000;
  if (diff < day) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return new Date(secs * 1000).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Amber stars, matching the shop's vendor-profile reviews sheet (#F5A623).
function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const on = s <= Math.round(value);
        return (
          <Star
            key={s}
            style={{
              width: size,
              height: size,
              fill: on ? '#F5A623' : 'none',
              color: on ? '#F5A623' : '#D0D0D0',
            }}
          />
        );
      })}
    </div>
  );
}

export const ProductReviewsSheet = create<ProductReviewsSheetProps>(
  ({ productId, businessId, title }) => {
    const { visible, hide, remove } = useModal();
    const close = () => {
      hide();
      setTimeout(remove, 200);
    };

    const productQ = useGetProductRatingsQuery(productId ?? '', {
      skip: !productId,
    });
    const vendorQ = useGetVendorProductRatingsQuery(
      { business_id: businessId ?? '' },
      { skip: !businessId },
    );

    const isLoading = productId ? productQ.isLoading : vendorQ.isLoading;
    const raw = (productId ? productQ.data : vendorQ.data) as any;
    const data = raw?.data ?? raw;

    // ── Normalise both shapes into { average, total, breakdown, reviews } ──
    let average = 0;
    let total = 0;
    let breakdown: { label: string; count: number }[] = [];
    let reviews: NormalReview[] = [];

    if (productId && data) {
      const ratings: any[] = Array.isArray(data.ratings) ? data.ratings : [];
      average = data.average ?? 0;
      total = data.total_reviews ?? ratings.length;
      const counts = [0, 0, 0, 0, 0]; // index 0 = 5 stars … 4 = 1 star
      ratings.forEach((r) => {
        const v = Math.round(r?.value ?? 0);
        if (v >= 1 && v <= 5) counts[5 - v] += 1;
      });
      breakdown = BAND_LABELS.map((label, i) => ({ label, count: counts[i] }));
      reviews = ratings
        .filter((r) => typeof r?.value === 'number')
        .map((r, i) => ({
          id: r._id || String(i),
          name:
            (r.user && typeof r.user === 'object'
              ? r.user.name || r.user.email?.split('@')[0]
              : '') || 'Verified buyer',
          rating: r.value,
          comment: r.comment || '',
          date: dateFromObjectId(r._id),
        }));
    } else if (businessId && data) {
      const s = data.summary ?? {};
      average = s.average_rating ?? 0;
      total = s.total_reviews ?? 0;
      breakdown = [
        { label: 'Excellent', count: s.five_star ?? 0 },
        { label: 'Good', count: s.four_star ?? 0 },
        { label: 'Average', count: s.three_star ?? 0 },
        { label: 'Below avg.', count: s.two_star ?? 0 },
        { label: 'Poor', count: s.one_star ?? 0 },
      ];
      const rows: any[] = Array.isArray(data.reviews) ? data.reviews : [];
      reviews = rows.map((r, i) => ({
        id: String(r.created_at || i),
        name:
          r.reviewer?.name ||
          r.reviewer?.email?.split('@')[0] ||
          'Verified buyer',
        rating: r.rating || 0,
        comment: r.comment || '',
        date: dateFromObjectId(
          typeof r.created_at === 'string' ? r.created_at : undefined,
        ),
        product: r.product_name,
      }));
    }

    const maxCount = Math.max(1, ...breakdown.map((b) => b.count));

    return (
      <Sheet open={visible} onOpenChange={close}>
        <SheetContent
          side="right"
          className="flex w-full flex-col !overflow-hidden p-0 sm:max-w-[440px] !top-6 !bottom-6 !right-6 rounded-2xl custom-card-shadow bg-white dark:bg-card"
          style={{ height: 'calc(100vh - 3rem)' }}
        >
          {/* Header — matches the order-details sheet's bordered header. */}
          <div className="shrink-0 border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-grey-black dark:text-white">
              {title || 'Reviews'}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Summary + breakdown — one card (order-details card colouring). */}
            <div className="mb-4 rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] dark:border dark:border-border p-5">
              <div className="flex items-center gap-2">
                <Stars value={average} size={16} />
                <span className="text-[18px] font-bold text-grey-black dark:text-white">
                  {Number(average || 0).toFixed(1)}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-grey3 dark:text-gray-400">
                {total > 0
                  ? `Overall rating from ${total} customer review${total === 1 ? '' : 's'}`
                  : 'No reviews yet'}
              </p>

              {total > 0 && (
                <div className="mt-5 flex flex-col gap-2.5">
                  {breakdown.map((b) => (
                    <div key={b.label} className="flex items-center gap-3">
                      <span className="w-[70px] shrink-0 text-xs font-medium text-grey3 dark:text-gray-400">
                        {b.label}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-grey-black dark:bg-white"
                          style={{ width: `${Math.round((b.count / maxCount) * 100)}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-xs font-semibold text-grey3 dark:text-gray-400">
                        {String(b.count).padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Individual reviews — each in its own card, like the order sheet. */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-grey3" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-grey3 dark:text-gray-400">No reviews yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] dark:border dark:border-border p-4"
                  >
                    <div className="mb-2.5 flex items-center justify-between">
                      <Stars value={r.rating} />
                      {r.date && (
                        <span className="text-[11px] text-grey3 dark:text-gray-400">
                          {r.date}
                        </span>
                      )}
                    </div>
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-[15px] font-bold text-grey-black dark:text-white">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-grey-black dark:text-white">
                          {r.name}
                        </p>
                        {r.product && (
                          <p className="truncate text-[11px] text-grey3 dark:text-gray-400">
                            {r.product}
                          </p>
                        )}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-[13px] leading-relaxed text-grey3 dark:text-gray-300">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

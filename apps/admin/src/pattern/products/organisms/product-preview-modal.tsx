'use client';

// "Preview" — the listing as a customer sees it.
//
// There is no customer storefront in this repo to link out to, so the shopper's
// view is rendered here from the same document the detail page already holds.
// That is the more useful thing anyway: the question a moderator opens Preview
// to answer is "is this listing fit to show?", and the honest answer has two
// halves — what it looks like, and whether a customer can see it at all. The
// banner covers the second, using the same gate the API applies.

import { useMemo, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { ChevronLeft, ChevronRight, EyeOff, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import {
  getColourOptions,
  getProductDescription,
  getProductImages,
  getProductName,
  getProductPrice,
  getProductQuantity,
  getProductVendorName,
  getStorefrontVisibility,
  getTurnaroundDays,
  isCustomisable,
} from '@/lib/products';
import type { Product } from '@/redux/services/products/products.api-slice';

interface ProductPreviewModalProps {
  product: Product;
}

/** Struck-through original, shown only when the sale price actually undercuts it. */
const CompareAtPrice = ({ product }: { product: Product }) => {
  const base =
    typeof product.base_price === 'number' ? product.base_price : undefined;
  const effective = getProductPrice(product);
  if (base === undefined || effective === undefined || effective >= base) {
    return null;
  }
  return (
    <span className="text-base font-normal text-muted-foreground line-through">
      {formatCurrency(base, 'NGN')}
    </span>
  );
};

export const ProductPreviewModal = NiceModal.create<ProductPreviewModalProps>(
  ({ product }) => {
    const modal = useModal();
    const [active, setActive] = useState(0);
    const [colourIndex, setColourIndex] = useState(0);

    const images = useMemo(() => getProductImages(product), [product]);
    const colours = useMemo(() => getColourOptions(product), [product]);
    const visibility = useMemo(
      () => getStorefrontVisibility(product),
      [product]
    );

    if (!modal.visible) return null;

    const close = () => modal.remove();
    const name = getProductName(product);
    const price = getProductPrice(product);
    const description = getProductDescription(product);
    const turnaround = getTurnaroundDays(product);
    const { stock } = getProductQuantity(product);
    const colour = colours[colourIndex];
    const rating =
      typeof product.average_rating === 'number' ? product.average_rating : 0;

    const step = (delta: number) =>
      setActive((current) =>
        images.length ? (current + delta + images.length) % images.length : 0
      );

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={close}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Customer preview of ${name}`}
          className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Customer preview
              </h2>
              <p className="text-xs text-muted-foreground">
                How this listing appears to a shopper.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close preview"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* The half of the answer a rendering alone can't give. */}
          {!visibility.visible && (
            <div className="flex shrink-0 items-start gap-3 border-b border-warning/30 bg-warning/10 px-5 py-3">
              <EyeOff className="mt-0.5 size-4 shrink-0 text-warning" />
              <div className="text-xs text-foreground">
                <p className="font-semibold">
                  No customer can see this listing right now.
                </p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
                  {visibility.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 md:grid-cols-2">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl bg-accent">
                <div className="relative aspect-[4/5] w-full">
                  {images[active] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={images[active]}
                      alt={name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                      This listing has no images
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-grey-black shadow hover:bg-white"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-grey-black shadow hover:bg-white"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((url, index) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`Image ${index + 1}`}
                      className={cn(
                        'size-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-accent',
                        index === active
                          ? 'border-primary'
                          : 'border-transparent'
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Shopper-facing detail */}
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
                {getProductVendorName(product)}
              </p>

              <h3 className="text-2xl font-bold text-foreground">{name}</h3>

              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                {rating.toFixed(1)}
                <span className="text-muted-foreground">
                  ({Array.isArray(product.ratings) ? product.ratings.length : 0}
                  )
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-foreground">
                  {price !== undefined ? formatCurrency(price, 'NGN') : '—'}
                </span>
                <CompareAtPrice product={product} />
              </div>

              {description && (
                <div
                  className="prose-sm max-w-none text-sm leading-relaxed text-muted-foreground [&_*]:!m-0"
                  // The vendor writes the description in a rich-text editor, so
                  // it arrives as HTML; a customer sees it rendered.
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}

              {colours.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">
                    Colour:{' '}
                    <span className="text-muted-foreground">
                      {colour?.name}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colours.map((option, index) => (
                      <button
                        key={`${option.hex}-${index}`}
                        type="button"
                        onClick={() => setColourIndex(index)}
                        aria-label={option.name}
                        aria-pressed={index === colourIndex}
                        style={{ backgroundColor: option.hex }}
                        className={cn(
                          'size-7 cursor-pointer rounded-full border-2 transition',
                          index === colourIndex
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-border'
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {colour && colour.sizes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {colour.sizes.map((size) => (
                      <span
                        key={size.size}
                        // A shopper can't pick what isn't there — sold-out
                        // sizes read as unavailable, exactly as in the shop.
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-xs font-medium',
                          size.stock > 0
                            ? 'border-border text-foreground'
                            : 'border-dashed border-border text-muted-foreground line-through'
                        )}
                      >
                        {size.size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1 text-xs text-muted-foreground">
                {isCustomisable(product) ? (
                  <p>
                    Made to order
                    {turnaround ? ` · ready in about ${turnaround} days` : ''}
                  </p>
                ) : (
                  <p>{stock > 0 ? `${stock} in stock` : 'Out of stock'}</p>
                )}
              </div>

              {/* Inert on purpose: this is a preview, not the shop. */}
              <Button
                type="button"
                disabled
                title="Preview only — nothing here is clickable for the customer"
                className="h-11 w-full"
              >
                Add to cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

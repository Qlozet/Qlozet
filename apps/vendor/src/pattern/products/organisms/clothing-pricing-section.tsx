'use client';

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '../atoms/field-label';

interface ProductPricingSectionProps {
  price: string;
  onPriceChange: (value: string) => void;
  /** Where sales live. The old free-text "discount" box here was saved into a field nothing read. */
  discountsHref?: string;
}

// Pricing card: the selling price in naira. Sales are set up on the
// Discounts page, where they have dates, scope and a real effect.
export const ProductPricingSection = ({
  price,
  onPriceChange,
  discountsHref,
}: ProductPricingSectionProps) => {
  return (
    <div className="surface-card p-6">
      <h3 className="mb-4 text-sm font-semibold text-grey-black dark:text-white">
        Pricing
      </h3>

      <div className="space-y-3">
        <div>
          <FieldLabel
            htmlFor="product-price"
            tooltip="What a shopper pays for the garment. Per-size extras are added on top in the variants table."
          >
            Price
          </FieldLabel>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ₦
            </span>
            <Input
              id="product-price"
              type="number"
              min={0}
              step="100"
              inputMode="numeric"
              placeholder="0"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              className="bg-background pl-7"
            />
          </div>
        </div>

        {discountsHref && (
          <p className="text-xs text-muted-foreground">
            Running a sale?{' '}
            <Link
              href={discountsHref}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Create a discount
            </Link>{' '}
            and apply it to this product.
          </p>
        )}
      </div>
    </div>
  );
};

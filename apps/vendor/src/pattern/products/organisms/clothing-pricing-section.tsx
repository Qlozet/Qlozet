'use client';

import { Input } from '@/components/ui/input';
import { FieldLabel } from '../atoms/field-label';

interface ProductPricingSectionProps {
  price: string;
  onPriceChange: (value: string) => void;
  discount: string;
  onDiscountChange: (value: string) => void;
}

// Pricing card: base price (with $ adornment) and an optional discount.
export const ProductPricingSection = ({
  price,
  onPriceChange,
  discount,
  onDiscountChange,
}: ProductPricingSectionProps) => {
  return (
    <div className="rounded-lg bg-card p-6 custom-card-shadow">
      <h3 className="mb-4 text-sm font-semibold text-grey-black dark:text-white">
        Pricing
      </h3>

      <div className="space-y-3">
        <div>
          <FieldLabel htmlFor="product-price" tooltip="Enter the product price">
            Price
          </FieldLabel>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="product-price"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              className="bg-background pl-7"
            />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="product-discount" tooltip="Optional discount amount">
            Available discount?
          </FieldLabel>
          <Input
            id="product-discount"
            placeholder="e.g. 20% off"
            value={discount}
            onChange={(e) => onDiscountChange(e.target.value)}
            className="bg-background"
          />
        </div>
      </div>
    </div>
  );
};

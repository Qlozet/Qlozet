'use client';

// Earnings — bespoke order drawer.
//
// The agreed amount is the accepted quote's line items plus the delivery fee.
// Totals are summed here rather than read from a single field so the figure
// always matches the lines above it.

import React from 'react';
import { Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNaira } from '../lib/order-fields';
import type { QuoteLineItem } from '@/redux/services/bespoke/bespoke.api-slice';

interface OrderEarningsCardProps {
  lineItems: QuoteLineItem[];
  /** Customer-paid delivery, shown as its own line. */
  deliveryFee?: number;
}

export const OrderEarningsCard = ({
  lineItems,
  deliveryFee,
}: OrderEarningsCardProps) => {
  const rows: { label: string; amount: number }[] = [
    ...lineItems.map((li) => ({ label: li.label, amount: li.amount || 0 })),
    ...(typeof deliveryFee === 'number'
      ? [{ label: 'Delivery fees:', amount: deliveryFee }]
      : []),
  ];

  if (rows.length === 0) return null;

  const total = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <section className="space-y-3 rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4">
      <div>
        <h3 className="text-base font-semibold text-grey-black dark:text-white">
          Earnings
        </h3>
        <p className="text-xs text-grey2 dark:text-gray-400">Agreed amount</p>
      </div>

      <div className="rounded-xl border border-border bg-white dark:bg-[#404040] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-grey-black dark:text-white">
            Earnings break down
          </span>
          <Calculator className="size-4 text-grey3 dark:text-gray-300" />
        </div>

        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={`${row.label}-${index}`}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-sm text-grey3 dark:text-gray-300">
                {row.label}
              </span>
              <span className="text-sm font-semibold text-grey-black dark:text-white">
                {formatNaira(row.amount)}
              </span>
            </div>
          ))}
        </div>

        <div
          className={cn(
            'mt-3 flex items-center justify-between border-t border-border pt-3'
          )}
        >
          <span className="text-sm font-bold text-grey-black dark:text-white">
            TOTAL:
          </span>
          <span className="text-sm font-bold text-grey-black dark:text-white">
            {formatNaira(total)}
          </span>
        </div>
      </div>
    </section>
  );
};

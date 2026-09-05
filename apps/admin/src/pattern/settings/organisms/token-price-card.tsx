'use client';

// Token Price Card - Organism
// The token price is a pair, not a field: an administrator sets it in USD, and
// the backend converts to naira — nightly at 3AM, or on demand here. So USD is
// an input and NGN is a readout with a refresh, rather than two inputs that can
// disagree. Styled to match the settings cards: tinted icon header, divided
// rows, control on the right.

import React from 'react';
import { Coins, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNaira } from '@/lib/orders';
import { formatDate } from '@/lib/customers';
import { TOKEN_PRICE_USD_FIELD } from '../lib/settings-tabs';
import type { DraftValue } from '../lib/settings-form';
import { SettingsField } from '../molecules/settings-field';
import type { TokenPrice } from '@/redux/services/settings/settings.api-slice';

interface TokenPriceCardProps {
  value: DraftValue;
  error?: string;
  tokenPrice?: TokenPrice;
  disabled?: boolean;
  isRefreshing?: boolean;
  /** The form has edits that have not been saved yet. */
  isDirty?: boolean;
  onChange: (value: DraftValue) => void;
  onRefresh: () => void;
}

export const TokenPriceCard = ({
  value,
  error,
  tokenPrice,
  disabled,
  isRefreshing,
  isDirty,
  onChange,
  onRefresh,
}: TokenPriceCardProps) => {
  const ngnAmount = tokenPrice?.ngn?.amount;
  const lastUpdated = tokenPrice?.ngn?.last_updated;

  return (
    <section className="rounded-xl bg-white p-5 custom-card-shadow dark:border dark:border-white/10 dark:bg-card lg:p-6">
      {/* Card Header */}
      <div className="mb-5 flex items-start gap-2.5 border-b border-border/60 pb-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
          <Coins className="size-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-grey-black dark:text-white">
            Token price
          </h3>
          <p className="mt-0.5 text-xs text-grey3 dark:text-gray-400">
            Customers buy tokens in naira. The naira price is converted from the
            USD price at the day’s rate, automatically each night.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/40">
        <SettingsField
          spec={TOKEN_PRICE_USD_FIELD}
          value={value}
          error={error}
          disabled={disabled}
          onChange={onChange}
        />

        {/* Naira readout row — derived, so it renders as a value, not an input. */}
        <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-grey-black dark:text-white">
              Naira price
            </p>
            <p className="mt-0.5 text-xs text-grey3 dark:text-gray-400">
              Derived from the USD price — last refreshed{' '}
              {formatDate(lastUpdated)}.
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-gray-50 px-3 py-1.5 text-sm font-semibold text-grey-black dark:bg-muted dark:text-white">
            {typeof ngnAmount === 'number' ? formatNaira(ngnAmount) : '—'}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-border/60 pt-4 max-sm:items-start sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-grey3 dark:text-gray-400">
          {isDirty
            ? 'Save your changes first — the conversion runs off the saved USD price.'
            : 'Refreshing re-converts the saved USD price at today’s rate.'}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          // Refreshing rewrites the settings document, which re-reads the form.
          // Blocking it while there are unsaved edits keeps that from quietly
          // throwing them away — and from converting a price that is not saved.
          disabled={disabled || isRefreshing || isDirty}
          onClick={onRefresh}
        >
          <RefreshCw className={isRefreshing ? 'animate-spin' : undefined} />
          {isRefreshing ? 'Refreshing…' : 'Refresh naira price'}
        </Button>
      </div>
    </section>
  );
};

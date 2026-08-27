'use client';

// Token Price Card - Organism
// The token price is a pair, not a field: an administrator sets it in USD, and
// the backend converts to naira — nightly at 3AM, or on demand here. So USD is
// an input and NGN is a readout with a refresh, rather than two inputs that can
// disagree.

import React from 'react';
import { RefreshCw } from 'lucide-react';
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
    <section className="rounded-2xl border border-border bg-white dark:bg-card p-5">
      <header className="space-y-1">
        <h2 className="text-base font-bold text-grey-black dark:text-white">
          Token price
        </h2>
        <p className="text-sm text-grey3 dark:text-gray-400">
          Customers buy tokens in naira. The naira price is converted from the
          USD price at the day’s rate, automatically each night.
        </p>
      </header>

      <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <SettingsField
          spec={TOKEN_PRICE_USD_FIELD}
          value={value}
          error={error}
          disabled={disabled}
          onChange={onChange}
        />

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-grey-black dark:text-white">
            Naira price
          </span>
          <div className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3">
            <span className="text-sm font-semibold text-grey-black dark:text-white">
              {typeof ngnAmount === 'number' ? formatNaira(ngnAmount) : '—'}
            </span>
          </div>
          <p className="text-xs text-grey3 dark:text-gray-400">
            Derived from the USD price — last refreshed{' '}
            {formatDate(lastUpdated)}.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4 max-sm:items-start sm:flex-row sm:items-center sm:justify-between">
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

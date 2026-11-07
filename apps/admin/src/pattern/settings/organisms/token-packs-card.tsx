'use client';

// Token Packs Card - Organism
// The packs customers and vendors buy, for the shop, the vendor app and the
// phone apps alike. Each pack has a round naira price and, on bigger packs,
// free bonus tokens, so "best value" is true. The backend prices every
// purchase from these (wallets/token-packs.ts) and cleans the list on read.
// Saved on its own, apart from the tab's Save button.

import React, { useMemo, useState } from 'react';
import { Coins, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} from '@/redux/services/settings/settings.api-slice';

export interface TokenPackRow {
  id?: string;
  name: string;
  tokens: number;
  bonus_tokens: number;
  price_ngn: number;
  tag: string | null;
  active: boolean;
}

// Same as the backend's DEFAULT_TOKEN_PACKS (keep in step): shown until an
// admin saves their own.
const DEFAULT_PACKS: TokenPackRow[] = [
  {
    id: 'starter',
    name: 'Starter',
    tokens: 150,
    bonus_tokens: 0,
    price_ngn: 2000,
    tag: null,
    active: true,
  },
  {
    id: 'popular',
    name: 'Popular',
    tokens: 400,
    bonus_tokens: 40,
    price_ngn: 5000,
    tag: 'Most popular',
    active: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    tokens: 800,
    bonus_tokens: 160,
    price_ngn: 10000,
    tag: null,
    active: true,
  },
  {
    id: 'studio',
    name: 'Studio',
    tokens: 2000,
    bonus_tokens: 600,
    price_ngn: 25000,
    tag: 'Best value',
    active: true,
  },
];
const MAX_PACKS = 8;

const naira = (n: number) => `₦${Math.round(n).toLocaleString('en-NG')}`;

function rowProblem(p: TokenPackRow): string | null {
  if (!p.name.trim()) return 'Give it a name.';
  if (!(p.tokens >= 1)) return 'At least 1 token.';
  if (!(p.price_ngn >= 100)) return 'At least ₦100.';
  if (p.bonus_tokens < 0) return 'Bonus can’t be negative.';
  return null;
}

export const TokenPacksCard = () => {
  const { data } = useGetPlatformSettingsQuery();
  const [save, { isLoading: isSaving }] = useUpdatePlatformSettingsMutation();
  const settings = data?.data;
  const saved = useMemo(
    () =>
      settings?.token_packs?.length ? settings.token_packs : DEFAULT_PACKS,
    [settings?.token_packs]
  );
  const designPrice = Number(settings?.outfit_generation_token_price) || 45;

  const [rows, setRows] = useState<TokenPackRow[]>(saved);
  // When the saved list changes (loaded, or saved elsewhere), start from it.
  const savedKey = JSON.stringify(saved);
  const [syncedKey, setSyncedKey] = useState(savedKey);
  if (syncedKey !== savedKey) {
    setSyncedKey(savedKey);
    setRows(saved);
  }

  const dirty = JSON.stringify(rows) !== savedKey;
  const problems = rows.map(rowProblem);
  const hasProblem = problems.some(Boolean);
  const activeCount = rows.filter((r) => r.active).length;

  const set = (i: number, patch: Partial<TokenPackRow>) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const onSave = async () => {
    try {
      await save({ token_packs: rows }).unwrap();
      toast.success(
        'Token packs saved. The shop and vendor app show them now.'
      );
    } catch (e) {
      const msg = (e as { data?: { message?: string } })?.data?.message;
      toast.error(msg || 'Could not save the token packs.');
    }
  };

  return (
    <section className="rounded-xl bg-white p-5 custom-card-shadow border dark:border-white/10 dark:bg-card lg:p-6">
      <div className="mb-5 flex items-start gap-2.5 border-b border-border/60 pb-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
          <Coins className="size-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-grey-black dark:text-white">
            Token packs
          </h3>
          <p className="mt-0.5 text-xs text-grey3 dark:text-gray-400">
            What customers and vendors can buy, in the shop, the vendor app and
            the phone apps. Set a round naira price; give bigger packs free
            bonus tokens so they really are better value. One AI design costs{' '}
            {designPrice} tokens.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((p, i) => {
          const total = p.tokens + (p.bonus_tokens || 0);
          const perToken = p.tokens > 0 ? p.price_ngn / total : 0;
          const designs = Math.floor(total / designPrice);
          return (
            <div
              key={i}
              className="rounded-lg border border-border/60 p-3 dark:border-white/10"
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                <label className="col-span-2 text-xs text-grey3 sm:col-span-1">
                  Name
                  <Input
                    id={`pack-name-${i}`}
                    value={p.name}
                    maxLength={30}
                    onChange={(e) => set(i, { name: e.target.value })}
                  />
                </label>
                <label className="text-xs text-grey3">
                  Price (₦)
                  <Input
                    id={`pack-price-${i}`}
                    type="number"
                    min={100}
                    step={100}
                    value={p.price_ngn}
                    onChange={(e) =>
                      set(i, { price_ngn: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="text-xs text-grey3">
                  Tokens
                  <Input
                    id={`pack-tokens-${i}`}
                    type="number"
                    min={1}
                    value={p.tokens}
                    onChange={(e) => set(i, { tokens: Number(e.target.value) })}
                  />
                </label>
                <label className="text-xs text-grey3">
                  Bonus tokens
                  <Input
                    id={`pack-bonus-${i}`}
                    type="number"
                    min={0}
                    value={p.bonus_tokens}
                    onChange={(e) =>
                      set(i, { bonus_tokens: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="col-span-2 text-xs text-grey3 sm:col-span-2">
                  Label (optional)
                  <Input
                    id={`pack-tag-${i}`}
                    value={p.tag ?? ''}
                    maxLength={24}
                    placeholder="Most popular"
                    onChange={(e) => set(i, { tag: e.target.value || null })}
                  />
                </label>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-grey3 dark:text-gray-400">
                  {problems[i] ? (
                    <span className="text-red-600">{problems[i]}</span>
                  ) : (
                    <>
                      Gives{' '}
                      <b className="text-grey-black dark:text-white">
                        {total.toLocaleString()}
                      </b>{' '}
                      tokens
                      {' · '}enough for about{' '}
                      <b className="text-grey-black dark:text-white">
                        {designs}
                      </b>{' '}
                      design{designs === 1 ? '' : 's'}
                      {' · '}
                      {naira(perToken * 100)} per 100 tokens
                    </>
                  )}
                </span>
                <span className="flex items-center gap-3">
                  <label
                    className="flex items-center gap-1.5 text-grey3"
                    htmlFor={`pack-active-${i}`}
                  >
                    <Switch
                      id={`pack-active-${i}`}
                      checked={p.active}
                      onCheckedChange={(v) => set(i, { active: Boolean(v) })}
                    />
                    On sale
                  </label>
                  <button
                    type="button"
                    aria-label={`Remove ${p.name || 'pack'}`}
                    className="text-grey3 hover:text-red-600"
                    onClick={() =>
                      setRows((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={rows.length >= MAX_PACKS}
          onClick={() =>
            setRows((prev) => [
              ...prev,
              {
                name: '',
                tokens: 100,
                bonus_tokens: 0,
                price_ngn: 1500,
                tag: null,
                active: true,
              },
            ])
          }
        >
          <Plus /> Add pack
        </Button>
        <div className="flex items-center gap-2">
          {!activeCount && (
            <span className="text-xs text-red-600">
              Keep at least one pack on sale.
            </span>
          )}
          {dirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRows(saved)}
            >
              Discard
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            disabled={!dirty || hasProblem || !activeCount || isSaving}
            onClick={onSave}
          >
            {isSaving ? 'Saving…' : 'Save packs'}
          </Button>
        </div>
      </div>
    </section>
  );
};

'use client';

// Settings → Profile: the store's shop address (shop.qlozet.app/s/<slug>).
// Copy or share it; the owner can change it. Old addresses keep redirecting,
// so changing it never breaks a link already in an Instagram bio.

import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Link2, Loader2, Pencil, Share2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { readApiError } from '@/redux/services/types';
import {
  useGetStoreAddressQuery,
  useLazyCheckStoreAddressQuery,
  useUpdateStoreAddressMutation,
  type StoreAddressCheck,
} from '@/redux/services/settings/settings.api-slice';
import {
  STORE_SLUG_MAX,
  storeAddressPrefix,
  storeAddressUrl,
  storeSlugFormatProblem,
  tidyStoreSlug,
} from '@/lib/store-address';

type Status =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'problem'; message: string; suggestion?: string }
  | { kind: 'available' };

export const StoreAddressCard: React.FC = () => {
  const { data, isLoading, isError } = useGetStoreAddressQuery();
  const [checkAddress] = useLazyCheckStoreAddressQuery();
  const [updateAddress, { isLoading: saving }] =
    useUpdateStoreAddressMutation();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  // The server's answer for `checked`; anything typed since then shows as
  // checking, and the unchanged or badly formed cases never ask at all.
  const [answer, setAnswer] = useState<{ for: string; status: Status }>({
    for: '',
    status: { kind: 'idle' },
  });
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = data?.slug ?? '';
  const url = current ? storeAddressUrl(current) : '';

  const formatProblem = storeSlugFormatProblem(draft);
  const needsCheck = editing && draft !== current && !formatProblem;
  const status: Status =
    !editing || draft === current
      ? { kind: 'idle' }
      : formatProblem
        ? { kind: 'problem', message: formatProblem }
        : answer.for === draft
          ? answer.status
          : { kind: 'checking' };

  // Ask the backend once typing pauses; only the latest answer counts.
  useEffect(() => {
    if (!needsCheck) return;
    let stale = false;
    const timer = setTimeout(async () => {
      let next: Status;
      try {
        const res: StoreAddressCheck = await checkAddress(draft).unwrap();
        next = res.available
          ? { kind: 'available' }
          : {
              kind: 'problem',
              message: res.reason || "That address can't be used.",
              suggestion: res.suggestion,
            };
      } catch {
        next = {
          kind: 'problem',
          message: "Couldn't check that address. Try again.",
        };
      }
      if (!stale) setAnswer({ for: draft, status: next });
    }, 400);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [draft, needsCheck, checkAddress]);

  const startEditing = () => {
    setDraft(current);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancel = () => setEditing(false);

  const save = async () => {
    try {
      await updateAddress(draft).unwrap();
      setEditing(false);
      toast.success('Store address changed', {
        description: 'Your old address still works and forwards here.',
      });
    } catch (error) {
      setAnswer({
        for: draft,
        status: {
          kind: 'problem',
          message: readApiError(
            error,
            "Couldn't change the address. Please try again."
          ),
        },
      });
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: 'My store on Qlozet', url });
    } catch {
      // Closed the share sheet: nothing to do.
    }
  };

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;
  const canSave = draft !== current && status.kind === 'available' && !saving;

  return (
    <section className="surface-card p-5" aria-labelledby="store-address-title">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Link2 className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            id="store-address-title"
            className="text-sm font-semibold text-foreground"
          >
            Store address
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            The link to put in your bio, on WhatsApp and on your cards.
          </p>

          {isLoading ? (
            <Skeleton className="mt-3 h-10 w-full max-w-md" />
          ) : isError || !current ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Your store address couldn&apos;t be loaded. Refresh to try again.
            </p>
          ) : editing ? (
            <div className="mt-3 max-w-xl">
              <label htmlFor="store-address-input" className="sr-only">
                Store address
              </label>
              <div
                className={cn(
                  'flex h-10 items-center overflow-hidden rounded-lg border bg-background text-sm focus-within:ring-2 focus-within:ring-ring',
                  status.kind === 'problem'
                    ? 'border-destructive'
                    : 'border-border'
                )}
              >
                <span className="shrink-0 select-none border-r border-border bg-muted/50 px-3 py-2 text-muted-foreground">
                  {storeAddressPrefix()}
                </span>
                <input
                  id="store-address-input"
                  ref={inputRef}
                  value={draft}
                  maxLength={STORE_SLUG_MAX}
                  onChange={(e) => setDraft(tidyStoreSlug(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canSave) save();
                    if (e.key === 'Escape') cancel();
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="store-address-status"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-foreground outline-none"
                />
              </div>

              <div
                id="store-address-status"
                aria-live="polite"
                className="mt-2 min-h-5 text-xs"
              >
                {status.kind === 'checking' && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" aria-hidden />{' '}
                    Checking…
                  </span>
                )}
                {status.kind === 'available' && (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <Check className="size-3" aria-hidden /> Available
                  </span>
                )}
                {status.kind === 'problem' && (
                  <span className="text-destructive">
                    {status.message}
                    {status.suggestion && (
                      <>
                        {' '}
                        <button
                          type="button"
                          onClick={() => setDraft(status.suggestion!)}
                          className="font-medium text-primary underline-offset-2 hover:underline"
                        >
                          Use {status.suggestion}
                        </button>
                      </>
                    )}
                  </span>
                )}
                {status.kind === 'idle' && (
                  <span className="text-muted-foreground">
                    Lowercase letters, numbers and hyphens. Your old address
                    will forward here.
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={save}
                  disabled={!canSave}
                >
                  {saving && (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  )}
                  Save address
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={cancel}
                  disabled={saving}
                >
                  <X className="size-4" aria-hidden /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 max-w-full truncate rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                {storeAddressPrefix()}
                <span className="text-primary">{current}</span>
              </a>
              <Button type="button" size="sm" variant="outline" onClick={copy}>
                {copied ? (
                  <Check className="size-4 text-emerald-600" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
                {copied ? 'Copied' : 'Copy link'}
              </Button>
              {canShare && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={share}
                >
                  <Share2 className="size-4" aria-hidden /> Share
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={startEditing}
              >
                <Pencil className="size-4" aria-hidden /> Change
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

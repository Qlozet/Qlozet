'use client';

// Settings Skeleton - Organism
// Holds the shape of the settings cards grid while the document loads, so the
// tabs do not sit above an empty page and then jump. Mirrors the card idiom:
// icon header over divided rows with a compact control on the right.

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const RowSkeleton = () => (
  <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-3 w-56 max-w-full" />
    </div>
    <Skeleton className="h-9 w-[140px] shrink-0 rounded-md" />
  </div>
);

export const SettingsSkeleton = () => (
  <div className="space-y-5">
    <Skeleton className="h-4 w-2/3 max-w-md" />
    <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
      {[0, 1].map((card) => (
        <div
          key={card}
          className="rounded-xl bg-white p-5 custom-card-shadow dark:border dark:border-white/10 dark:bg-card lg:p-6"
        >
          <div className="mb-5 flex items-start gap-2.5 border-b border-border/60 pb-4">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-3/4 max-w-sm" />
            </div>
          </div>
          <div className="divide-y divide-border/40">
            {[0, 1, 2].map((row) => (
              <RowSkeleton key={row} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

'use client';

// Settings Skeleton - Organism
// Holds the shape of two field cards while the settings document loads, so the
// tabs do not sit above an empty page and then jump.

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const FieldSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-3 w-48" />
  </div>
);

export const SettingsSkeleton = () => (
  <div className="space-y-5">
    <Skeleton className="h-4 w-2/3 max-w-md" />
    {[0, 1].map((card) => (
      <div
        key={card}
        className="rounded-2xl border border-border bg-white dark:bg-card p-5"
      >
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3.5 w-3/4 max-w-sm" />
        <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((field) => (
            <FieldSkeleton key={field} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

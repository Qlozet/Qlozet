'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CollectionsCreateTemplate from '@/pattern/collections/templates/collections-create-template';

export default function CollectionsCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
          Loading…
        </div>
      }
    >
      <CollectionsCreateTemplate />
    </Suspense>
  );
}

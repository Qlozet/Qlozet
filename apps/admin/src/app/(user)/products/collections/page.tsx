'use client';

export const dynamic = 'force-dynamic';

import CollectionsTableTemplate from '@/pattern/collections/templates/collections-table-template';

export default function CollectionsPage() {
  return (
    <div className="w-full">
      <CollectionsTableTemplate />
    </div>
  );
}

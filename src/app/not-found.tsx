'use client';
import { NotFoundWidget } from '@/pattern/common/templates/not-found-widget';
import Link from 'next/link';
import { Suspense } from 'react';

export default function NotFound() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <NotFoundWidget />
      </Suspense>
    </>
  );
}

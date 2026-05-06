'use client';
import Link from 'next/link';
import { Suspense } from 'react';

export default function NotFound() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="relative w-screen h-fit flex flex-col items-center gap-y-8">
          <h2>Not Found</h2>
          <p>Could not find requested resource</p>
          <Link href='/' className='text-primary'>
            Return Home
          </Link>
        </div>
      </Suspense>
    </>
  );
}

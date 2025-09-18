'use client';
import Link from 'next/link';
export default function NotFound() {
  return (
    <div className='h-screen w-screen flex items-center justify-center flex-col'>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href='/' className='text-primary'>
        Return Home
      </Link>
    </div>
  );
}

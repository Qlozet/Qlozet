'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface GoBackButtonProps {
  /** Optional explicit destination; defaults to browser back. */
  href?: string;
  label?: string;
}

export const GoBackButton = ({ href, label = 'Go Back' }: GoBackButtonProps) => {
  const router = useRouter();

  return (
    <button
      type='button'
      onClick={() => (href ? router.push(href) : router.back())}
      className='inline-flex items-center gap-2 text-sm font-medium text-grey-black hover:opacity-80 transition-opacity cursor-pointer'
    >
      <span className='flex size-7 items-center justify-center rounded-full border border-border bg-white'>
        <ArrowLeft className='size-4' />
      </span>
      {label}
    </button>
  );
};

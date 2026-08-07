'use client';

// Guidelines — bespoke order drawer.
//
// Static platform copy shown to the vendor. Intentionally not rendered in the
// admin app: admin authors these standards rather than being held to them.

import React from 'react';
import { BadgeCheck, ShieldCheck } from 'lucide-react';

const GUIDELINES: { icon: 'shield' | 'check'; text: string }[] = [
  {
    icon: 'shield',
    text: 'Proof photos required at cutting, sewing, and QC stages.',
  },
  {
    icon: 'check',
    text: 'Disputes escalated to Qlozet if unresolved within 48 hrs.',
  },
  { icon: 'check', text: 'On-time delivery improves your vendor rating.' },
];

export const VendorGuidelinesCard = () => (
  <section className='space-y-3 rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4'>
    <div>
      <h3 className='text-base font-semibold text-grey-black dark:text-white'>
        Guidelines
      </h3>
      <p className='text-xs text-grey2 dark:text-gray-400'>
        Qlozet vendor standards
      </p>
    </div>

    <ul className='space-y-3'>
      {GUIDELINES.map((guideline) => (
        <li key={guideline.text} className='flex items-start gap-2.5'>
          {guideline.icon === 'shield' ? (
            <ShieldCheck className='mt-0.5 size-4 shrink-0 text-grey3 dark:text-gray-300' />
          ) : (
            <BadgeCheck className='mt-0.5 size-4 shrink-0 text-grey3 dark:text-gray-300' />
          )}
          <p className='text-sm text-grey3 dark:text-gray-300'>
            {guideline.text}
          </p>
        </li>
      ))}
    </ul>
  </section>
);

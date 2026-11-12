'use client';

// Guidelines — bespoke order drawer.
//
// Static platform copy shown to the vendor. Intentionally not rendered in the
// admin app: admin authors these standards rather than being held to them.

import React from 'react';
import { BadgeCheck, ShieldCheck } from 'lucide-react';

// Each line describes what the platform actually does; no promise here
// that the system does not keep.
const GUIDELINES: { icon: 'shield' | 'check'; text: string }[] = [
  {
    icon: 'shield',
    text: 'Send photos of the finished piece before shipping. The customer pays the balance from them.',
  },
  {
    icon: 'check',
    text: 'Shipping after the ship-by date costs part of your earnings each day, and an order left unshipped too long is cancelled.',
  },
  {
    icon: 'check',
    text: 'If a customer reports a problem, reply in Disputes with your side and any photos. Qlozet decides from both.',
  },
];

export const VendorGuidelinesCard = () => (
  <section className="space-y-3 rounded-xl border bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4">
    <div>
      <h3 className="text-base font-semibold text-grey-black dark:text-white">
        Guidelines
      </h3>
      <p className="text-xs text-grey2 dark:text-gray-400">
        Qlozet vendor standards
      </p>
    </div>

    <ul className="space-y-3">
      {GUIDELINES.map((guideline) => (
        <li key={guideline.text} className="flex items-start gap-2.5">
          {guideline.icon === 'shield' ? (
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-grey3 dark:text-gray-300" />
          ) : (
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-grey3 dark:text-gray-300" />
          )}
          <p className="text-sm text-grey3 dark:text-gray-300">
            {guideline.text}
          </p>
        </li>
      ))}
    </ul>
  </section>
);

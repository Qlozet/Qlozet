'use client';

// Vendor Verification Notice - Molecule
// Shown on the Catalogue tab while manual verification is selected, so it is
// never left on by accident: every vendor who submits in this mode waits on
// the team to check them by hand.

import { UserCheck } from 'lucide-react';

export const VendorVerificationNotice = ({ mode }: { mode: string }) => {
  if (mode !== 'manual') return null;
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <UserCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        <strong>Vendors are verified by hand.</strong> They submit their CAC
        number and a payout account their bank has confirmed. Before approving
        each one, search the number on the CAC register, compare the payout name
        and call the owner. Switch back to QoreID as soon as it is available.
      </p>
    </div>
  );
};

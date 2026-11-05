'use client';

// Verification Pills - Molecule
// "Approved by hand" and the full-checks deadline, beside a vendor's status.
// Renders nothing for a vendor verified through QoreID.

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { verificationPills } from '@/lib/manual-verification';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';

const TONE_VARIANT = {
  neutral: 'blue',
  warn: 'warning',
  danger: 'error',
} as const;

export const VerificationPills = ({
  vendor,
  className,
}: {
  vendor?: Business | null;
  className?: string;
}) => {
  const pills = verificationPills(vendor);
  if (!pills.length) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {pills.map((pill) => (
        <Badge
          key={pill.label}
          variant={TONE_VARIANT[pill.tone]}
          shape="pill"
          className="whitespace-nowrap px-2 py-0 text-[11px] font-medium"
        >
          {pill.label}
        </Badge>
      ))}
    </div>
  );
};

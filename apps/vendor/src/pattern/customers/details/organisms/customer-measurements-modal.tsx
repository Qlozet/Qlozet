'use client';

// Body Measurement panel.
//
// Opened from "Measurement" in the customer details modal. Shows the
// customer's default measurement set (the one they shop with) and the body
// type worked out from it, in the same floating shell as the profile sheet:
// an inset card on desktop, a bottom sheet on phones.
//
// A set is a flat { key: number } map holding only what the customer
// recorded, so this renders whatever it is given and invents nothing.

import { useMemo, useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { OverlayScroll } from '@/components/OverlayScroll';
import type {
  VendorCustomer,
  CustomerMeasurement,
} from '@/redux/services/customers/customers.api-slice';
import {
  BodyTypeCard,
  EmptyState,
  MeasurementGroups,
  PANEL_SHEET_CLASS,
  SummaryCard,
  UnitToggle,
  toRows,
  type Unit,
} from '../molecules/measurement-panel';
import { MEASUREMENT_METHOD } from '@/lib/measurement-labels';

const formatDate = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

const ago = (iso?: string | null): string => {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (Number.isNaN(days)) return '';
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return `on ${formatDate(iso)}`;
};

interface CustomerMeasurementsModalProps {
  customer?: VendorCustomer;
  measurementSet?: CustomerMeasurement;
}

export const CustomerMeasurementsModal = create<CustomerMeasurementsModalProps>(
  ({ customer, measurementSet }) => {
    const { visible, resolve, remove } = useModal();
    const [unit, setUnit] = useState<Unit>('cm');

    const handleClose = () => {
      resolve({ resolved: true });
      remove();
    };

    const rows = useMemo(
      () => toRows(measurementSet?.measurements),
      [measurementSet]
    );
    const verifyKeys = useMemo(
      () =>
        new Set(
          Object.entries(measurementSet?.tailoring_meta ?? {})
            .filter(([, m]) => m?.tier === 'rough')
            .map(([k]) => k)
        ),
      [measurementSet]
    );

    const fromUnit = measurementSet?.unit ?? 'cm';
    const updated = formatDate(
      measurementSet?.updated_at ?? measurementSet?.createdAt
    );
    const method = measurementSet?.method
      ? MEASUREMENT_METHOD[measurementSet.method]
      : null;
    const bodyType = customer?.body_type ?? null;
    const name = customer?.full_name || customer?.username || 'This customer';

    return (
      <Sheet open={visible} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent side="right" className={PANEL_SHEET_CLASS}>
          <div className="flex h-full flex-col rounded-[15px] bg-white dark:bg-card">
            <SheetHeader className="shrink-0 border-b border-border px-4 py-5 sm:px-6">
              <SheetTitle className="w-full text-left text-lg font-semibold text-[#0C0C0D] dark:text-white">
                Body Measurement
              </SheetTitle>
              {customer && (
                <p className="text-left text-xs text-muted-foreground">
                  {name}
                </p>
              )}
            </SheetHeader>

            <OverlayScroll className="min-h-0 flex-1">
              <div className="space-y-5 px-4 py-5 sm:px-6">
                {rows.length === 0 ? (
                  <EmptyState
                    title="No measurements yet"
                    message={`${name}'s measurements show here once they order a piece made to measure from you.`}
                  />
                ) : (
                  <>
                    <SummaryCard
                      title={measurementSet?.name ?? 'Measurements'}
                      subtitle={[
                        'Current profile',
                        updated ? `Updated ${updated}` : null,
                        method?.label ?? null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      rows={rows}
                      fromUnit={fromUnit}
                      unit={unit}
                    />

                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                      These are the customer’s measurements today. Each order
                      keeps the measurements it was placed with — always cut
                      from the ones on the order.
                    </p>

                    {bodyType && bodyType.type !== 'unclassified' && (
                      <BodyTypeCard
                        bodyType={bodyType}
                        gender={customer?.gender}
                        checkedLabel={
                          bodyType.computed_at
                            ? `Last checked ${ago(bodyType.computed_at)}`
                            : 'Worked out from their default measurements'
                        }
                      />
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-[#0C0C0D] dark:text-white">
                        Measurements
                      </h3>
                      <UnitToggle unit={unit} onChange={setUnit} />
                    </div>

                    <MeasurementGroups
                      rows={rows}
                      fromUnit={fromUnit}
                      unit={unit}
                      verifyKeys={verifyKeys}
                    />
                  </>
                )}
              </div>
            </OverlayScroll>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);

'use client';

// Body Measurement panel.
//
// Opened from the measurement button in the customer detail header. Reads
// GET /admin/customer/:id/measurements — the customer's saved sets and their
// body-type classification. It opens in the same floating shell as the
// profile sheet (inset card on desktop, bottom sheet on phones).
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/orders';
import { readApiError } from '@/redux/services/types';
import {
  useGetCustomerMeasurementsQuery,
  type CustomerMeasurementSet,
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

/** How many rows show before "View more". */
const COLLAPSED_ROWS = 12;

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

const roughKeys = (set: CustomerMeasurementSet | null): Set<string> => {
  const meta = (set as { tailoring_meta?: Record<string, { tier?: string }> })
    ?.tailoring_meta;
  return new Set(
    Object.entries(meta ?? {})
      .filter(([, m]) => m?.tier === 'rough')
      .map(([k]) => k)
  );
};

interface CustomerMeasurementsDrawerProps {
  customerId: string;
  /** Named in the header and the empty state. */
  customerName?: string;
}

export const CustomerMeasurementsDrawer =
  create<CustomerMeasurementsDrawerProps>(({ customerId, customerName }) => {
    const { visible, remove } = useModal();
    const [unit, setUnit] = useState<Unit>('cm');
    const [expanded, setExpanded] = useState(false);
    const [setName, setSetName] = useState<string | null>(null);

    const { data, isLoading, isError, error } = useGetCustomerMeasurementsQuery(
      customerId,
      { skip: !customerId }
    );

    const measurements = data?.data;
    const sets = useMemo(() => measurements?.sets ?? [], [measurements]);

    // The active set unless the reader picked another. Sets arrive active-first.
    const selected: CustomerMeasurementSet | null = useMemo(() => {
      if (setName) return sets.find((s) => s.name === setName) ?? null;
      return measurements?.active_set ?? sets[0] ?? null;
    }, [measurements, sets, setName]);

    const rows = useMemo(() => toRows(selected?.measurements), [selected]);
    const visibleRows = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);
    const fromUnit = selected?.unit ?? 'cm';
    const updated = formatDate(selected?.created_at);
    const bodyType = measurements?.body_type;

    return (
      <Sheet open={visible} onOpenChange={(next) => !next && remove()}>
        <SheetContent side="right" className={PANEL_SHEET_CLASS}>
          <div className="flex h-full flex-col rounded-[15px] bg-white dark:bg-card">
            <SheetHeader className="shrink-0 border-b border-border px-4 py-5 sm:px-6">
              <SheetTitle className="w-full text-left text-lg font-semibold text-[#0C0C0D] dark:text-white">
                Body Measurement
              </SheetTitle>
              {customerName && (
                <p className="text-left text-xs text-muted-foreground">
                  {customerName}
                </p>
              )}
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-5 px-4 py-5 sm:px-6">
                {isLoading ? (
                  <>
                    <Skeleton className="h-48 rounded-[20px]" />
                    <Skeleton className="h-40 rounded-[20px]" />
                    <Skeleton className="h-64 rounded-[20px]" />
                  </>
                ) : isError ? (
                  <EmptyState
                    title="Couldn't load measurements"
                    message={readApiError(
                      error,
                      'Their measurements could not be loaded.'
                    )}
                  />
                ) : !rows.length ? (
                  <EmptyState
                    title="No measurements yet"
                    message={`${
                      customerName ?? 'This customer'
                    } hasn't recorded any body measurements.`}
                  />
                ) : (
                  <>
                    <SummaryCard
                      title={selected?.name ?? 'Measurements'}
                      subtitle={[
                        selected?.active ? 'Default set' : null,
                        updated ? `Updated ${updated}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      rows={rows}
                      fromUnit={fromUnit}
                      unit={unit}
                    />

                    {bodyType && (
                      <BodyTypeCard
                        bodyType={bodyType}
                        gender={measurements?.gender}
                        // Null computed_at means the classifier ran for this
                        // response: there is no "last checked" moment to claim.
                        checkedLabel={
                          bodyType.computed_at
                            ? `Last checked ${timeAgo(bodyType.computed_at)}`
                            : 'Derived from their current measurements'
                        }
                      />
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-[#0C0C0D] dark:text-white">
                        Measurements
                      </h3>
                      <UnitToggle unit={unit} onChange={setUnit} />
                    </div>

                    {/* Only offered when there is a choice to make. */}
                    {sets.length > 1 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {sets.map((set) => (
                          <button
                            key={set.name}
                            type="button"
                            onClick={() => setSetName(set.name)}
                            className={cn(
                              'cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors',
                              selected?.name === set.name
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-muted dark:text-gray-300'
                            )}
                          >
                            {set.name}
                            {set.active ? ' · default' : ''}
                          </button>
                        ))}
                      </div>
                    )}

                    <MeasurementGroups
                      rows={visibleRows}
                      fromUnit={fromUnit}
                      unit={unit}
                      verifyKeys={roughKeys(selected)}
                    />

                    {rows.length > COLLAPSED_ROWS && (
                      <button
                        type="button"
                        onClick={() => setExpanded((open) => !open)}
                        className="w-full cursor-pointer rounded-xl border border-border py-3 text-sm font-medium text-[#0C0C0D] transition-colors hover:bg-gray-50 dark:text-white dark:hover:bg-muted/60"
                      >
                        {expanded ? 'View Less' : 'View More'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  });

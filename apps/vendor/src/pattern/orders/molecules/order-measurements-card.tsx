'use client';

// Body Measurement card — order drawer.
// Reads GET /orders/:reference/measurements: the ORDER-TIME snapshot when the
// order carries one (set name shown, e.g. "For Tolu"), or the customer's live
// active set for legacy orders. The snapshot is what the garment must be sewn
// to — the customer may have switched or edited their profile since ordering.

import { useMemo, useState } from 'react';
import { Ruler, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetOrderMeasurementsQuery } from '@/redux/services/orders/orders.api-slice';

type Unit = 'cm' | 'in';

// Friendly labels for known measurement keys; anything else is prettified.
// (Mirrors customer-measurements-modal so both surfaces read the same.)
const LABELS: Record<string, string> = {
  neck: 'Neck',
  neck_circumference: 'Neck',
  shoulder: 'Shoulder Width',
  shoulder_breadth: 'Shoulder Width',
  chest: 'Chest / Bust',
  bust: 'Bust',
  waist: 'Waist',
  hip: 'Hip',
  hips: 'Hip',
  arm_length: 'Arm Length',
  sleeve_length: 'Sleeve Length',
  bicep: 'Bicep',
  forearm: 'Forearm',
  wrist: 'Wrist',
  thigh: 'Thigh',
  calf: 'Calf',
  ankle: 'Ankle',
  knee: 'Knee',
  leg_length: 'Leg Length',
  inseam: 'Inseam',
  outseam: 'Outseam',
  shoulder_to_crotch: 'Torso Length',
  height: 'Height',
  back_length: 'Back Length',
  front_length: 'Front Length',
};

const prettify = (key: string): string =>
  LABELS[key] ??
  key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const convert = (value: number, from: 'cm' | 'inch', to: Unit): number => {
  const toUnit = to === 'in' ? 'inch' : 'cm';
  if (from === toUnit) return value;
  return toUnit === 'inch' ? value / 2.54 : value * 2.54;
};

const formatValue = (n: number): string =>
  Number.isInteger(n) ? `${n}` : n.toFixed(1);

interface OrderMeasurementsCardProps {
  reference: string;
}

const recordedRows = (m: Record<string, number> | undefined) =>
  Object.entries(m ?? {})
    .filter(([, v]) => typeof v === 'number' && !Number.isNaN(v) && v > 0)
    .map(([key, v]) => ({ key, label: prettify(key), value: v }));

const MeasurementGrid = ({
  measurements,
  fromUnit,
  unit,
}: {
  measurements: Record<string, number> | undefined;
  fromUnit: 'cm' | 'inch';
  unit: Unit;
}) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
    {recordedRows(measurements).map((row) => (
      <div
        key={row.key}
        className="flex items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] dark:border-border bg-white dark:bg-[#404040] px-3.5 py-2.5"
      >
        <span className="truncate text-sm text-gray-600 dark:text-gray-300">
          {row.label}
        </span>
        <span className="shrink-0 text-sm font-semibold text-grey-black dark:text-white">
          {formatValue(convert(row.value, fromUnit, unit))}
          <span className="ml-0.5 text-xs font-normal text-grey3">{unit}</span>
        </span>
      </div>
    ))}
  </div>
);

/**
 * Per-item measurements block — for the item DETAIL modal. Renders straight
 * from the order item's embedded `body_profile` snapshot (no fetch): who the
 * garment is sewn to, a lock badge, and the grid with a cm/in toggle. With
 * several custom garments for different bodies in one order, this is the
 * unambiguous home for "which measurements belong to which garment".
 */
export const ItemBodyMeasurements = ({
  profile,
}: {
  profile: {
    set_name?: string | null;
    unit?: string;
    measurements?: Record<string, number>;
  };
}) => {
  const [unit, setUnit] = useState<Unit>('cm');
  const rows = recordedRows(profile?.measurements);
  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-950/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <Ruler className="size-3.5" />
            Sewn to
            {profile.set_name ? `: ${profile.set_name}` : ' these measurements'}
          </h4>
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            <Lock className="size-3" /> Locked at order time
          </span>
        </div>
        <div className="inline-flex items-center rounded-full bg-white dark:bg-[#404040] p-0.5 text-xs font-semibold">
          {(['cm', 'in'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn(
                'cursor-pointer rounded-full px-2.5 py-0.5 uppercase transition-colors',
                unit === u
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500'
              )}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2">
        <MeasurementGrid
          measurements={profile.measurements}
          fromUnit={(profile.unit as 'cm' | 'inch') ?? 'cm'}
          unit={unit}
        />
      </div>
    </div>
  );
};

export const OrderMeasurementsCard = ({
  reference,
}: OrderMeasurementsCardProps) => {
  const { data, isLoading } = useGetOrderMeasurementsQuery(reference, {
    skip: !reference,
  });
  const [unit, setUnit] = useState<Unit>('cm');

  // Per-garment profiles when the order carries items for different bodies
  // (asoebi/family orders). Falls back to the single order-level profile.
  const itemProfiles = useMemo(
    () =>
      (data?.items ?? []).filter(
        (i) => recordedRows(i.measurements).length > 0
      ),
    [data]
  );
  const distinctSets = new Set(itemProfiles.map((i) => i.set_name ?? ''));
  const perGarment = itemProfiles.length > 0 && distinctSets.size > 1;

  // Only the measurements that are actually recorded (present + non-zero).
  const rows = useMemo(() => recordedRows(data?.measurements), [data]);

  if (isLoading) {
    return (
      <section className="space-y-3 rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-[#404040]" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-xl bg-gray-200 dark:bg-[#404040]"
            />
          ))}
        </div>
      </section>
    );
  }

  // No measurements recorded — the section has no place in the drawer.
  if (!data || (rows.length === 0 && itemProfiles.length === 0)) return null;

  return (
    <section className="space-y-4 rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-grey-black dark:text-white">
          <Ruler className="size-4 text-primary" />
          Body Measurement
        </h3>
        <div className="inline-flex items-center rounded-full bg-white dark:bg-[#404040] p-1 text-xs font-semibold">
          {(['cm', 'in'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn(
                'cursor-pointer rounded-full px-3 py-1 uppercase transition-colors',
                unit === u
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500'
              )}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {perGarment ? (
        /* Different bodies in one order — one block per garment. */
        <div className="space-y-4">
          {itemProfiles.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-grey-black dark:text-white">
                  {item.set_name || 'Measurements'}
                </span>
                {item.product_name && (
                  <span className="text-xs text-grey3 dark:text-gray-400">
                    · {item.product_name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  <Lock className="size-3" /> Locked at order time
                </span>
              </div>
              <MeasurementGrid
                measurements={item.measurements}
                fromUnit={item.unit ?? 'cm'}
                unit={unit}
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Whose measurements + whether they're frozen to this order. */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-grey-black dark:text-white">
              {data.name || 'Measurements'}
            </span>
            {data.snapshot ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                <Lock className="size-3" /> Locked at order time
              </span>
            ) : (
              <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                Live profile — may change
              </span>
            )}
          </div>

          <MeasurementGrid
            measurements={data.measurements}
            fromUnit={data.unit ?? 'cm'}
            unit={unit}
          />
        </>
      )}
    </section>
  );
};

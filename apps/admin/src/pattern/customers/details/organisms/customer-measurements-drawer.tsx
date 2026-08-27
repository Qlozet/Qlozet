'use client';

// Body Measurement drawer.
//
// Opened from the measurement button in the customer detail header. Reads
// GET /admin/customer/:id/measurements — the customer's saved sets and their
// body-type classification.
//
// The backend stores measurements as a flat { key: number } map holding only
// the keys the customer actually recorded, so this renders whatever it is
// given: known keys get a friendly label and a fixed position, anything else is
// prettified and appended. Nothing is invented to fill a column, and a missing
// measurement is simply absent rather than shown as a blank field.

import { useMemo, useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { Ruler } from 'lucide-react';
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
  type CustomerBodyType,
  type CustomerMeasurementSet,
} from '@/redux/services/customers/customers.api-slice';

type Unit = 'cm' | 'in';

/**
 * Friendly labels for the keys the backend actually writes, plus the spellings
 * the older sets used. Anything unlisted is prettified from its key.
 */
const LABELS: Record<string, string> = {
  neck: 'Neck Circum.',
  neck_circumference: 'Neck Circum.',
  shoulder: 'Shoulder Width',
  shoulder_breadth: 'Shoulder Width',
  shoulder_width: 'Shoulder Width',
  chest: 'Chest/Bust Circ.',
  bust: 'Bust Circ.',
  waist: 'Waist Circ.',
  hip: 'Hip Circ.',
  hips: 'Hip Circ.',
  arm_length: 'Arm Length',
  sleeve_length: 'Sleeve Length',
  thigh: 'Thigh Circum.',
  inseam: 'Inseam Length',
  inseam_length: 'Inseam Length',
  outseam: 'Outseam Length',
  outseam_length: 'Outseam Length',
  leg_length: 'Leg Length',
  crotch_depth: 'Crotch Depth',
  upper_arm: 'Upper Arm Circum.',
  bicep: 'Bicep Circum.',
  elbow: 'Elbow Circum.',
  forearm: 'Forearm Circum.',
  back_length: 'Back Length',
  front_length: 'Front Length',
  wrist: 'Wrist Circum.',
  knee: 'Knee Circum.',
  calf: 'Calf Circum.',
  ankle: 'Ankle Circum.',
  hip_to_knee: 'Hip to Knee',
  knee_to_ankle: 'Knee to Ankle',
  shoulder_to_crotch: 'Torso Length',
  height: 'Height',
  weight: 'Weight',
};

/**
 * Reading order — torso down the first column, limbs and lengths after. A set
 * is a map, so without this the panel would order fields by whatever order the
 * keys happen to come back in, which changes between records.
 */
const ORDER = [
  'neck',
  'neck_circumference',
  'shoulder',
  'shoulder_breadth',
  'shoulder_width',
  'chest',
  'bust',
  'waist',
  'hip',
  'hips',
  'arm_length',
  'sleeve_length',
  'thigh',
  'inseam',
  'inseam_length',
  'outseam',
  'outseam_length',
  'leg_length',
  'crotch_depth',
  'upper_arm',
  'bicep',
  'elbow',
  'forearm',
  'back_length',
  'front_length',
  'wrist',
  'knee',
  'calf',
  'ankle',
  'hip_to_knee',
  'knee_to_ankle',
  'shoulder_to_crotch',
  'height',
  'weight',
];

/** How many rows show before "View more". */
const COLLAPSED_ROWS = 12;

/** Most rows one card carries, so a long set reads as a grid, not two columns. */
const MAX_ROWS_PER_CARD = 6;

const BODY_TYPE_LABELS: Record<string, string> = {
  athletic: 'Athletic',
  rectangle: 'Rectangle',
  trapezoid: 'Trapezoid',
  round: 'Round',
  triangle: 'Triangle',
  hourglass: 'Hourglass',
  pear: 'Pear',
  apple: 'Apple',
  inverted_triangle: 'Inverted triangle',
  unclassified: 'Not yet classified',
};

const prettify = (key: string): string =>
  LABELS[key] ??
  key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const convert = (value: number, from: 'cm' | 'inch', to: Unit): number => {
  const target = to === 'in' ? 'inch' : 'cm';
  if (from === target) return value;
  return target === 'inch' ? value / 2.54 : value * 2.54;
};

const formatValue = (value: number): string =>
  Number.isInteger(value) ? `${value}` : value.toFixed(1);

/** Chunk into cards of at most six, balanced so a short set still reads as two columns. */
const toCards = <T,>(rows: T[]): T[][] => {
  if (!rows.length) return [];
  const size = Math.min(MAX_ROWS_PER_CARD, Math.ceil(rows.length / 2));
  return Array.from({ length: Math.ceil(rows.length / size) }, (_, i) =>
    rows.slice(i * size, i * size + size)
  );
};

const UnitToggle = ({
  unit,
  onChange,
}: {
  unit: Unit;
  onChange: (unit: Unit) => void;
}) => (
  <div className="inline-flex items-center rounded-full bg-gray-100 p-1 text-xs font-semibold dark:bg-muted">
    {(['cm', 'in'] as const).map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={unit === option}
        onClick={() => onChange(option)}
        className={cn(
          'cursor-pointer rounded-full px-3 py-1 uppercase transition-colors',
          unit === option
            ? 'bg-white text-gray-900 shadow-sm dark:bg-card dark:text-white'
            : 'text-gray-500 dark:text-gray-400'
        )}
      >
        {option}
      </button>
    ))}
  </div>
);

/**
 * The silhouette the classifier is naming, as a plain outline. The families
 * differ only in where the width sits, which is exactly what a shape shows and
 * a word does not.
 */
const BodyShape = ({ type }: { type: string }) => {
  const shapes: Record<string, React.ReactNode> = {
    inverted_triangle: <polygon points="10,10 110,10 60,130" />,
    athletic: <polygon points="10,10 110,10 60,130" />,
    trapezoid: <polygon points="12,10 108,10 88,130 32,130" />,
    triangle: <polygon points="60,10 110,130 10,130" />,
    pear: <polygon points="60,10 110,130 10,130" />,
    rectangle: <rect x="25" y="10" width="70" height="120" />,
    hourglass: <polygon points="15,10 105,10 68,70 105,130 15,130 52,70" />,
    apple: <ellipse cx="60" cy="70" rx="48" ry="60" />,
    round: <ellipse cx="60" cy="70" rx="48" ry="60" />,
  };

  const shape = shapes[type];
  if (!shape) return null;

  return (
    <svg
      viewBox="0 0 120 140"
      aria-hidden="true"
      className="h-32 w-auto shrink-0 fill-none stroke-gray-300 stroke-[3] dark:stroke-gray-600"
    >
      {shape}
    </svg>
  );
};

const BodyTypeSection = ({
  bodyType,
  gender,
}: {
  bodyType: CustomerBodyType;
  gender?: string | null;
}) => {
  const label = BODY_TYPE_LABELS[bodyType.type] ?? prettify(bodyType.type);
  const genderLabel = gender
    ? gender.charAt(0).toUpperCase() + gender.slice(1)
    : null;

  return (
    <section className="border-t border-border pt-6">
      <h3 className="text-lg font-semibold text-grey-black dark:text-white">
        Body Type{genderLabel ? ` - ${genderLabel}` : ''}
      </h3>

      {/* Null computed_at means the classifier ran for this response rather
          than being read from the customer's record — there is no "last
          checked" moment to report, so none is claimed. */}
      <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
        {bodyType.computed_at
          ? `Last checked ${timeAgo(bodyType.computed_at)}`
          : 'Derived from their current measurements'}
      </p>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <span className="inline-block rounded-lg bg-gray-100 px-3 py-2 text-sm text-grey-black dark:bg-muted dark:text-white">
            {label}
          </span>
          {bodyType.flattering_fits.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Flattering fits: {bodyType.flattering_fits.join(', ')}
            </p>
          )}
        </div>
        <BodyShape type={bodyType.type} />
      </div>
    </section>
  );
};

const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
    <Ruler className="size-7 text-gray-300 dark:text-gray-600" />
    <p className="text-sm font-medium text-grey-black dark:text-white">
      {title}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

interface CustomerMeasurementsDrawerProps {
  customerId: string;
  /** Named in the empty state so the panel says who it found nothing for. */
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

    const rows = useMemo(() => {
      const entries = Object.entries(selected?.measurements ?? {}).filter(
        ([, value]) =>
          typeof value === 'number' && Number.isFinite(value) && value > 0
      );

      // Unlisted keys keep their own order after the ones we position.
      return entries
        .map(([key, value]) => ({
          key,
          label: prettify(key),
          value,
          rank: ORDER.indexOf(key),
        }))
        .sort((a, b) => {
          const left = a.rank === -1 ? ORDER.length : a.rank;
          const right = b.rank === -1 ? ORDER.length : b.rank;
          return left - right;
        });
    }, [selected]);

    const visibleRows = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);
    const cards = toCards(visibleRows);
    const close = () => remove();

    return (
      <Sheet open={visible} onOpenChange={(next) => !next && close()}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <SheetHeader className="shrink-0 border-b border-border px-6 py-5 max-lg:px-4">
            <SheetTitle className="text-left text-lg font-semibold">
              Body Measurement
            </SheetTitle>
            {customerName && (
              <p className="text-left text-xs text-muted-foreground">
                {customerName}
              </p>
            )}
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5 max-lg:px-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-24 rounded-full" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Skeleton className="h-64 rounded-2xl" />
                  <Skeleton className="h-64 rounded-2xl" />
                </div>
              </div>
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <UnitToggle unit={unit} onChange={setUnit} />

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
                          {set.active ? ' · active' : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {cards.map((card) => (
                    <div
                      key={card[0].key}
                      className="rounded-2xl bg-[hsla(0,0%,96%,1)] px-4 py-2 dark:bg-muted"
                    >
                      {card.map((row) => (
                        <div
                          key={row.key}
                          className="flex items-center justify-between gap-3 py-3"
                        >
                          <span className="min-w-0 truncate text-sm text-gray-600 dark:text-gray-300">
                            {row.label}
                          </span>
                          <span className="shrink-0 text-sm font-semibold text-grey-black dark:text-white">
                            {formatValue(
                              convert(row.value, selected?.unit ?? 'cm', unit)
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {rows.length > COLLAPSED_ROWS && (
                  <button
                    type="button"
                    onClick={() => setExpanded((open) => !open)}
                    className="w-full cursor-pointer rounded-xl border border-border py-3 text-sm font-medium text-grey-black transition-colors hover:bg-gray-50 dark:text-white dark:hover:bg-muted/60"
                  >
                    {expanded ? 'View Less' : 'View More'}
                  </button>
                )}

                {measurements?.body_type && (
                  <BodyTypeSection
                    bodyType={measurements.body_type}
                    gender={measurements.gender}
                  />
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  });

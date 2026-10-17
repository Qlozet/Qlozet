'use client';

// The pieces of the Body Measurement panel. The vendor app carries the same
// file (pattern/customers/details/molecules/measurement-panel.tsx) so a
// customer's measurements read the same to an admin and to their tailor;
// keep the two in step.

import type { ReactNode } from 'react';
import { Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Unit = 'cm' | 'in';

/** The grey card the profile sheet uses for its boxes. */
export const PANEL_CARD =
  'rounded-[20px] border bg-[hsla(0,0%,96%,1)] dark:bg-muted';

/**
 * Friendly labels for the keys the backend writes, the spellings older sets
 * used, and the tailoring rows the AI estimate adds. Anything unlisted is
 * prettified from its key.
 */
export const LABELS: Record<string, string> = {
  neck: 'Neck Circum.',
  neck_circumference: 'Neck Circum.',
  neck_base: 'Neck Base',
  shoulder: 'Shoulder Width',
  shoulder_breadth: 'Shoulder Breadth (bone to bone)',
  shoulder_width: 'Shoulder Width (seam to seam)',
  across_back: 'Across Back',
  chest: 'Chest/Bust Circ.',
  bust: 'Bust Circ.',
  under_bust: 'Under Bust',
  waist: 'Waist Circ.',
  belly_waist: 'Belly Waist',
  top_hip: 'High Hip',
  hip: 'Hip Circ.',
  hips: 'Hip Circ.',
  arm_length: 'Arm Length',
  sleeve_length: 'Sleeve Length',
  upper_arm: 'Upper Arm Circum.',
  bicep: 'Bicep Circum.',
  elbow: 'Elbow Circum.',
  forearm: 'Forearm Circum.',
  wrist: 'Wrist Circum.',
  height: 'Height',
  weight: 'Weight',
  shoulder_to_crotch: 'Torso Length',
  nape_to_waist: 'Back Length (Nape to Waist)',
  back_length: 'Back Length',
  front_length: 'Front Length',
  leg_length: 'Leg Length',
  inseam: 'Inseam Length',
  inseam_length: 'Inseam Length',
  outseam: 'Outseam Length',
  outseam_length: 'Outseam Length',
  crotch_depth: 'Crotch Depth',
  hip_to_knee: 'Hip to Knee',
  knee_to_ankle: 'Knee to Ankle',
  waist_height: 'Waist Height',
  neck_height: 'Neck Height',
  ankle_height: 'Ankle Height',
  thigh: 'Thigh Circum.',
  mid_thigh: 'Mid Thigh',
  lower_thigh: 'Lower Thigh',
  knee: 'Knee Circum.',
  calf: 'Calf Circum.',
  ankle: 'Ankle Circum.',
};

/**
 * Reading order in groups a tailor works through: torso, arms, the lengths a
 * pattern is drafted from, then leg girths. Keys in no group are listed last.
 */
export const GROUPS: { title: string; keys: string[] }[] = [
  {
    title: 'Upper body',
    keys: [
      'neck',
      'neck_circumference',
      'neck_base',
      'shoulder',
      'shoulder_breadth',
      'shoulder_width',
      'across_back',
      'chest',
      'bust',
      'under_bust',
      'waist',
      'belly_waist',
      'top_hip',
      'hip',
      'hips',
    ],
  },
  {
    title: 'Arms',
    keys: [
      'arm_length',
      'sleeve_length',
      'upper_arm',
      'bicep',
      'elbow',
      'forearm',
      'wrist',
    ],
  },
  {
    title: 'Lengths',
    keys: [
      'height',
      'weight',
      'shoulder_to_crotch',
      'nape_to_waist',
      'back_length',
      'front_length',
      'inseam',
      'inseam_length',
      'outseam',
      'outseam_length',
      'leg_length',
      'crotch_depth',
      'hip_to_knee',
      'knee_to_ankle',
      'waist_height',
      'neck_height',
      'ankle_height',
    ],
  },
  {
    title: 'Legs',
    keys: ['thigh', 'mid_thigh', 'lower_thigh', 'knee', 'calf', 'ankle'],
  },
];

const ORDER = GROUPS.flatMap((g) => g.keys);
const GROUP_OF: Record<string, string> = Object.fromEntries(
  GROUPS.flatMap((g) => g.keys.map((k) => [k, g.title]))
);

export const BODY_TYPE_LABELS: Record<string, string> = {
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

export const prettify = (key: string): string =>
  LABELS[key] ??
  key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const fitLabel = (fit: string): string =>
  fit.replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export const convert = (
  value: number,
  from: 'cm' | 'inch',
  to: Unit
): number => {
  const target = to === 'in' ? 'inch' : 'cm';
  if (from === target) return value;
  return target === 'inch' ? value / 2.54 : value * 2.54;
};

export const formatValue = (value: number): string =>
  Number.isInteger(value) ? `${value}` : value.toFixed(1);

export interface MeasurementRow {
  key: string;
  label: string;
  value: number;
  group: string;
}

/** Recorded values only, in reading order. Nothing is invented to fill a gap. */
export const toRows = (
  measurements: Record<string, number> | undefined | null
): MeasurementRow[] =>
  Object.entries(measurements ?? {})
    .filter(
      ([, value]) =>
        typeof value === 'number' && Number.isFinite(value) && value > 0
    )
    .map(([key, value]) => ({
      key,
      label: prettify(key),
      value,
      group: GROUP_OF[key] ?? 'Other',
      rank: ORDER.indexOf(key),
    }))
    .sort((a, b) => {
      const left = a.rank === -1 ? ORDER.length : a.rank;
      const right = b.rank === -1 ? ORDER.length : b.rank;
      return left - right;
    })
    .map(({ rank: _rank, ...row }) => row);

export const UnitToggle = ({
  unit,
  onChange,
}: {
  unit: Unit;
  onChange: (unit: Unit) => void;
}) => (
  <div className="inline-flex items-center rounded-full bg-white p-1 text-xs font-semibold shadow-sm dark:bg-card">
    {(['cm', 'in'] as const).map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={unit === option}
        onClick={() => onChange(option)}
        className={cn(
          'cursor-pointer rounded-full px-3 py-1 uppercase transition-colors',
          unit === option
            ? 'bg-primary text-primary-foreground'
            : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
        )}
      >
        {option}
      </button>
    ))}
  </div>
);

/**
 * The profile sheet's identity box, for a measurement set: whose it is, when
 * it was taken, and three headline figures split by thin rules.
 */
export const SummaryCard = ({
  title,
  subtitle,
  rows,
  fromUnit,
  unit,
}: {
  title: string;
  subtitle?: string;
  rows: MeasurementRow[];
  fromUnit: 'cm' | 'inch';
  unit: Unit;
}) => {
  const pick = ['height', 'chest', 'bust', 'waist', 'hip', 'hips']
    .map((k) => rows.find((r) => r.key === k))
    .filter((r): r is MeasurementRow => Boolean(r));
  const stats = (pick.length >= 3 ? pick : [...pick, ...rows])
    .filter((r, i, a) => a.findIndex((x) => x.key === r.key) === i)
    .slice(0, 3);

  return (
    <div
      className={cn(PANEL_CARD, 'flex flex-col items-center p-6 text-center')}
    >
      <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-white dark:bg-card">
        <Ruler className="size-6 text-primary" />
      </div>
      <p className="text-base font-semibold text-[#0C0C0D] dark:text-white">
        {title}
      </p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
      {stats.length > 0 && (
        <div className="mt-5 flex w-full items-center justify-center">
          {stats.map((stat, i) => (
            <div key={stat.key} className="flex flex-1 items-center">
              {i > 0 && (
                <div className="mx-2 h-10 w-px bg-[#DDE2E5] dark:bg-border" />
              )}
              <div className="flex flex-1 flex-col items-center">
                <p className="text-lg font-bold tabular-nums text-[#0C0C0D] dark:text-white">
                  {formatValue(convert(stat.value, fromUnit, unit))}
                  <span className="ml-0.5 text-xs font-medium text-gray-500">
                    {unit}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {stat.label.replace(/ (Circ|Circum)\.$/, '')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/** Grouped cards of label / value rows. */
export const MeasurementGroups = ({
  rows,
  fromUnit,
  unit,
  verifyKeys,
}: {
  rows: MeasurementRow[];
  fromUnit: 'cm' | 'inch';
  unit: Unit;
  /** Rows the estimate marked rough: verify on the customer before cutting. */
  verifyKeys?: Set<string>;
}) => {
  const groups = rows.reduce<{ title: string; rows: MeasurementRow[] }[]>(
    (acc, row) => {
      const last = acc[acc.length - 1];
      if (last?.title === row.group) last.rows.push(row);
      else acc.push({ title: row.group, rows: [row] });
      return acc;
    },
    []
  );

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.title} className={cn(PANEL_CARD, 'px-4 pt-3 pb-1')}>
          <p className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {group.title}
          </p>
          <div className="divide-y divide-[#E6E8EA] dark:divide-border">
            {group.rows.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-gray-600 dark:text-gray-300">
                  {row.label}
                </span>
                {verifyKeys?.has(row.key) && (
                  <div
                    title="Estimated roughly. Measure the customer before cutting."
                    className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  >
                    Verify
                  </div>
                )}
                <span className="shrink-0 text-sm font-semibold tabular-nums text-[#0C0C0D] dark:text-white">
                  {formatValue(convert(row.value, fromUnit, unit))}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * The silhouette the classifier names, as a plain outline. The families differ
 * only in where the width sits, which is exactly what a shape shows.
 */
export const BodyShape = ({ type }: { type: string }) => {
  const shapes: Record<string, ReactNode> = {
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
      className="h-28 w-auto shrink-0 fill-white stroke-primary/50 stroke-[3] dark:fill-card"
    >
      {shape}
    </svg>
  );
};

export interface PanelBodyType {
  type: string;
  confidence?: string;
  flattering_fits?: string[];
  avoid_fits?: string[];
  computed_at?: string | null;
}

const FitChips = ({ fits, muted }: { fits: string[]; muted?: boolean }) => (
  <div className="flex flex-wrap gap-1.5">
    {fits.map((fit) => (
      <span
        key={fit}
        className={cn(
          'rounded-full px-2.5 py-0.5 text-xs',
          muted
            ? 'bg-transparent text-gray-500 ring-1 ring-[#DDE2E5] dark:text-gray-400 dark:ring-border'
            : 'bg-white text-[#0C0C0D] dark:bg-card dark:text-white'
        )}
      >
        {fitLabel(fit)}
      </span>
    ))}
  </div>
);

export const BodyTypeCard = ({
  bodyType,
  gender,
  checkedLabel,
}: {
  bodyType: PanelBodyType;
  gender?: string | null;
  /** "Last checked 2 days ago", or how it was derived when it was not stored. */
  checkedLabel: string;
}) => {
  const label = BODY_TYPE_LABELS[bodyType.type] ?? prettify(bodyType.type);
  const genderLabel = gender
    ? gender.charAt(0).toUpperCase() + gender.slice(1)
    : null;
  const flattering = bodyType.flattering_fits ?? [];
  const avoid = bodyType.avoid_fits ?? [];

  return (
    <section className={cn(PANEL_CARD, 'p-5')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#0C0C0D] dark:text-white">
            Body Type{genderLabel ? ` - ${genderLabel}` : ''}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {checkedLabel}
          </p>
        </div>
        {bodyType.confidence && (
          <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium capitalize text-gray-600 dark:bg-card dark:text-gray-300">
            {bodyType.confidence} confidence
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <span className="inline-block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#0C0C0D] dark:bg-card dark:text-white">
            {label}
          </span>
          {flattering.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Flattering fits
              </p>
              <FitChips fits={flattering} />
            </div>
          )}
          {avoid.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Avoid
              </p>
              <FitChips fits={avoid} muted />
            </div>
          )}
        </div>
        <BodyShape type={bodyType.type} />
      </div>
    </section>
  );
};

export const EmptyState = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-border px-6 py-12 text-center">
    <Ruler className="size-7 text-gray-300 dark:text-gray-600" />
    <p className="text-sm font-medium text-[#0C0C0D] dark:text-white">
      {title}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

/** The floating panel the profile sheet uses: inset card on desktop, 85% bottom sheet on phones. */
export const PANEL_SHEET_CLASS =
  'sheet-mobile-fill flex w-full flex-col overflow-hidden p-0 sm:max-w-md sm:!top-6 sm:!bottom-6 sm:!right-6 sm:!h-[calc(100vh-3rem)] sm:rounded-[15px] custom-card-shadow !bg-white dark:!bg-card border';

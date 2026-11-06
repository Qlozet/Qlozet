// Words and numbers for the Measurement accuracy page (GET
// /admin/measurements/accuracy). The correction log records each time a
// number we had was replaced by a better one; fit feedback says where
// delivered made-to-fit pieces were off. Nothing is corrected automatically
// yet: the page shows what's being collected and which parts have enough.
//
// Fit areas mirror the backend's orders/fit-feedback.ts and garment names
// its common/utils/garment-measurements.ts (as does the vendor app's
// lib/garment-check.ts). Keep in step.

export interface AccuracyStats {
  count: number;
  /** Average (after − before) in cm. Positive: our number ran small. */
  bias_cm: number;
  /** Average size of the change in cm, ignoring direction. */
  mae_cm: number;
}

export interface PartAccuracy {
  part: string;
  /** Corrections of estimated values: how far off the estimator runs. */
  estimated: AccuracyStats | null;
  /** Corrections of typed or measured values: how far off people measure. */
  measured: AccuracyStats | null;
  ready_to_calibrate: boolean;
}

export interface FitIssueCount {
  area: string;
  problem: string;
  garment: string | null;
  count: number;
}

export interface MeasurementAccuracy {
  min_samples_to_calibrate: number;
  corrections: {
    total: number;
    left_out_as_slips: number;
    by_source: Record<string, number>;
    parts: PartAccuracy[];
  };
  fit: {
    outcomes: Record<string, number>;
    issues: FitIssueCount[];
  };
}

export const DEFAULT_MIN_SAMPLES = 30;

export const SOURCE_LABELS: Record<string, string> = {
  tailor_question: 'Answers to a tailor’s question',
  profile_edit: 'Customers typing over an estimate',
};

export const sourceLabel = (source: string): string =>
  SOURCE_LABELS[source] ?? source.replace(/_/g, ' ');

/** Under this many cm either way, an average reads as "about right". */
const ON_TARGET_CM = 0.5;

/** Which way our numbers run for a part: small means people corrected up. */
export function biasWord(bias: number | null | undefined): string | null {
  if (typeof bias !== 'number' || Number.isNaN(bias)) return null;
  if (Math.abs(bias) < ON_TARGET_CM) return 'about right';
  return bias > 0 ? 'runs small' : 'runs large';
}

const trim = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? `${r}` : r.toFixed(1);
};

/** "+1.2 cm", "−0.8 cm", "0 cm". */
export function formatBias(bias: number | null | undefined): string {
  if (typeof bias !== 'number' || Number.isNaN(bias)) return '—';
  // Round the size, not the signed value, so −0.75 reads −0.8 like +0.75.
  const size = Math.round(Math.abs(bias) * 10) / 10;
  if (size === 0) return '0 cm';
  return `${bias > 0 ? '+' : '−'}${trim(size)} cm`;
}

/** "±1.4 cm". */
export function formatError(mae: number | null | undefined): string {
  if (typeof mae !== 'number' || Number.isNaN(mae)) return '—';
  return `±${trim(mae)} cm`;
}

/** How close a part is to having enough estimated corrections to calibrate. */
export function readiness(
  part: Pick<PartAccuracy, 'estimated' | 'ready_to_calibrate'>,
  min: number = DEFAULT_MIN_SAMPLES
): { ready: boolean; label: string; percent: number } {
  const count = part.estimated?.count ?? 0;
  const ready = part.ready_to_calibrate || count >= min;
  return {
    ready,
    label: ready ? 'Ready' : `${count} of ${min}`,
    percent: min > 0 ? Math.min(100, Math.round((count / min) * 100)) : 100,
  };
}

export const sumCounts = (counts: Record<string, number> | null | undefined) =>
  Object.values(counts ?? {}).reduce(
    (a, b) => a + (typeof b === 'number' ? b : 0),
    0
  );

// ── Fit feedback ──

export const FIT_OUTCOMES = ['perfect', 'minor_issues', 'poor'] as const;

export const FIT_OUTCOME_LABELS: Record<string, string> = {
  perfect: 'Fit perfectly',
  minor_issues: 'Minor issues',
  poor: 'Did not fit',
};

const ROUND_AREA_WORDS: Record<string, string> = {
  neck: 'the neck',
  chest: 'the chest',
  waist: 'the waist',
  hip: 'the hips',
  shoulder: 'the shoulders',
  arm: 'the arms',
  thigh: 'the thighs',
};

const LENGTH_AREA_WORDS: Record<string, string> = {
  sleeve_length: 'Sleeves',
  top_length: 'Top',
  trouser_length: 'Trousers',
  dress_length: 'Dress',
};

/** One issue in plain words: "Tight at the chest", "Sleeves too long". */
export function fitIssueSentence({
  area,
  problem,
}: {
  area: string;
  problem: string;
}): string {
  if (LENGTH_AREA_WORDS[area])
    return `${LENGTH_AREA_WORDS[area]} too ${problem}`;
  const where = ROUND_AREA_WORDS[area] ?? `the ${area.replace(/_/g, ' ')}`;
  return `${problem.charAt(0).toUpperCase()}${problem.slice(1)} at ${where}`;
}

const GARMENT_WORDS: Record<string, string> = {
  top: 'Tops',
  trousers: 'Trousers',
  shorts: 'Shorts',
  skirt: 'Skirts',
  dress: 'Dresses',
  jumpsuit: 'Jumpsuits',
  robe: 'Agbada & kaftans',
  suit: 'Suits',
  set: 'Sets',
  swimwear: 'Swimwear',
};

/** The garment an issue was on, as a column value ("Agbada & kaftans"). */
export const garmentWord = (garment: string | null | undefined): string =>
  garment
    ? (GARMENT_WORDS[garment] ?? garment.replace(/_/g, ' '))
    : 'Not known';

// What a garment needs from a measurement set, and how a delivered piece fit,
// in words a tailor can act on.
//
// The backend saves `measurement_check` on every made-to-fit order line (and
// on the bespoke quote detail): which of the garment's needed points are only
// rough estimates, and which extras a tailor often wants that the set lacks.
// The need ids, their keys and the garment names mirror the backend's
// common/utils/garment-measurements.ts; fit areas mirror orders/fit-feedback.ts.
// Keep in step when either changes.

export type GarmentKind =
  | 'top'
  | 'trousers'
  | 'shorts'
  | 'skirt'
  | 'dress'
  | 'jumpsuit'
  | 'robe'
  | 'suit'
  | 'set'
  | 'swimwear';

export interface MeasurementCheck {
  garment: GarmentKind | string;
  /** Always empty on a placed order (checkout refuses otherwise). */
  missing: string[];
  /** Needed points that are only rough estimates. Confirm before cutting. */
  rough: string[];
  /** Extras a tailor often wants for this garment that the set lacks. */
  helpful_missing: string[];
}

/** The keys that satisfy each need, best first (backend NEED_KEYS). */
export const NEED_KEYS: Record<string, string[]> = {
  chest: ['chest', 'bust'],
  waist: ['waist', 'belly_waist'],
  hip: ['hip', 'hips'],
  shoulder: ['shoulder_width', 'shoulder_breadth', 'shoulder'],
  sleeve: ['sleeve_length', 'arm_length'],
  top_length: [
    'nape_to_waist',
    'shoulder_to_crotch',
    'front_length',
    'back_length',
    'height',
  ],
  torso: ['shoulder_to_crotch', 'nape_to_waist'],
  full_length: ['height', 'neck_height'],
  trouser_length: ['outseam', 'inseam', 'leg_length'],
  thigh: ['thigh', 'mid_thigh'],
  bicep: ['bicep', 'upper_arm'],
  wrist: ['wrist'],
  neck: ['neck', 'neck_base', 'neck_circumference'],
  under_bust: ['under_bust'],
  knee: ['knee'],
  ankle: ['ankle'],
  across_back: ['across_back'],
};

/** Need names in a sentence (backend NEED_LABELS). */
export const NEED_LABELS: Record<string, string> = {
  chest: 'chest',
  waist: 'waist',
  hip: 'hips',
  shoulder: 'shoulder',
  sleeve: 'sleeve or arm length',
  top_length: 'torso length or height',
  torso: 'torso length',
  full_length: 'height',
  trouser_length: 'leg length',
  thigh: 'thigh',
  bicep: 'bicep',
  wrist: 'wrist',
  neck: 'neck',
  under_bust: 'under bust',
  knee: 'knee',
  ankle: 'ankle',
  across_back: 'across back',
};

export const GARMENT_LABELS: Record<GarmentKind, string> = {
  top: 'top',
  trousers: 'pair of trousers',
  shorts: 'pair of shorts',
  skirt: 'skirt',
  dress: 'dress',
  jumpsuit: 'jumpsuit',
  robe: 'agbada or kaftan',
  suit: 'suit',
  set: 'set',
  swimwear: 'swimwear piece',
};

const needLabel = (id: string) => NEED_LABELS[id] ?? id.replace(/_/g, ' ');

export const garmentLabel = (garment: string): string =>
  GARMENT_LABELS[garment as GarmentKind] ?? garment.replace(/_/g, ' ');

export interface GarmentNote {
  /** "For this agbada or kaftan" */
  title: string;
  /** "Confirm before cutting: shoulder, sleeve or arm length" */
  confirm: string | null;
  /** "You may also want: neck, bicep" */
  alsoWant: string | null;
}

/** The note for a line, or null when there is nothing to say. */
export function garmentNote(
  check: MeasurementCheck | null | undefined
): GarmentNote | null {
  if (!check) return null;
  const rough = check.rough ?? [];
  const extra = check.helpful_missing ?? [];
  if (!rough.length && !extra.length) return null;
  return {
    title: `For this ${garmentLabel(check.garment)}`,
    confirm: rough.length
      ? `Confirm before cutting: ${rough.map(needLabel).join(', ')}`
      : null,
    alsoWant: extra.length
      ? `You may also want: ${extra.map(needLabel).join(', ')}`
      : null,
  };
}

/** Each order line's check by its item id, for the order measurements card. */
export function measurementChecksByItem(
  order:
    | {
        items?: { _id?: string; measurement_check?: MeasurementCheck | null }[];
      }
    | null
    | undefined
): Record<string, MeasurementCheck> {
  const out: Record<string, MeasurementCheck> = {};
  for (const item of order?.items ?? []) {
    if (item?._id && item.measurement_check) {
      out[String(item._id)] = item.measurement_check;
    }
  }
  return out;
}

const positive = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

/**
 * The measurement keys to pre-pick when the tailor asks the customer about
 * the note: the recorded keys behind each rough point, and the best key for
 * each missing extra (every first key is one a customer can answer with).
 */
export function askKeysFor(
  check: MeasurementCheck | null | undefined,
  measurements: Record<string, unknown> | null | undefined
): string[] {
  if (!check) return [];
  const m = measurements ?? {};
  const keys: string[] = [];
  for (const need of check.rough ?? []) {
    const present = (NEED_KEYS[need] ?? []).filter((k) => positive(m[k]));
    keys.push(...present);
  }
  for (const need of check.helpful_missing ?? []) {
    const first = NEED_KEYS[need]?.[0];
    if (first) keys.push(first);
  }
  return Array.from(new Set(keys));
}

/** A starting message for that question; the tailor can edit it. */
export function askDraft(check: MeasurementCheck | null | undefined): string {
  const note = garmentNote(check);
  if (!check || !note) return '';
  const rough = (check.rough ?? []).map(needLabel);
  const extra = (check.helpful_missing ?? []).map(needLabel);
  const parts: string[] = [];
  if (rough.length) {
    parts.push(
      `Before I cut your ${garmentLabel(check.garment)}, could you measure your ${rough.join(', ')} with a tape?`
    );
  }
  if (extra.length) {
    parts.push(
      `${rough.length ? 'Could you also' : `To make your ${garmentLabel(check.garment)} fit well, could you`} add your ${extra.join(', ')}?`
    );
  }
  return parts.join(' ');
}

// ── Fit feedback ──

export type FitOutcome = 'perfect' | 'minor_issues' | 'poor';

export interface FitIssue {
  area: string;
  problem: string;
}

export interface FitFeedback {
  fit: FitOutcome;
  comment?: string | null;
  issues?: FitIssue[];
  garment?: string | null;
  created_at?: string;
}

export const FIT_OUTCOME_LABELS: Record<FitOutcome, string> = {
  perfect: 'Fit perfectly',
  minor_issues: 'Minor fit issues',
  poor: 'Did not fit well',
};

/** Round-the-body areas: "Tight at the chest". */
const ROUND_AREA_WORDS: Record<string, string> = {
  neck: 'the neck',
  chest: 'the chest',
  waist: 'the waist',
  hip: 'the hips',
  shoulder: 'the shoulders',
  arm: 'the arms',
  thigh: 'the thighs',
};

/** Lengths: "Sleeves too long". */
const LENGTH_AREA_WORDS: Record<string, string> = {
  sleeve_length: 'Sleeves',
  top_length: 'Top',
  trouser_length: 'Trousers',
  dress_length: 'Dress',
};

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** One issue in plain words: "Tight at the chest", "Sleeves too long". */
export function fitIssueSentence({ area, problem }: FitIssue): string {
  if (LENGTH_AREA_WORDS[area]) {
    return `${LENGTH_AREA_WORDS[area]} too ${problem}`;
  }
  const where = ROUND_AREA_WORDS[area] ?? `the ${area.replace(/_/g, ' ')}`;
  return `${capitalise(problem)} at ${where}`;
}

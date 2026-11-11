// What the template studio sends the outfit generator, kept in step with the
// shop studio (qlozet-shop src/hooks/useCustomization.ts): the garment by name,
// a sentence saying what it is, colour as a word, and fit. Templates seed the
// shop studio, so the ids saved here (fit, colour) must match the shop's.

import type { PlatformStyle } from '@/redux/services/style-library/style-library.api-slice';
import { EMBELLISHMENTS, filterEmbellishments } from './embellishments';

export type Gender = 'women' | 'men';
export type GenderKey = 'male' | 'female';
export type Scope = 'top' | 'bottom' | 'full_body';
export type SelectionKey = 'silhouette' | 'neckline' | 'sleeve' | 'collar';
export type Selections = Record<SelectionKey, string | null>;

export const EMPTY_SELECTIONS: Selections = {
  silhouette: null,
  neckline: null,
  sleeve: null,
  collar: null,
};

export const CATEGORIES: Record<Gender, string[]> = {
  women: ['Tops', 'Dresses', 'Skirts', 'Pants', 'Jumpsuits', 'Sets'],
  men: ['Kaftan', 'Agbada', 'Pants', 'Shirts', 'Suits', 'Sets'],
};

const SCOPE: Record<string, Scope> = {
  tops: 'top',
  shirts: 'top',
  dresses: 'full_body',
  jumpsuits: 'full_body',
  kaftan: 'full_body',
  agbada: 'full_body',
  sets: 'full_body',
  suits: 'full_body',
  skirts: 'bottom',
  pants: 'bottom',
};

export const scopeFor = (category: string): Scope =>
  SCOPE[category.toLowerCase()] ?? 'full_body';

export const genderKeyFor = (gender: Gender): GenderKey =>
  gender === 'men' ? 'male' : 'female';

/** Agbada and kaftan can be shown with or without trousers. */
export const hasOptionalTrousers = (category: string) =>
  ['agbada', 'kaftan'].includes(category.toLowerCase());

/**
 * The garment by name, as the shop sends it. Not plain "male_agbada": the
 * backend has a schema under that key that adds chest embroidery.
 */
export function garmentTypeFor(
  gender: Gender,
  category: string,
  withTrousers: boolean
): string {
  const c = category.toLowerCase();
  const name: Record<string, string> = {
    tops: 'top',
    shirts: 'shirt',
    dresses: 'dress',
    skirts: 'skirt',
    pants: 'trousers',
    jumpsuits: 'jumpsuit',
    sets: 'two_piece_set',
    suits: 'suit',
    kaftan: withTrousers ? 'kaftan_with_trousers' : 'kaftan',
    agbada: withTrousers ? 'agbada_three_piece' : 'agbada_robe_and_inner_top',
  };
  const prefix = genderKeyFor(gender);
  return name[c] ? `${prefix}_${name[c]}` : prefix;
}

/** What the outfit is, in words the generator can't misread. */
export function garmentSentence(category: string, withTrousers: boolean) {
  switch (category.toLowerCase()) {
    case 'agbada':
      return withTrousers
        ? 'A three-piece agbada: a wide, flowing outer robe worn over a long inner top, with trousers.'
        : 'An agbada: a wide, flowing outer robe worn over a long inner top. No trousers showing.';
    case 'kaftan':
      return withTrousers
        ? 'A kaftan: a long tunic top worn with trousers.'
        : 'A kaftan: a long tunic top.';
    case 'dresses':
      return 'A one-piece dress.';
    case 'jumpsuits':
      return 'A jumpsuit: one piece, the top joined to trouser legs.';
    case 'suits':
      return 'A suit: a tailored jacket with trousers.';
    case 'sets':
      return 'A two-piece set: a separate top and bottom.';
    default:
      return '';
  }
}

/** The shop studio's fabric colours, with the words the generator gets. */
export const COLORS: { hex: string; name: string }[] = [
  { hex: '#1B2A4A', name: 'navy blue' },
  { hex: '#8B4513', name: 'saddle brown' },
  { hex: '#2C1810', name: 'dark chocolate brown' },
  { hex: '#D4AF37', name: 'metallic gold' },
  { hex: '#800020', name: 'burgundy' },
  { hex: '#F5F0E8', name: 'off-white' },
  { hex: '#3B5998', name: 'royal blue' },
  { hex: '#228B22', name: 'forest green' },
  { hex: '#FF6347', name: 'tomato red' },
  { hex: '#4B0082', name: 'indigo purple' },
  { hex: '#E8D5B7', name: 'beige' },
  { hex: '#1A1A1A', name: 'black' },
];

export const colourName = (hex: string | null) =>
  hex
    ? (COLORS.find((c) => c.hex.toUpperCase() === hex.toUpperCase())?.name ??
      hex)
    : null;

/** The shop's fit options; the id is what a template saves. */
export const FIT_OPTIONS = [
  { id: 'fit1', label: 'Regular', desc: 'Standard comfortable fit' },
  { id: 'fit2', label: 'Slim Fit', desc: 'Tailored close to body' },
  { id: 'fit3', label: 'Relaxed', desc: 'Easy, slightly oversized' },
  { id: 'fit4', label: 'Oversized', desc: 'Deliberately loose & roomy' },
];

/**
 * Where the hem falls, as the shop studio offers it (qlozet-shop
 * data/studio-options LENGTH_OPTIONS): dresses and skirts only, unset = the
 * tailor decides. The id is what a template saves.
 */
export const LENGTH_OPTIONS = [
  {
    id: 'mini',
    label: 'Mini',
    desc: 'Well above the knee',
    word: 'mini',
    prompt: 'mini length, well above the knee',
  },
  {
    id: 'knee',
    label: 'Knee',
    desc: 'At the knee',
    word: 'knee-length',
    prompt: 'knee length, the hem at the knee',
  },
  {
    id: 'midi',
    label: 'Midi',
    desc: 'Mid-calf',
    word: 'midi',
    prompt: 'midi length, the hem at mid-calf',
  },
  {
    id: 'ankle',
    label: 'Ankle',
    desc: 'Just above the ankle',
    word: 'ankle-length',
    prompt: 'ankle length, the hem just above the ankle',
  },
  {
    id: 'floor',
    label: 'Floor',
    desc: 'Touches the floor',
    word: 'floor-length',
    prompt: 'floor length, the hem touching the floor',
  },
];

export const hasLength = (category: string) =>
  ['dresses', 'skirts'].includes(category.toLowerCase());

/** The chosen length, when this garment has one. */
export const lengthFor = (
  category: string,
  length: string | null | undefined
) =>
  hasLength(category) ? LENGTH_OPTIONS.find((l) => l.id === length) : undefined;

/** Whether a library style can be used on this garment. */
export function styleFits(
  style: Pick<PlatformStyle, 'category' | 'gender' | 'type' | 'is_active'>,
  genderKey: GenderKey,
  scope: Scope
) {
  return (
    style.is_active !== false &&
    (style.gender === 'unisex' || style.gender === genderKey) &&
    (style.category !== 'full_body' || style.type === scope)
  );
}

/**
 * Keep the picks that still suit a new gender or garment, and drop the rest
 * (a men's collar on a women's dress, a belt on trousers). `dropped` names
 * what went, so the studio can say so.
 */
export function keepFitting(
  selections: Selections,
  embellishments: string[],
  styles: PlatformStyle[],
  genderKey: GenderKey,
  scope: Scope
) {
  const dropped: string[] = [];
  const next: Selections = { ...selections };
  for (const key of Object.keys(next) as SelectionKey[]) {
    const id = next[key];
    if (!id) continue;
    // A style not in the list (still loading) is kept: nothing to judge it by.
    const style = styles.find((s) => s._id === id);
    if (style && !styleFits(style, genderKey, scope)) {
      next[key] = null;
      dropped.push(style.name);
    }
  }
  const allowed = new Set(
    filterEmbellishments(scope, genderKey).map((e) => e.id)
  );
  const keptEmb = embellishments.filter((id) => {
    if (allowed.has(id)) return true;
    const e = EMBELLISHMENTS.find((x) => x.id === id);
    if (e) dropped.push(e.name);
    return false;
  });
  return { selections: next, embellishments: keptEmb, dropped };
}

export interface GenerationInput {
  gender: Gender;
  category: string;
  withTrousers: boolean;
  selections: Selections;
  styles: PlatformStyle[];
  embellishments: string[];
  color: string | null;
  fit: string | null;
  /** A LENGTH_OPTIONS id; ignored for garments without a length. */
  length?: string | null;
  prompt: string;
}

/** The config + prompt for POST /measurements/generate-outfit. */
export function buildGenerationRequest(input: GenerationInput) {
  const byId = (id: string | null) =>
    id ? input.styles.find((s) => s._id === id) : undefined;
  const constructionSelections: Record<string, string> = {};
  const sil = byId(input.selections.silhouette);
  const neck = byId(input.selections.neckline);
  const slv = byId(input.selections.sleeve);
  const col = byId(input.selections.collar);
  if (sil) constructionSelections.silhouette = sil.name;
  if (neck) constructionSelections.neckline = neck.name;
  if (slv) constructionSelections.sleeve_style = slv.name;
  if (col) constructionSelections.collar = col.name;
  // Passed through to the generator's metadata, as the shop sends it.
  const len = lengthFor(input.category, input.length);
  if (len) constructionSelections.hemline = len.prompt;

  const withTrousers =
    hasOptionalTrousers(input.category) && input.withTrousers;
  const config: Record<string, unknown> = {
    garmentType: garmentTypeFor(input.gender, input.category, withTrousers),
    gender: genderKeyFor(input.gender),
    view: 'front',
    constructionSelections,
  };
  const fit = FIT_OPTIONS.find((f) => f.id === input.fit);
  if (fit) {
    config.fit = fit.label.toLowerCase();
    config.fitNotes = fit.desc;
  }
  const emb = input.embellishments
    .map((id) => EMBELLISHMENTS.find((e) => e.id === id)?.name)
    .filter((n): n is string => !!n);
  if (emb.length) config.aestheticKeywords = emb;

  const colour = colourName(input.color);
  const userPrompt = [
    input.prompt.trim(),
    garmentSentence(input.category, withTrousers),
    colour ? `Make the main fabric ${colour}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return { config, userPrompt: userPrompt || undefined };
}

/**
 * The garment in words, for the image editor (refine, back view). Always
 * sent: without it the backend assumes "women's flare mini dress".
 */
export function garmentWords(
  gender: Gender,
  category: string,
  withTrousers: boolean,
  length?: string | null
): string {
  const len = lengthFor(category, length);
  // "women's midi dress": the editor keeps the chosen length.
  const who = `${gender === 'men' ? "men's" : "women's"}${len ? ` ${len.word}` : ''}`;
  const c = category.toLowerCase();
  if (c === 'agbada')
    return `${who} agbada (outer robe over an inner top${withTrousers ? ', with trousers' : ''})`;
  if (c === 'kaftan')
    return `${who} kaftan${withTrousers ? ' with trousers' : ''}`;
  const named: Record<string, string> = {
    tops: 'top',
    shirts: 'shirt',
    dresses: 'dress',
    skirts: 'skirt',
    pants: 'trousers',
    jumpsuits: 'jumpsuit',
    sets: 'two-piece set (top and trousers)',
    suits: 'suit',
  };
  return `${who} ${named[c] ?? 'outfit'}`;
}

/** What a refine asks the editor: change only this. */
export const refineNotes = (instruction: string) =>
  `Change only this and keep everything else exactly as it is: ${instruction.trim()}`;

/** Back views worth saving: one per image the template still has. */
export function backViewsForSave(
  images: string[],
  backs: Record<string, string>
): { front: string; back: string }[] {
  return images
    .filter((front) => backs[front])
    .map((front) => ({ front, back: backs[front] }));
}

// Option catalogues for the platform style forms — mirror the backend enums
// (style-library/schemas/platform-style.schema.ts).

import type {
  StyleCategory,
  StyleGender,
  StyleType,
} from '@/redux/services/style-library/style-library.api-slice';

export const CATEGORY_OPTIONS: { value: StyleCategory; label: string }[] = [
  { value: 'neckline', label: 'Neckline' },
  { value: 'sleeve', label: 'Sleeve' },
  { value: 'collar', label: 'Collar' },
  { value: 'skirt', label: 'Skirt' },
  { value: 'trouser', label: 'Trouser' },
  { value: 'full_body', label: 'Full body' },
  { value: 'bodice', label: 'Bodice' },
  { value: 'hemline', label: 'Hemline' },
  { value: 'back', label: 'Back' },
];

export const TYPE_OPTIONS: { value: StyleType; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'full_body', label: 'Full body' },
  { value: 'accessory', label: 'Accessory' },
];

export const GENDER_OPTIONS: { value: StyleGender; label: string }[] = [
  { value: 'unisex', label: 'Unisex' },
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

export const GENDER_LABELS = Object.fromEntries(
  GENDER_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

/** Suggest a style code from a name: "Deep V-Neck" → "DEEP_V_NECK". */
export const suggestStyleCode = (name: string): string =>
  name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);

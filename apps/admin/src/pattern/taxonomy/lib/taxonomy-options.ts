import type {
  TaxonomyKind,
  TagAssignableBy,
} from '@/redux/services/taxonomy/taxonomy.api-slice';

export const KIND_OPTIONS: { value: TaxonomyKind; label: string }[] = [
  { value: 'clothing', label: 'Clothing' },
  { value: 'fabric', label: 'Fabric' },
  { value: 'accessory', label: 'Accessory' },
];

export const KIND_LABELS: Record<string, string> = {
  clothing: 'Clothing',
  fabric: 'Fabric',
  accessory: 'Accessory',
};

export const ASSIGNABLE_OPTIONS: { value: TagAssignableBy; label: string }[] = [
  { value: 'vendor', label: 'Vendors' },
  { value: 'admin_only', label: 'Admin only' },
];

export const ASSIGNABLE_LABELS: Record<string, string> = {
  vendor: 'Vendors',
  admin_only: 'Admin only',
};

/** Mirrors the backend slugify: lowercase, spaces → dashes. */
export const slugify = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

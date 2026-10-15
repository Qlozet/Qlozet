/**
 * How finished a store profile is, as the things a shopper notices. Each
 * item names the section of the profile form that fixes it, so the hero can
 * link straight to it. Pure: the page renders whatever this returns.
 */
export interface CompletenessItem {
  key: string;
  label: string;
  /** id of the form section to scroll to */
  anchor: string;
  ok: boolean;
}

export interface ProfileCompleteness {
  items: CompletenessItem[];
  done: number;
  total: number;
  percent: number;
  missing: CompletenessItem[];
}

export interface CompletenessInput {
  business_logo_url?: string | null;
  cover_image_url?: string | null;
  description?: string | null;
  business_phone_number?: string | null;
  business_address?: string | null;
  website?: string | null;
  social_links?: Record<string, string | undefined> | null;
}

export const ABOUT_MIN = 60;

export function profileCompleteness(
  b: CompletenessInput | null | undefined
): ProfileCompleteness {
  const about = (b?.description ?? '').trim();
  const socials = Object.values(b?.social_links ?? {}).filter((v) =>
    (v ?? '').trim()
  );
  const items: CompletenessItem[] = [
    {
      key: 'logo',
      label: 'Add a logo',
      anchor: 'profile-brand',
      ok: Boolean(b?.business_logo_url),
    },
    {
      key: 'cover',
      label: 'Add a cover photo',
      anchor: 'profile-brand',
      ok: Boolean(b?.cover_image_url),
    },
    {
      key: 'about',
      label: about
        ? `Say more about the store (${about.length}/${ABOUT_MIN})`
        : 'Describe the store',
      anchor: 'profile-about',
      ok: about.length >= ABOUT_MIN,
    },
    {
      key: 'phone',
      label: 'Add a phone number',
      anchor: 'profile-contact',
      ok: Boolean((b?.business_phone_number ?? '').trim()),
    },
    {
      key: 'address',
      label: 'Add the store address',
      anchor: 'profile-location',
      ok: Boolean((b?.business_address ?? '').trim()),
    },
    {
      key: 'links',
      label: 'Add a website or a social link',
      anchor: 'profile-social',
      ok: Boolean((b?.website ?? '').trim()) || socials.length > 0,
    },
  ];
  const done = items.filter((i) => i.ok).length;
  return {
    items,
    done,
    total: items.length,
    percent: Math.round((done / items.length) * 100),
    missing: items.filter((i) => !i.ok),
  };
}

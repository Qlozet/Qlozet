// Phone numbers on sign-up: the country list, splitting a stored number into
// country + local part, reading what people type or paste, and the validity
// check. Uses the same library and metadata ("max") as the backend's
// @IsPhoneNumber, so a number this page accepts is one the server accepts.

import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/max';

export interface PhoneCountry {
  iso: CountryCode;
  dial: string; // "+234"
  name: string;
  flag: string;
}

/** Shown first; then every other country by name. */
const POPULAR: CountryCode[] = ['NG', 'GH', 'KE', 'ZA', 'US', 'GB'];
export const DEFAULT_COUNTRY: CountryCode = 'NG';

const flagOf = (iso: string) =>
  String.fromCodePoint(
    ...iso
      .toUpperCase()
      .split('')
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );

const regionName = (() => {
  try {
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    return (iso: string) => names.of(iso) ?? iso;
  } catch {
    return (iso: string) => iso;
  }
})();

const toCountry = (iso: CountryCode): PhoneCountry => ({
  iso,
  dial: `+${getCountryCallingCode(iso)}`,
  name: regionName(iso),
  flag: flagOf(iso),
});

export const POPULAR_COUNTRIES: PhoneCountry[] = POPULAR.map(toCountry);
export const OTHER_COUNTRIES: PhoneCountry[] = getCountries()
  .filter((iso) => !POPULAR.includes(iso))
  .map(toCountry)
  .sort((a, b) => a.name.localeCompare(b.name));

const BY_ISO = new Map<string, PhoneCountry>(
  [...POPULAR_COUNTRIES, ...OTHER_COUNTRIES].map((c) => [c.iso, c])
);
export const countryOf = (iso: string): PhoneCountry =>
  BY_ISO.get(iso) ?? (BY_ISO.get(DEFAULT_COUNTRY) as PhoneCountry);

const digits = (s: string) => s.replace(/\D/g, '');

/** "+2348031234567" → Nigeria + "8031234567". Empty → default country. */
export function splitPhone(
  value: string,
  fallbackIso: string = DEFAULT_COUNTRY
): { iso: CountryCode; local: string } {
  const v = (value ?? '').trim();
  if (!v) return { iso: fallbackIso as CountryCode, local: '' };
  const parsed = parsePhoneNumberFromString(v);
  if (parsed?.country) {
    return { iso: parsed.country, local: parsed.nationalNumber };
  }
  // Too short to pin a country yet: keep the chosen one if its code fits.
  const fb = countryOf(fallbackIso);
  if (v.startsWith(fb.dial)) {
    return { iso: fb.iso, local: digits(v.slice(fb.dial.length)) };
  }
  const match = [...BY_ISO.values()]
    .filter((c) => v.startsWith(c.dial))
    .sort((a, b) => b.dial.length - a.dial.length)[0];
  if (match)
    return { iso: match.iso, local: digits(v.slice(match.dial.length)) };
  return { iso: fb.iso, local: digits(v) };
}

/**
 * What was typed or pasted into the local box, given the chosen country.
 * Handles "0803 123 4567" (drops the 0), "+234 803…" and "00234 803…"
 * (a full number: takes its country), and "2348031234567" (the country code
 * typed without the +).
 */
export function readTyped(
  raw: string,
  currentIso: string
): { iso: CountryCode; local: string } {
  const text = (raw ?? '').trim();
  const current = countryOf(currentIso);
  if (text.startsWith('+') || text.startsWith('00')) {
    const full = `+${digits(text).replace(/^00/, '')}`;
    return splitPhone(full, current.iso);
  }
  let d = digits(text);
  const code = current.dial.slice(1);
  // The country code without "+": only when what follows is long enough to
  // be a whole number, so a local number that happens to start the same way
  // isn't cut.
  if (d.startsWith(code) && d.length - code.length >= 8)
    d = d.slice(code.length);
  d = d.replace(/^0+/, ''); // the local leading zero
  return { iso: current.iso, local: d.slice(0, 14) };
}

export const joinPhone = (iso: string, local: string): string =>
  local ? `${countryOf(iso).dial}${local}` : '';

/** The server's rule (class-validator @IsPhoneNumber, libphonenumber max). */
export const isValidPhone = (value: string): boolean => {
  try {
    return isValidPhoneNumber(value);
  } catch {
    return false;
  }
};

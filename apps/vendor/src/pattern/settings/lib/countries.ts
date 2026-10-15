/**
 * Countries offered in the store profile. The address search can return any
 * country, so a select built from this list always includes the current
 * value too - see countryOptions - or a saved country would show as blank.
 */
export const COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Senegal',
  "Côte d'Ivoire",
  'Cameroon',
  'Uganda',
  'Rwanda',
  'Ethiopia',
  'Egypt',
  'Morocco',
  'United Kingdom',
  'United States',
  'Canada',
  'Ireland',
  'France',
  'Germany',
  'Netherlands',
  'Italy',
  'Spain',
  'United Arab Emirates',
  'Australia',
] as const;

export const countryOptions = (current?: string): string[] => {
  const value = (current ?? '').trim();
  if (!value || (COUNTRIES as readonly string[]).includes(value))
    return [...COUNTRIES];
  return [value, ...COUNTRIES];
};

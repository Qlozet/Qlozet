// The backend stores a phone number as a single string (e.g. "+2348012345673").
// The profile forms show the dial code in a select and the rest in a text
// input, so both halves are derived from — and written back into — that one
// value; neither control holds state of its own.

export const DIAL_CODES = ['+234', '+1', '+44'] as const;

export const splitPhone = (
  value?: string
): { code: string; national: string } => {
  const trimmed = (value ?? '').trim();
  const code = DIAL_CODES.find((dial) => trimmed.startsWith(dial));
  return code
    ? { code, national: trimmed.slice(code.length).trim() }
    : { code: DIAL_CODES[0], national: trimmed };
};

export const joinPhone = (code: string, national: string): string => {
  const value = national.trim();
  // A pasted international number already carries its own dial code.
  return value.startsWith('+') ? value : `${code}${value}`;
};

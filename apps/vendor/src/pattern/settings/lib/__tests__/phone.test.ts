// The dial-code select and the number input are two views of one stored
// string. splitPhone/joinPhone must round-trip, or editing a profile silently
// rewrites the vendor's phone number.

import { describe, expect, it } from 'vitest';
import { DIAL_CODES, joinPhone, splitPhone } from '../phone';

describe('splitPhone', () => {
  it('splits a known dial code off the front', () => {
    expect(splitPhone('+2348012345673')).toEqual({
      code: '+234',
      national: '8012345673',
    });
    expect(splitPhone('+15551234567')).toEqual({ code: '+1', national: '5551234567' });
    expect(splitPhone('+447700900123')).toEqual({ code: '+44', national: '7700900123' });
  });

  it('defaults to the first dial code for a bare national number', () => {
    expect(splitPhone('08012345673')).toEqual({
      code: DIAL_CODES[0],
      national: '08012345673',
    });
  });

  it('trims surrounding whitespace', () => {
    expect(splitPhone('  +234 8012345673 ')).toEqual({
      code: '+234',
      national: '8012345673',
    });
  });

  it('handles an empty or missing value', () => {
    expect(splitPhone('')).toEqual({ code: DIAL_CODES[0], national: '' });
    expect(splitPhone(undefined)).toEqual({ code: DIAL_CODES[0], national: '' });
  });

  // An unsupported code must not be silently swallowed — it stays in the
  // number so nothing is lost.
  it('keeps an unrecognised dial code in the national part', () => {
    expect(splitPhone('+2331234567')).toEqual({
      code: DIAL_CODES[0],
      national: '+2331234567',
    });
  });
});

describe('joinPhone', () => {
  it('prefixes the selected dial code', () => {
    expect(joinPhone('+234', '8012345673')).toBe('+2348012345673');
  });

  it('trims the typed number', () => {
    expect(joinPhone('+234', '  8012345673  ')).toBe('+2348012345673');
  });

  it('does not double up when a full international number is pasted', () => {
    expect(joinPhone('+234', '+15551234567')).toBe('+15551234567');
  });
});

describe('round-trip', () => {
  it('returns the original value for every supported code', () => {
    for (const stored of ['+2348012345673', '+15551234567', '+447700900123']) {
      const { code, national } = splitPhone(stored);
      expect(joinPhone(code, national)).toBe(stored);
    }
  });
});

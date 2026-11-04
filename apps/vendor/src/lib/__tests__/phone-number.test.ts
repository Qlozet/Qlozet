// Sign-up phone numbers: what people type or paste must come out as the
// one number the server will accept, never a doubled country code.

import { describe, expect, it } from 'vitest';
import {
  OTHER_COUNTRIES,
  POPULAR_COUNTRIES,
  isValidPhone,
  joinPhone,
  readTyped,
  splitPhone,
} from '../phone-number';

const typed = (raw: string, iso = 'NG') => {
  const r = readTyped(raw, iso);
  return joinPhone(r.iso, r.local);
};

describe('readTyped', () => {
  it('drops the local leading zero and spacing', () => {
    expect(typed('0803 123 4567')).toBe('+2348031234567');
  });

  it('takes a pasted full number as it is, not doubled', () => {
    expect(typed('+234 803 123 4567')).toBe('+2348031234567');
    expect(typed('+234 (0) 803-123-4567')).toBe('+2348031234567');
  });

  it('reads 00 as +', () => {
    expect(typed('00234 803 123 4567')).toBe('+2348031234567');
  });

  it('strips the country code typed without the +', () => {
    expect(typed('2348031234567')).toBe('+2348031234567');
  });

  it('switches country when a pasted number is from elsewhere', () => {
    const r = readTyped('+44 7400 123456', 'NG');
    expect(r.iso).toBe('GB');
    expect(joinPhone(r.iso, r.local)).toBe('+447400123456');
  });

  it('keeps a short local number intact', () => {
    expect(typed('803')).toBe('+234803');
  });
});

describe('splitPhone', () => {
  it('round-trips a stored number', () => {
    const { iso, local } = splitPhone('+2348031234567');
    expect(iso).toBe('NG');
    expect(joinPhone(iso, local)).toBe('+2348031234567');
  });

  it('keeps the chosen country while the number is still empty', () => {
    expect(splitPhone('', 'CM')).toEqual({ iso: 'CM', local: '' });
  });
});

describe('isValidPhone (the server rule)', () => {
  it('accepts real numbers on every Nigerian network', () => {
    for (const n of [
      '+2348031234567',
      '+2347041234567',
      '+2349131234567',
      '+2349161234567',
      '+2347011234567',
    ]) {
      expect(isValidPhone(n)).toBe(true);
    }
  });

  it('accepts other countries', () => {
    expect(isValidPhone('+237671234567')).toBe(true); // Cameroon
    expect(isValidPhone('+221771234567')).toBe(true); // Senegal
  });

  it('refuses a number a digit short or doubled', () => {
    expect(isValidPhone('+234803123456')).toBe(false);
    expect(isValidPhone('+234234803123456')).toBe(false);
  });
});

it('lists every country, the common ones first', () => {
  expect(POPULAR_COUNTRIES[0].iso).toBe('NG');
  expect(POPULAR_COUNTRIES.length + OTHER_COUNTRIES.length).toBeGreaterThan(
    200
  );
  expect(OTHER_COUNTRIES.some((c) => c.iso === 'CM' && c.dial === '+237')).toBe(
    true
  );
});

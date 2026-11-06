import { describe, expect, it } from 'vitest';
import {
  biasWord,
  fitIssueSentence,
  formatBias,
  formatError,
  garmentWord,
  readiness,
  sourceLabel,
  sumCounts,
} from '../measurement-accuracy';

describe('biasWord', () => {
  it('reads a positive average as our numbers running small', () => {
    expect(biasWord(1.8)).toBe('runs small');
    expect(biasWord(-2)).toBe('runs large');
  });

  it('calls a tiny average about right, and says nothing without one', () => {
    expect(biasWord(0.3)).toBe('about right');
    expect(biasWord(-0.4)).toBe('about right');
    expect(biasWord(null)).toBeNull();
    expect(biasWord(undefined)).toBeNull();
  });
});

describe('formatBias / formatError', () => {
  it('signs the average and rounds to a tenth', () => {
    expect(formatBias(1.24)).toBe('+1.2 cm');
    expect(formatBias(-0.75)).toBe('−0.8 cm');
    expect(formatBias(2)).toBe('+2 cm');
    expect(formatBias(0.01)).toBe('0 cm');
    expect(formatBias(null)).toBe('—');
  });

  it('shows the typical error as plus-or-minus', () => {
    expect(formatError(1.44)).toBe('±1.4 cm');
    expect(formatError(3)).toBe('±3 cm');
    expect(formatError(undefined)).toBe('—');
  });
});

describe('readiness', () => {
  it('counts estimated corrections toward the minimum', () => {
    expect(
      readiness(
        {
          estimated: { count: 12, bias_cm: 1, mae_cm: 2 },
          ready_to_calibrate: false,
        },
        30
      )
    ).toEqual({ ready: false, label: '12 of 30', percent: 40 });
  });

  it('is ready at the minimum, and caps the bar at full', () => {
    expect(
      readiness(
        {
          estimated: { count: 45, bias_cm: 1, mae_cm: 2 },
          ready_to_calibrate: true,
        },
        30
      )
    ).toEqual({ ready: true, label: 'Ready', percent: 100 });
  });

  it('starts at nothing when only measured values were corrected', () => {
    expect(readiness({ estimated: null, ready_to_calibrate: false })).toEqual({
      ready: false,
      label: '0 of 30',
      percent: 0,
    });
  });
});

describe('labels', () => {
  it('names the sources and falls back for new ones', () => {
    expect(sourceLabel('tailor_question')).toContain('tailor');
    expect(sourceLabel('photo_reread')).toBe('photo reread');
  });

  it('reads fit issues in plain words', () => {
    expect(fitIssueSentence({ area: 'chest', problem: 'tight' })).toBe(
      'Tight at the chest'
    );
    expect(fitIssueSentence({ area: 'sleeve_length', problem: 'long' })).toBe(
      'Sleeves too long'
    );
  });

  it('names the garment, or says it is not known', () => {
    expect(garmentWord('robe')).toBe('Agbada & kaftans');
    expect(garmentWord(null)).toBe('Not known');
  });

  it('sums counts, treating a missing map as zero', () => {
    expect(sumCounts({ perfect: 3, poor: 1 })).toBe(4);
    expect(sumCounts(undefined)).toBe(0);
  });
});

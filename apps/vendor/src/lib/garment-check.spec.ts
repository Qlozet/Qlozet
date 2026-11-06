import { describe, expect, it } from 'vitest';
import {
  askDraft,
  askKeysFor,
  fitIssueSentence,
  garmentNote,
  measurementChecksByItem,
  type MeasurementCheck,
} from './garment-check';

const check = (patch: Partial<MeasurementCheck> = {}): MeasurementCheck => ({
  garment: 'robe',
  missing: [],
  rough: [],
  helpful_missing: [],
  ...patch,
});

describe('garmentNote', () => {
  it('says nothing without a check, or when both lists are empty', () => {
    expect(garmentNote(null)).toBeNull();
    expect(garmentNote(undefined)).toBeNull();
    expect(garmentNote(check())).toBeNull();
  });

  it('names the garment, the rough points and the extras', () => {
    expect(
      garmentNote(
        check({
          rough: ['shoulder', 'sleeve'],
          helpful_missing: ['neck', 'bicep'],
        })
      )
    ).toEqual({
      title: 'For this agbada or kaftan',
      confirm: 'Confirm before cutting: shoulder, sleeve or arm length',
      alsoWant: 'You may also want: neck, bicep',
    });
  });

  it('leaves out the line it has nothing for', () => {
    const note = garmentNote(
      check({ garment: 'top', helpful_missing: ['neck'] })
    );
    expect(note?.title).toBe('For this top');
    expect(note?.confirm).toBeNull();
    expect(note?.alsoWant).toBe('You may also want: neck');
  });

  it('falls back to readable words for an unknown garment or need', () => {
    expect(
      garmentNote(check({ garment: 'cape_coat', rough: ['upper_back'] }))
    ).toMatchObject({
      title: 'For this cape coat',
      confirm: 'Confirm before cutting: upper back',
    });
  });
});

describe('measurementChecksByItem', () => {
  it('keys each line that carries a check by its id', () => {
    const c = check({ rough: ['chest'] });
    expect(
      measurementChecksByItem({
        items: [
          { _id: 'a', measurement_check: c },
          { _id: 'b', measurement_check: null },
          { measurement_check: c },
        ],
      })
    ).toEqual({ a: c });
    expect(measurementChecksByItem(null)).toEqual({});
  });
});

describe('askKeysFor', () => {
  it('picks the recorded keys behind each rough point', () => {
    expect(
      askKeysFor(check({ rough: ['shoulder', 'sleeve'] }), {
        shoulder_breadth: 44,
        shoulder_width: 47.5,
        arm_length: 60,
        sleeve_length: 0,
      })
    ).toEqual(['shoulder_width', 'shoulder_breadth', 'arm_length']);
  });

  it('picks the best key for each missing extra, once', () => {
    expect(
      askKeysFor(
        check({
          rough: ['trouser_length'],
          helpful_missing: ['neck', 'trouser_length'],
        }),
        { outseam: 102 }
      )
    ).toEqual(['outseam', 'neck']);
  });

  it('is empty without a check', () => {
    expect(askKeysFor(null, { chest: 100 })).toEqual([]);
  });
});

describe('askDraft', () => {
  it('asks to re-measure the rough points and add the extras', () => {
    expect(
      askDraft(check({ rough: ['shoulder'], helpful_missing: ['neck'] }))
    ).toBe(
      'Before I cut your agbada or kaftan, could you measure your shoulder with a tape? Could you also add your neck?'
    );
  });

  it('asks only for the extras when nothing is rough', () => {
    expect(
      askDraft(check({ garment: 'dress', helpful_missing: ['under_bust'] }))
    ).toBe('To make your dress fit well, could you add your under bust?');
  });

  it('is empty when there is nothing to ask', () => {
    expect(askDraft(check())).toBe('');
    expect(askDraft(null)).toBe('');
  });
});

describe('fitIssueSentence', () => {
  it('reads round-the-body areas as tight or loose at a place', () => {
    expect(fitIssueSentence({ area: 'chest', problem: 'tight' })).toBe(
      'Tight at the chest'
    );
    expect(fitIssueSentence({ area: 'hip', problem: 'loose' })).toBe(
      'Loose at the hips'
    );
  });

  it('reads lengths as too long or too short', () => {
    expect(fitIssueSentence({ area: 'sleeve_length', problem: 'long' })).toBe(
      'Sleeves too long'
    );
    expect(fitIssueSentence({ area: 'trouser_length', problem: 'short' })).toBe(
      'Trousers too short'
    );
  });
});

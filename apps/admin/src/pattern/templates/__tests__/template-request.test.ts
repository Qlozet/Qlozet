import { describe, expect, it } from 'vitest';
import type { PlatformStyle } from '@/redux/services/style-library/style-library.api-slice';
import {
  EMPTY_SELECTIONS,
  backViewsForSave,
  buildGenerationRequest,
  colourName,
  garmentTypeFor,
  garmentWords,
  keepFitting,
  refineNotes,
} from '../template-request';

const style = (patch: Partial<PlatformStyle>): PlatformStyle =>
  ({
    _id: 's1',
    name: 'Style',
    style_code: 'X',
    category: 'neckline',
    type: 'top',
    gender: 'unisex',
    is_active: true,
    ...patch,
  }) as PlatformStyle;

const base = {
  gender: 'men' as const,
  category: 'Agbada',
  withTrousers: true,
  selections: EMPTY_SELECTIONS,
  styles: [] as PlatformStyle[],
  embellishments: [] as string[],
  color: null,
  fit: null,
  prompt: '',
};

describe('template generation request', () => {
  it('names the garment, like the shop studio', () => {
    expect(garmentTypeFor('men', 'Agbada', true)).toBe(
      'male_agbada_three_piece'
    );
    expect(garmentTypeFor('men', 'Agbada', false)).toBe(
      'male_agbada_robe_and_inner_top'
    );
    expect(garmentTypeFor('men', 'Kaftan', false)).toBe('male_kaftan');
    expect(garmentTypeFor('men', 'Suits', true)).toBe('male_suit');
    expect(garmentTypeFor('women', 'Pants', true)).toBe('female_trousers');
    expect(garmentTypeFor('women', 'Sets', true)).toBe('female_two_piece_set');
    expect(garmentTypeFor('women', 'Something new', true)).toBe('female');
  });

  it('only applies the trousers choice to agbada and kaftan', () => {
    const { config } = buildGenerationRequest({
      ...base,
      gender: 'women',
      category: 'Dresses',
      withTrousers: false,
    });
    expect(config.garmentType).toBe('female_dress');
  });

  it('says what the garment is and gives the colour as a word', () => {
    const { userPrompt } = buildGenerationRequest({
      ...base,
      prompt: '  Wedding guest look ',
      color: '#800020',
    });
    expect(userPrompt).toBe(
      'Wedding guest look A three-piece agbada: a wide, flowing outer robe worn over a long inner top, with trousers. Make the main fabric burgundy.'
    );
    expect(userPrompt).not.toContain('#');
  });

  it('sends fit, styles by name and finishing', () => {
    const neck = style({ _id: 'n1', name: 'V-neck' });
    const { config } = buildGenerationRequest({
      ...base,
      styles: [neck],
      selections: { ...EMPTY_SELECTIONS, neckline: 'n1', sleeve: 'gone' },
      fit: 'fit2',
      embellishments: ['a3'],
    });
    expect(config.fit).toBe('slim fit');
    expect(config.fitNotes).toBe('Tailored close to body');
    expect(config.constructionSelections).toEqual({ neckline: 'V-neck' });
    expect(config.aestheticKeywords).toEqual(['Embroidery']);
  });

  it('leaves the prompt out when there is nothing to say', () => {
    const { userPrompt } = buildGenerationRequest({
      ...base,
      gender: 'women',
      category: 'Tops',
    });
    expect(userPrompt).toBeUndefined();
  });

  it('falls back to the code for a colour it has no name for', () => {
    expect(colourName('#123456')).toBe('#123456');
    expect(colourName('#1a1a1a')).toBe('black');
    expect(colourName(null)).toBeNull();
  });
});

describe('switching gender or garment', () => {
  const styles = [
    style({
      _id: 'collar-m',
      name: 'Mandarin',
      category: 'collar',
      gender: 'male',
    }),
    style({ _id: 'neck-u', name: 'Round', category: 'neckline' }),
    style({
      _id: 'sil-dress',
      name: 'A-line',
      category: 'full_body',
      type: 'full_body',
      gender: 'female',
    }),
  ];

  it('keeps the picks that still fit and names the ones it drops', () => {
    const out = keepFitting(
      {
        ...EMPTY_SELECTIONS,
        collar: 'collar-m',
        neckline: 'neck-u',
      },
      ['a3', 'a2'],
      styles,
      'female',
      'bottom'
    );
    expect(out.selections).toEqual({
      ...EMPTY_SELECTIONS,
      neckline: 'neck-u',
    });
    // The belt (a2) only goes on full-body garments.
    expect(out.embellishments).toEqual(['a3']);
    expect(out.dropped).toEqual(['Mandarin', 'Waist Belt / Sash']);
  });

  it('drops a silhouette made for another garment shape', () => {
    const out = keepFitting(
      { ...EMPTY_SELECTIONS, silhouette: 'sil-dress' },
      [],
      styles,
      'female',
      'top'
    );
    expect(out.selections.silhouette).toBeNull();
    expect(out.dropped).toEqual(['A-line']);
  });
});

describe('refine and back view', () => {
  it('always names the garment for the image editor', () => {
    expect(garmentWords('men', 'Agbada', true)).toBe(
      "men's agbada (outer robe over an inner top, with trousers)"
    );
    expect(garmentWords('men', 'Kaftan', false)).toBe("men's kaftan");
    expect(garmentWords('women', 'Pants', true)).toBe("women's trousers");
    expect(garmentWords('women', 'Unknown', true)).toBe("women's outfit");
  });

  it('asks the editor to change only what was asked', () => {
    expect(refineNotes('  shorter sleeves ')).toBe(
      'Change only this and keep everything else exactly as it is: shorter sleeves'
    );
  });

  it('saves one back per image still on the template, in image order', () => {
    expect(
      backViewsForSave(['b', 'a'], { a: 'a-back', b: 'b-back', gone: 'x' })
    ).toEqual([
      { front: 'b', back: 'b-back' },
      { front: 'a', back: 'a-back' },
    ]);
  });
});

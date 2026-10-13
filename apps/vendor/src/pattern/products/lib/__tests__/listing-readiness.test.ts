import { describe, expect, it } from 'vitest';
import {
  fabricReadiness,
  listingReadiness,
  visibleText,
  type ReadinessInput,
} from '../listing-readiness';

const complete: ReadinessInput = {
  title: 'Hand-finished Ankara kaftan',
  descriptionHtml:
    '<p>Cut from heavyweight wax-print cotton and finished with a lined collar. ' +
    'The fit is relaxed through the body with a straight hem. Machine wash ' +
    'cold, hang to dry, warm iron on the reverse.</p>',
  photoCount: 3,
  price: '25000',
  productType: 'Kaftan',
  audience: 'men',
  variants: [{ sizes: [{ stock: 0 }, { stock: 4 }] }],
  madeToOrder: false,
  turnaroundDays: '2',
  optionCount: 0,
};

const failing = (input: ReadinessInput) =>
  listingReadiness(input)
    .items.filter((i) => !i.ok)
    .map((i) => i.key);

describe('listingReadiness', () => {
  it('a complete ready-to-wear listing is ready', () => {
    const r = listingReadiness(complete);
    expect(r.ready).toBe(true);
    expect(r.done).toBe(r.total);
    expect(r.firstProblem).toBeNull();
  });

  it('measures the description the way a shopper reads it, not the HTML', () => {
    // 150 characters of tags around 20 characters of text is not a description.
    const html = `<p><strong>${'x'.repeat(20)}</strong></p>${'<br/>'.repeat(40)}`;
    expect(visibleText(html)).toBe('x'.repeat(20));
    expect(failing({ ...complete, descriptionHtml: html })).toContain(
      'description'
    );
  });

  it('shows live counts in the labels', () => {
    const r = listingReadiness({ ...complete, title: 'Kaftan', photoCount: 1 });
    expect(r.items.find((i) => i.key === 'title')?.label).toBe(
      'Title of 10+ characters (6)'
    );
    expect(r.items.find((i) => i.key === 'photos')?.label).toBe(
      '3+ photos (1)'
    );
    expect(r.ready).toBe(false);
  });

  it('a shouting title is not ready, but size codes are fine', () => {
    expect(failing({ ...complete, title: 'KAFTAN FOR MEN SALE' })).toContain(
      'title'
    );
    expect(
      failing({ ...complete, title: '2XL kaftan, hand finished' })
    ).not.toContain('title');
  });

  it('ready-to-wear needs at least one colour with stock', () => {
    expect(failing({ ...complete, variants: [] })).toContain('stock');
    expect(
      failing({ ...complete, variants: [{ sizes: [{ stock: 0 }] }] })
    ).toContain('stock');
  });

  it('made-to-order needs a turnaround and an option, and sizes only if listed', () => {
    const mto = {
      ...complete,
      madeToOrder: true,
      variants: [],
      optionCount: 0,
      turnaroundDays: '0',
    };
    const keys = failing(mto);
    expect(keys).toContain('turnaround');
    expect(keys).toContain('options');
    expect(keys).not.toContain('stock');
    expect(
      listingReadiness({ ...mto, turnaroundDays: '5', optionCount: 2 }).ready
    ).toBe(true);
  });

  it('names the first unmet requirement for a toast', () => {
    const r = listingReadiness({ ...complete, price: '' });
    expect(r.firstProblem).toBe('Still needed: a price above ₦0.');
  });
});

describe('fabricReadiness', () => {
  const bolt = {
    title: 'Royal blue Holland wax print',
    description:
      'Heavyweight 100% cotton wax print with a crisp hand and a deep, colourfast blue. ' +
      'Sold by the yard from a 45-inch bolt. Pre-wash cold before cutting; iron on the reverse.',
    photoCount: 3,
    material: 'Cotton',
    pricePerYard: '4500',
    yardsInStock: '30',
    minCut: '2',
    widthInches: '45',
  };
  const failing = (over: Partial<typeof bolt>) =>
    fabricReadiness({ ...bolt, ...over })
      .items.filter((i) => !i.ok)
      .map((i) => i.key);

  it('a complete bolt is ready', () => {
    expect(fabricReadiness(bolt).ready).toBe(true);
  });

  it('needs three photos like every listing - one was all the old modal allowed', () => {
    expect(failing({ photoCount: 1 })).toEqual(['photos']);
  });

  it('a minimum cut larger than the stock cannot be bought', () => {
    expect(failing({ minCut: '40' })).toEqual(['min_cut']);
    expect(
      fabricReadiness({ ...bolt, minCut: '40' }).items.find(
        (i) => i.key === 'min_cut'
      )?.label
    ).toBe('Minimum cut no more than the yards in stock');
  });

  it('checks the bolt numbers and the material', () => {
    expect(failing({ yardsInStock: '0' })).toContain('stock');
    expect(failing({ widthInches: '8' })).toContain('width');
    expect(failing({ pricePerYard: '' })).toContain('price');
    expect(failing({ material: '' })).toContain('material');
  });
});

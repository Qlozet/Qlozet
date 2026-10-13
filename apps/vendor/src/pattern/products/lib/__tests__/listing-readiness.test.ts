import { describe, expect, it } from 'vitest';
import {
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

import { describe, expect, it } from 'vitest';
import type { Order } from '@/redux/services/orders/orders.api-slice';
import { readBespokeDesign } from '../bespoke-design';

const order = (bespoke_design: unknown) =>
  ({ bespoke_design }) as unknown as Order;

describe('readBespokeDesign', () => {
  it('reads a populated design', () => {
    const summary = readBespokeDesign(
      order({ name: 'Agbada', design_images: ['a.png', 'b.png'] })
    );
    expect(summary).not.toBeNull();
    expect(summary?.name).toBe('Agbada');
    expect(summary?.images).toEqual(['a.png', 'b.png']);
  });

  it('appends reference images after the generated ones', () => {
    const summary = readBespokeDesign(
      order({ design_images: ['a.png'], reference_images: ['ref.png'] })
    );
    expect(summary?.images).toEqual(['a.png', 'ref.png']);
  });

  it('accepts { url } image entries alongside plain strings', () => {
    const summary = readBespokeDesign(
      order({ design_images: [{ url: 'a.png' }, 'b.png'] })
    );
    expect(summary?.images).toEqual(['a.png', 'b.png']);
  });

  it('de-duplicates an image that appears in both arrays', () => {
    const summary = readBespokeDesign(
      order({ design_images: ['a.png'], reference_images: ['a.png', 'c.png'] })
    );
    expect(summary?.images).toEqual(['a.png', 'c.png']);
  });

  it('drops blank and malformed entries', () => {
    const summary = readBespokeDesign(
      order({ design_images: ['', '  ', null, 42, {}, 'good.png'] })
    );
    expect(summary?.images).toEqual(['good.png']);
  });

  it('names an unnamed design so the card never renders an empty title', () => {
    expect(readBespokeDesign(order({ design_images: [] }))?.name).toBe('Custom design');
    expect(readBespokeDesign(order({ name: '   ' }))?.name).toBe('Custom design');
  });

  it('still returns a summary when the design has no images at all', () => {
    const summary = readBespokeDesign(order({ name: 'Agbada' }));
    expect(summary?.images).toEqual([]);
    expect(summary?.name).toBe('Agbada');
  });

  // The field comes back as a bare ObjectId on some list responses — there is
  // nothing to preview, so the card must not render.
  it('returns null for an unpopulated design reference', () => {
    expect(readBespokeDesign(order('64f0c9a1b2c3d4e5f6a7b8c9'))).toBeNull();
  });

  it('returns null when there is no design at all', () => {
    expect(readBespokeDesign(order(undefined))).toBeNull();
    expect(readBespokeDesign(order(null))).toBeNull();
    expect(readBespokeDesign(order([]))).toBeNull();
    expect(readBespokeDesign(null)).toBeNull();
    expect(readBespokeDesign(undefined)).toBeNull();
  });
});

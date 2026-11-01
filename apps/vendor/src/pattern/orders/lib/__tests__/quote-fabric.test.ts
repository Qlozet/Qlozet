import { describe, expect, it } from 'vitest';
import { depositFor, priceFabricOffer } from '../quote-fabric';

describe('quote fabric preview', () => {
  it('prices per yard from the listing', () => {
    expect(
      priceFabricOffer({ source: 'tailor_stock', price_per_yard: 2000 }, 5)
    ).toEqual({ yards: 5, pieces: null, cost: 10000 });
  });

  it('rounds piece-only fabric up to whole pieces', () => {
    expect(
      priceFabricOffer(
        {
          source: 'other_vendor',
          sold_by: 'piece',
          piece_yards: 6,
          piece_price: 15000,
        },
        7
      )
    ).toEqual({ yards: 12, pieces: 2, cost: 30000 });
  });

  it('has no listing price when the tailor sources the fabric', () => {
    expect(priceFabricOffer({ source: 'tailor_sourced' }, 4).cost).toBe(0);
  });
});

describe('deposit preview', () => {
  it('is the percentage when that covers the fabric', () => {
    expect(depositFor(80000, 50, 20000)).toEqual({
      amount: 40000,
      coversFabric: false,
    });
  });
  it('rises to the fabric when the fabric costs more', () => {
    expect(depositFor(80000, 50, 60000)).toEqual({
      amount: 60000,
      coversFabric: true,
    });
  });
  it('is the whole quote when the fabric is the whole quote', () => {
    expect(depositFor(50000, 50, 50000)).toBeNull();
  });
});

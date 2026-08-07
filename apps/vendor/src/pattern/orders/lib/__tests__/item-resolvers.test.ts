import { describe, expect, it } from 'vitest';
import type {
  Order,
  OrderItem,
} from '@/redux/services/orders/orders.api-slice';
import {
  allProductImages,
  asProduct,
  byId,
  findFabricItem,
  firstImg,
  getProductImageUrl,
  getProductName,
  readOrderFabric,
  yardsToMetres,
} from '../item-resolvers';

const item = (patch: Record<string, unknown> = {}) =>
  patch as unknown as OrderItem;

describe('firstImg', () => {
  it('handles both the string and { url } shapes', () => {
    expect(firstImg(['a.png'])).toBe('a.png');
    expect(firstImg([{ url: 'a.png' } as never])).toBe('a.png');
  });

  it('returns null for empty, missing or malformed entries', () => {
    expect(firstImg([])).toBeNull();
    expect(firstImg(undefined)).toBeNull();
    expect(firstImg([{} as never])).toBeNull();
  });
});

describe('asProduct', () => {
  it('returns the product only when it is populated', () => {
    expect(asProduct({ name: 'x' } as never)).toEqual({ name: 'x' });
    expect(asProduct('prod-1' as never)).toBeNull();
    expect(asProduct(null as never)).toBeNull();
  });
});

describe('getProductName / getProductImageUrl', () => {
  it('prefers the kind sub-doc name over the generic one', () => {
    expect(
      getProductName({ clothing: { name: 'Kaftan' }, name: 'Generic' } as never)
    ).toBe('Kaftan');
    expect(getProductName({ fabric: { name: 'Ankara' } } as never)).toBe(
      'Ankara'
    );
    expect(getProductName({ accessory: { name: 'Cap' } } as never)).toBe('Cap');
    expect(getProductName({ name: 'Generic' } as never)).toBe('Generic');
    expect(getProductName(null)).toBe('Product');
  });

  it('prefers the kind sub-doc image, falling back to top-level images', () => {
    expect(
      getProductImageUrl({
        clothing: { images: [{ url: 'kind.png' }] },
        images: ['top.png'],
      } as never)
    ).toBe('kind.png');
    expect(getProductImageUrl({ images: ['top.png'] } as never)).toBe(
      'top.png'
    );
    expect(getProductImageUrl({} as never)).toBeNull();
    expect(getProductImageUrl(null)).toBeNull();
  });
});

describe('allProductImages', () => {
  it('lists kind images before top-level ones', () => {
    expect(
      allProductImages({
        clothing: { images: [{ url: 'k1.png' }, { url: 'k2.png' }] },
        images: ['t1.png'],
      } as never)
    ).toEqual(['k1.png', 'k2.png', 't1.png']);
  });

  // The same asset is commonly duplicated across both arrays; showing it twice
  // would give the gallery a phantom extra slide.
  it('de-duplicates an image present in both arrays', () => {
    expect(
      allProductImages({
        clothing: { images: [{ url: 'same.png' }] },
        images: ['same.png'],
      } as never)
    ).toEqual(['same.png']);
  });

  it('drops malformed entries and handles an absent product', () => {
    expect(allProductImages({ images: [{}, 'ok.png'] } as never)).toEqual([
      'ok.png',
    ]);
    expect(allProductImages(null)).toEqual([]);
  });
});

describe('byId', () => {
  it('finds by id, comparing as strings', () => {
    expect(
      byId(
        [
          { _id: '1', v: 'a' },
          { _id: '2', v: 'b' },
        ] as never,
        '2'
      )
    ).toMatchObject({
      v: 'b',
    });
  });

  it('returns undefined for a missing id or list', () => {
    expect(byId([{ _id: '1' }] as never, '9')).toBeUndefined();
    expect(byId(undefined, '1')).toBeUndefined();
    expect(byId([{ _id: '1' }] as never, undefined)).toBeUndefined();
  });
});

describe('yardsToMetres', () => {
  it('converts and rounds to two decimals', () => {
    expect(yardsToMetres(1)).toBe(0.91);
    expect(yardsToMetres(10)).toBe(9.14);
    expect(yardsToMetres(0)).toBe(0);
  });
});

describe('readOrderFabric', () => {
  // Cross-vendor fabric: someone else supplies it, so it must NOT be priced
  // into this vendor's quote.
  it('reads a cross-vendor applied fabric as not vendor-sourced', () => {
    const fabric = readOrderFabric(
      item({
        applied_fabric: {
          fabric: { name: 'Ankara', images: [{ url: 'f.png' }] },
          base_price: 2000,
          business: { business_name: 'Fabric Co' },
        },
        applied_fabric_yards: 4,
      })
    );
    expect(fabric).toMatchObject({
      name: 'Ankara',
      imageUrl: 'f.png',
      yards: 4,
      pricePerYard: 2000,
      sourceBusiness: 'Fabric Co',
      vendorSources: false,
    });
  });

  it('leaves sourceBusiness undefined when the business is an unpopulated id', () => {
    const fabric = readOrderFabric(
      item({
        applied_fabric: { fabric: { name: 'Ankara' }, business: 'biz-1' },
      })
    );
    expect(fabric?.sourceBusiness).toBeUndefined();
  });

  // Own-catalogue fabric: the vendor buys it, so it belongs in their quote.
  it('reads a catalogue fabric selection as vendor-sourced', () => {
    const fabric = readOrderFabric(
      item({
        fabric_selections: [
          { fabric_id: 'f1', yardage: 3, quantity: 1, total_amount: 0 },
        ],
        product: {
          clothing: {
            fabrics: [
              {
                _id: 'f1',
                name: 'Lace',
                price_per_yard: 1500,
                images: ['l.png'],
              },
            ],
          },
        },
      })
    );
    expect(fabric).toMatchObject({
      name: 'Lace',
      imageUrl: 'l.png',
      yards: 3,
      pricePerYard: 1500,
      vendorSources: true,
    });
  });

  it('accepts the legacy `yards` key on a selection', () => {
    const fabric = readOrderFabric(
      item({
        fabric_selections: [
          { fabric_id: 'f1', yards: 5, quantity: 1, total_amount: 0 },
        ],
      })
    );
    expect(fabric?.yards).toBe(5);
  });

  it('returns null when the item has no fabric at all', () => {
    expect(readOrderFabric(item({}))).toBeNull();
  });
});

describe('findFabricItem', () => {
  const order = (items: unknown[]) => ({ items }) as unknown as Order;

  it('finds the first item carrying any fabric signal', () => {
    expect(
      findFabricItem(
        order([{ _tag: 'plain' }, { _tag: 'fabric', fabric_selections: [{}] }])
      )
    ).toMatchObject({ _tag: 'fabric' });
    expect(findFabricItem(order([{ applied_fabric: {} }]))).toBeTruthy();
    expect(findFabricItem(order([{ applied_fabric_yards: 2 }]))).toBeTruthy();
  });

  it('returns undefined when nothing on the order has fabric', () => {
    expect(findFabricItem(order([{}]))).toBeUndefined();
    expect(findFabricItem(order([]))).toBeUndefined();
  });
});

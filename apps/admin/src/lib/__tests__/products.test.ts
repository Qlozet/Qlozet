import { describe, expect, it } from 'vitest';
import type { Product } from '@/redux/services/products/products.api-slice';
import {
  formatPricePerYard,
  formatProductPrice,
  getFabricYards,
  getProductCategory,
  getProductImage,
  getProductModeration,
  getProductName,
  getProductQuantity,
  getProductImages,
  getProductStatus,
  getProductTag,
  getProductTags,
  getProductType,
  getProductVendorName,
  getStorefrontVisibility,
} from '../products';

const product = (patch: Record<string, unknown> = {}) =>
  patch as unknown as Product;

/**
 * A verbatim row from GET /products?kind=clothing, trimmed to the fields the
 * table reads. Every column on the admin catalogue rendered a dash against this
 * payload because the readers looked for flat `name` / `price` / `stock` keys —
 * so the fixture is the real nesting, not a convenient flattening of it.
 */
const CLOTHING = product({
  _id: '6a85d60758b5bf8a5636fa24',
  kind: 'clothing',
  seo: { title: 'Garm Forest T-shirt' },
  metafields: {
    base_price: 40000,
    tags: [{ name: 'Unisex', slug: 'unisex', type: 'system' }],
  },
  base_price: 40000,
  status: 'active',
  discounted_price: 32000,
  discount_percentage: 20,
  scheduled_activation_date: null,
  fabric: null,
  accessory: null,
  business: { _id: '6a7f5a8a', business_name: 'Garm island' },
  tags: [],
  clothing: {
    type: 'non_customize',
    name: 'Garm Forest T-shirt',
    turnaround_days: 2,
    taxonomy: {
      product_type: 'Top',
      categories: ['T-Shirt'],
      attributes: ['Formal', 'Casual'],
      audience: 'unisex',
    },
    images: [{ url: 'https://cdn.example/forest.png' }],
    color_variants: [
      {
        name: 'Green',
        hex: '#008000',
        variants: [
          { size: 'L', stock: 9 },
          { size: 'M', stock: 9 },
        ],
      },
    ],
  },
  availability: {
    state: 'in_stock',
    total_stock: 48,
    variants: [
      { label: 'Green / L', stock: 9 },
      { label: 'Green / XXL', stock: 10 },
      { label: 'Green / XL', stock: 10 },
      { label: 'Green / M', stock: 9 },
      { label: 'Green / S', stock: 10 },
    ],
  },
});

describe('reading a clothing row', () => {
  it('takes the name from the nested clothing document', () => {
    expect(getProductName(CLOTHING)).toBe('Garm Forest T-shirt');
  });

  it('falls back to the SEO title when the kind document has no name', () => {
    expect(
      getProductName(product({ kind: 'clothing', seo: { title: 'Kaftan' } }))
    ).toBe('Kaftan');
  });

  it('says so plainly when there is no name anywhere', () => {
    expect(getProductName(product({}))).toBe('Unnamed product');
  });

  it('reads category and product type out of the taxonomy', () => {
    expect(getProductCategory(CLOTHING)).toBe('T-Shirt');
    expect(getProductType(CLOTHING)).toBe('Top');
  });

  it('falls back to the customisation flag when taxonomy has no product type', () => {
    expect(
      getProductType(
        product({ kind: 'clothing', clothing: { type: 'customize' } })
      )
    ).toBe('Customisable');
    expect(
      getProductType(
        product({ kind: 'clothing', clothing: { type: 'non_customize' } })
      )
    ).toBe('Non Customisable');
  });

  it('collects tags from metafields as well as the top level', () => {
    expect(getProductTag(CLOTHING)).toBe('Unisex');
    expect(
      getProductTags(
        product({
          metafields: { tags: [{ name: 'Unisex' }] },
          tags: [{ name: 'New' }, { name: 'Unisex' }],
        })
      )
    ).toEqual(['Unisex', 'New']);
  });

  it('prices at the discount when it undercuts base', () => {
    expect(formatProductPrice(CLOTHING)).toContain('32,000');
  });

  it('prices at base when there is no discount', () => {
    expect(formatProductPrice(product({ base_price: 40000 }))).toContain(
      '40,000'
    );
  });

  it('ignores a discount that is zero or above base', () => {
    expect(
      formatProductPrice(product({ base_price: 1000, discounted_price: 0 }))
    ).toContain('1,000');
    expect(
      formatProductPrice(product({ base_price: 1000, discounted_price: 1500 }))
    ).toContain('1,000');
  });

  it('shows a dash rather than a zero when there is no price', () => {
    expect(formatProductPrice(product({}))).toBe('—');
  });

  it('takes stock and variant count from the computed availability block', () => {
    expect(getProductQuantity(CLOTHING)).toEqual({
      stock: 48,
      variantCount: 5,
    });
  });

  it('walks the colour variants when availability is absent', () => {
    const { availability: _availability, ...rest } = CLOTHING;
    expect(getProductQuantity(product(rest))).toEqual({
      stock: 18,
      variantCount: 2,
    });
  });

  it('finds the image on the kind document', () => {
    expect(getProductImage(CLOTHING)).toBe('https://cdn.example/forest.png');
  });

  it('falls back to a colour variant image', () => {
    expect(
      getProductImage(
        product({
          kind: 'clothing',
          clothing: {
            images: [],
            color_variants: [
              { images: [{ url: 'https://cdn.example/green.png' }] },
            ],
          },
        })
      )
    ).toBe('https://cdn.example/green.png');
  });

  it('reads the populated vendor name', () => {
    expect(getProductVendorName(CLOTHING)).toBe('Garm island');
  });
});

describe('getProductStatus', () => {
  it('reports a live product as active', () => {
    expect(getProductStatus(CLOTHING)).toEqual({
      key: 'active',
      label: 'Active',
    });
  });

  it('lets a rejection outrank the vendor status', () => {
    expect(
      getProductStatus(
        product({ status: 'active', moderation: { status: 'rejected' } })
      )
    ).toEqual({ key: 'rejected', label: 'Rejected' });
  });

  it('reads a pending activation date as scheduled', () => {
    expect(
      getProductStatus(
        product({
          status: 'draft',
          scheduled_activation_date: '2027-01-01T00:00:00Z',
        })
      ).key
    ).toBe('scheduled');
  });

  it('maps draft and archived through', () => {
    expect(getProductStatus(product({ status: 'draft' })).key).toBe('draft');
    expect(getProductStatus(product({ status: 'archived' })).key).toBe(
      'archived'
    );
  });
});

describe('getProductModeration', () => {
  it('treats a product with no moderation block as pending', () => {
    expect(getProductModeration(CLOTHING)).toBe('pending');
  });

  it('reads an explicit verdict', () => {
    expect(
      getProductModeration(product({ moderation: { status: 'approved' } }))
    ).toBe('approved');
  });
});

describe('fabric rows', () => {
  const FABRIC = product({
    kind: 'fabric',
    base_price: 5000,
    fabric: {
      name: 'Ankara',
      price_per_yard: 4500,
      yard_length: 30,
      min_cut: 2,
    },
  });

  it('prices per yard from the fabric document', () => {
    expect(formatPricePerYard(FABRIC)).toContain('4,500');
  });

  it('reports remaining yardage as the stock figure', () => {
    expect(getFabricYards(FABRIC)).toBe(30);
    expect(getProductQuantity(FABRIC)).toEqual({ stock: 30, variantCount: 1 });
  });
});

describe('getStorefrontVisibility', () => {
  const visible = (patch: Record<string, unknown> = {}) =>
    getStorefrontVisibility(
      product({
        status: 'active',
        business: { business_name: 'Garm island', status: 'approved' },
        ...patch,
      })
    );

  it('passes an active listing from an approved vendor', () => {
    expect(visible()).toEqual({ visible: true, reasons: [] });
  });

  // The API gate is three independent conditions; each has to fail on its own.
  it('fails a listing the vendor has not published', () => {
    const result = visible({ status: 'draft' });
    expect(result.visible).toBe(false);
    expect(result.reasons[0]).toContain('"draft"');
  });

  it('explains a scheduled listing as scheduled, not as a draft', () => {
    const result = visible({
      status: 'scheduled',
      scheduled_activation_date: '2027-01-01T00:00:00Z',
    });
    expect(result.reasons[0]).toContain('scheduled to go live');
  });

  it('fails a listing the platform rejected, whatever the vendor set', () => {
    const result = visible({ moderation: { status: 'rejected' } });
    expect(result.visible).toBe(false);
    expect(result.reasons).toContain('The platform rejected this listing.');
  });

  it('fails a listing whose vendor is not approved to sell', () => {
    const result = visible({
      business: { business_name: 'Garm island', status: 'pending' },
    });
    expect(result.visible).toBe(false);
    expect(result.reasons[0]).toContain('"pending"');
  });

  it('fails a listing whose vendor is deactivated', () => {
    const result = visible({
      business: {
        business_name: 'Garm island',
        status: 'approved',
        is_active: false,
      },
    });
    expect(result.reasons).toContain('Its vendor is deactivated.');
  });

  it('does not treat an unpopulated vendor as a failing one', () => {
    // A list response may not select `status`; absent is unknown, not rejected.
    expect(visible({ business: '6a7f5a8adcacda7acc6beef7' }).visible).toBe(
      true
    );
    expect(
      visible({ business: { business_name: 'Garm island' } }).visible
    ).toBe(true);
  });

  it('reports every failing gate, not just the first', () => {
    const result = visible({
      status: 'draft',
      moderation: { status: 'rejected' },
      business: { status: 'pending', is_active: false },
    });
    expect(result.reasons).toHaveLength(4);
  });
});

describe('getProductImages', () => {
  it("lists product shots first, then each colour's", () => {
    expect(
      getProductImages(
        product({
          kind: 'clothing',
          clothing: {
            images: [{ url: 'a.png' }],
            color_variants: [
              { images: [{ url: 'b.png' }] },
              { images: [{ url: 'c.png' }] },
            ],
          },
        })
      )
    ).toEqual(['a.png', 'b.png', 'c.png']);
  });

  it('does not repeat a colour swatch that is also a product shot', () => {
    expect(
      getProductImages(
        product({
          kind: 'clothing',
          clothing: {
            images: [{ url: 'a.png' }],
            color_variants: [{ images: [{ url: 'a.png' }] }],
          },
        })
      )
    ).toEqual(['a.png']);
  });
});

import { describe, expect, it } from 'vitest';
import { defaultStyleIds, groupByPart, partOf } from './style-defaults';

describe('default styles in the clothing form', () => {
  const v = { id: 'v', category: 'neckline', price: 2000 };
  const round = { id: 'r', category: 'neckline', price: 0 };
  const long = { id: 'l', category: 'sleeve', price: 3000 };
  const short = { id: 's', category: 'sleeve', price: 1500 };

  it('defaults to the cheapest of each part until one is marked', () => {
    expect([...defaultStyleIds([v, round, long, short])].sort()).toEqual([
      'r',
      's',
    ]);
    expect(defaultStyleIds([{ ...v, isDefault: true }, round]).has('v')).toBe(
      true
    );
  });

  it("reads a saved style's part like the backend does", () => {
    expect(
      partOf({
        id: 'x',
        category: 'shirts',
        price: 0,
        originalData: { categories: ['shirts'], type: 'collar' },
      })
    ).toBe('collar');
    expect(
      partOf({
        id: 'y',
        category: 'sleeve',
        price: 0,
        originalData: { categories: ['sleeve'], type: 'top' },
      })
    ).toBe('sleeve');
  });

  it('groups tiles by part in the order they appear', () => {
    expect(
      groupByPart([v, long, round]).map((g) => [g.part, g.items.length])
    ).toEqual([
      ['neckline', 2],
      ['sleeve', 1],
    ]);
  });
});

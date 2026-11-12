import { describe, expect, it } from 'vitest';
import { storeSlugFormatProblem, tidyStoreSlug } from '../store-address';

describe('store address field', () => {
  it('turns what is typed into an address', () => {
    expect(tidyStoreSlug('Kemi Lagos')).toBe('kemi-lagos');
    expect(tidyStoreSlug('Café_Ọ̀ṣun!!')).toBe('cafe-osun');
    expect(tidyStoreSlug('--a  --  b')).toBe('a-b');
    expect(tidyStoreSlug('kemi-')).toBe('kemi-'); // still typing
    expect(tidyStoreSlug('x'.repeat(60))).toHaveLength(40);
  });

  it('flags format problems before asking the server', () => {
    expect(storeSlugFormatProblem('ab')).toMatch(/at least/);
    expect(storeSlugFormatProblem('kemi-')).toMatch(/hyphen/);
    expect(storeSlugFormatProblem('kemi-lagos')).toBeNull();
  });
});

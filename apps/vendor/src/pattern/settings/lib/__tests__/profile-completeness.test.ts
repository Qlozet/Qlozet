import { describe, expect, it } from 'vitest';
import { profileCompleteness } from '../profile-completeness';

const full = {
  business_logo_url: 'https://cdn/logo.png',
  cover_image_url: 'https://cdn/cover.jpg',
  description:
    'Handwoven aso oke from Iseyin, cut and finished in Lagos. Made to order and ready to wear.',
  business_phone_number: '+2348012345678',
  business_address: '12 Marina, Lagos',
  website: 'https://asooke.ng',
  social_links: {},
};

describe('profileCompleteness', () => {
  it('a finished profile is 100%', () => {
    const c = profileCompleteness(full);
    expect(c.percent).toBe(100);
    expect(c.missing).toEqual([]);
  });

  it('names what is missing and where to fix it', () => {
    const c = profileCompleteness({
      ...full,
      cover_image_url: '',
      website: '',
    });
    expect(c.missing.map((m) => m.key)).toEqual(['cover', 'links']);
    expect(c.missing[0].anchor).toBe('profile-brand');
    expect(c.percent).toBe(67);
  });

  it('a social handle counts as a link when there is no website', () => {
    const c = profileCompleteness({
      ...full,
      website: '',
      social_links: { instagram: 'asooke' },
    });
    expect(c.missing).toEqual([]);
  });

  it('a short description shows its count', () => {
    const c = profileCompleteness({ ...full, description: 'Nice cloth' });
    expect(c.missing[0].label).toBe('Say more about the store (10/60)');
  });

  it('an empty record is 0%', () => {
    expect(profileCompleteness(null).percent).toBe(0);
  });
});

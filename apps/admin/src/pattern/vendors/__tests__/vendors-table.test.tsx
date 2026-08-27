import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import { getVendorEmail, getVendorLogo } from '@/lib/vendors';
import { VendorStatsCards } from '@/pattern/vendors/templates/vendor-stats-cards';
import { VendorSearchInput } from '@/pattern/vendors/molecules/vendor-search-input';

describe('vendor identity helpers', () => {
  it('falls back to the owning vendor’s email', () => {
    // "Kemango Tech" has no business_email but its account does — the row
    // showed a bare dash.
    expect(
      getVendorEmail({
        _id: 'b1',
        vendor: { email: 'kemangotech@gmail.com' },
      } as Business)
    ).toBe('kemangotech@gmail.com');

    expect(
      getVendorEmail({
        _id: 'b1',
        created_by: { email: 'owner@x.co' },
      } as Business)
    ).toBe('owner@x.co');
  });

  it('prefers the business email when it has one', () => {
    expect(
      getVendorEmail({
        _id: 'b1',
        business_email: 'biz@x.co',
        vendor: { email: 'owner@x.co' },
      } as Business)
    ).toBe('biz@x.co');
  });

  it('dashes only when there is genuinely no address', () => {
    expect(getVendorEmail({ _id: 'b1' } as Business)).toBe('—');
  });

  it('treats an empty-string logo as no logo', () => {
    // Most records carry business_logo_url: "" rather than omitting it, so a
    // presence check would render a broken image for every vendor.
    expect(
      getVendorLogo({ _id: 'b1', business_logo_url: '' } as Business)
    ).toBeUndefined();
    expect(
      getVendorLogo({ _id: 'b1', business_logo_url: '  ' } as Business)
    ).toBeUndefined();
    expect(
      getVendorLogo({
        _id: 'b1',
        business_logo_url: 'https://x/y.png',
      } as Business)
    ).toBe('https://x/y.png');
  });
});

describe('VendorStatsCards', () => {
  const summary = {
    total_vendors: 16,
    active_vendors: 2,
    inactive_vendors: 3,
    awaiting_vendors: 11,
    changes: {
      period_days: 30,
      total_vendors: 25,
      active_vendors: -25,
      inactive_vendors: null,
    },
  };

  it('renders the counts and their movement', () => {
    render(<VendorStatsCards summary={summary} />);

    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('-25%')).toBeInTheDocument();
  });

  it('explains the vendors in neither bucket', () => {
    // 2 + 3 against a total of 16 otherwise looks like a miscount.
    render(<VendorStatsCards summary={summary} />);
    expect(screen.getByText('11 awaiting')).toBeInTheDocument();
  });

  it('omits a badge the endpoint could not compute', () => {
    render(<VendorStatsCards summary={summary} />);
    // inactive_vendors is null — no badge, rather than a 0% that reads as flat.
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('falls back to the list total before the summary arrives', () => {
    render(<VendorStatsCards totalFromList={16} />);
    expect(screen.getByText('16')).toBeInTheDocument();
    // Active/inactive have no fallback and must dash rather than show 0.
    expect(screen.getAllByText('—')).toHaveLength(2);
  });
});

describe('VendorSearchInput', () => {
  beforeEach(() => vi.useRealTimers());

  it('debounces, so a request is not fired per keystroke', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<VendorSearchInput value="" onChange={onChange} delay={50} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Search vendors' }),
      'flam'
    );

    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('flam'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('clears immediately, without waiting out the debounce', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <VendorSearchInput value="flamez" onChange={onChange} delay={5000} />
    );

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows no clear button when empty', () => {
    render(<VendorSearchInput value="" onChange={vi.fn()} />);
    expect(
      screen.queryByRole('button', { name: 'Clear search' })
    ).not.toBeInTheDocument();
  });
});

describe('vendor image accessors', () => {
  it('reads the fields the endpoint actually sends', async () => {
    const { getVendorCover } = await import('@/lib/vendors');

    // The detail header read `cover_image` / `logo`; the API sends
    // `cover_image_url` / `business_logo_url`, so both images were always absent.
    expect(
      getVendorCover({
        _id: 'b1',
        cover_image_url: 'https://x/c.jpg',
      } as Business)
    ).toBe('https://x/c.jpg');
    expect(
      getVendorLogo({
        _id: 'b1',
        business_logo_url: 'https://x/l.png',
      } as Business)
    ).toBe('https://x/l.png');
  });

  it('still honours the legacy names as a fallback', async () => {
    const { getVendorCover } = await import('@/lib/vendors');
    expect(
      getVendorCover({ _id: 'b1', banner: 'https://x/b.jpg' } as Business)
    ).toBe('https://x/b.jpg');
  });

  it('treats an empty cover as no cover', async () => {
    const { getVendorCover } = await import('@/lib/vendors');
    expect(
      getVendorCover({ _id: 'b1', cover_image_url: '' } as Business)
    ).toBeUndefined();
  });
});

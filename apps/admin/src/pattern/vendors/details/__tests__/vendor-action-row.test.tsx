import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const show = vi.fn();

// The grid calls NiceModal.show; the modals it imports register through both
// the named and the default `create`, so the mock has to provide each. Defined
// inside the factory because vi.mock is hoisted above any top-level const.
vi.mock('@ebay/nice-modal-react', () => {
  const create = (component: unknown) => component;
  return {
    default: { show: (...args: unknown[]) => show(...args), create },
    create,
    useModal: () => ({ visible: false, remove: vi.fn(), hide: vi.fn() }),
  };
});

import { VendorInfoGrid } from '../organisms/vendor-info-grid';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';

const vendor = {
  _id: 'b1',
  business_name: 'Miskay Boutique',
  status: 'in-review',
} as unknown as Business;

/** Actions that moved behind the stacked-dots trigger. */
const COLLAPSED = [
  'Verify',
  'Mark in review',
  'Edit vendor',
  'Escalate to support',
];

const openMenu = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Vendor actions' }));
};

beforeEach(() => show.mockReset());

describe('vendor action row', () => {
  it('leaves only the approve/reject decision inline', () => {
    render(<VendorInfoGrid vendor={vendor} />);

    expect(screen.getByRole('button', { name: /Approve/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject/ })).toBeInTheDocument();
    for (const label of COLLAPSED) {
      expect(screen.queryByRole('button', { name: label })).toBeNull();
    }
  });

  it('offers the remaining four behind the trigger', async () => {
    render(<VendorInfoGrid vendor={vendor} />);
    await openMenu();

    for (const label of COLLAPSED) {
      expect(screen.getByRole('menuitem', { name: label })).toBeInTheDocument();
    }
  });

  it('still runs the status handlers it collapsed', async () => {
    const onVerify = vi.fn();
    const onSetInReview = vi.fn();
    render(
      <VendorInfoGrid
        vendor={vendor}
        onVerify={onVerify}
        onSetInReview={onSetInReview}
      />
    );

    await openMenu();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Verify' }));
    expect(onVerify).toHaveBeenCalled();
  });

  it('opens the edit drawer from the menu', async () => {
    render(<VendorInfoGrid vendor={vendor} />);
    await openMenu();
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Edit vendor' })
    );

    expect(show).toHaveBeenCalledWith(expect.anything(), { vendor });
  });

  it('reads back a settled status rather than re-offering it', () => {
    // A vendor already approved should not present Approve as pending work.
    render(
      <VendorInfoGrid
        vendor={{ ...vendor, status: 'approved' } as unknown as Business}
      />
    );

    expect(screen.getByRole('button', { name: /Approved/ })).toBeDisabled();
  });

  it('does not offer Verify once the vendor is verified', async () => {
    render(
      <VendorInfoGrid
        vendor={{ ...vendor, isVerified: true } as unknown as Business}
      />
    );
    await openMenu();

    expect(screen.getByRole('menuitem', { name: 'Verified' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});

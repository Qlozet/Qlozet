import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NiceModal from '@ebay/nice-modal-react';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';

const updateVendor = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();
const toastInfo = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: (m: string) => toastSuccess(m),
    error: (m: string) => toastError(m),
    info: (m: string) => toastInfo(m),
  },
}));

vi.mock('@/redux/services/vendor-details/vendor-details.api-slice', () => ({
  useUpdateVendorProfileMutation: () => [updateVendor, { isLoading: false }],
}));

import { EditVendorDrawer } from '../organisms/edit-vendor-drawer';

const ok = () => ({ unwrap: () => Promise.resolve({}) });
const fail = (message: string) => ({
  unwrap: () => Promise.reject({ data: { message } }),
});

const vendor = {
  _id: 'b1',
  business_name: 'Flamez',
  business_email: 'biz@flamez.co',
  city: 'Lagos',
  payout_account_number: '0123456789',
} as Business;

/**
 * Sets a field's value without going through focus.
 *
 * These inputs are controlled, so a change event is the whole interaction. The
 * keyboard path is deliberately avoided for the assertions below: an open
 * Radix dialog puts `pointer-events: none` on <body>, and userEvent then
 * refuses to focus anything — which surfaced as "the element to be cleared
 * could not be focused" only when this file ran alongside the portal-heavy
 * suites, never on its own.
 *
 * The tests that assert on typing behaviour still use userEvent; this is for
 * the ones whose subject is what the form DOES with a value.
 */
const setField = (label: string, value: string) => {
  fireEvent.change(field(label), { target: { value } });
};

/**
 * Everything is queried inside the drawer, and with `hidden: true`.
 *
 * A Radix dialog left open by another suite aria-hides the rest of the
 * document, so a global accessible query cannot see this drawer even though it
 * is rendered — which is exactly how these two tests failed only in the full
 * run.
 */
let drawer: HTMLElement;
let seq = 0;

/**
 * Opens the drawer under a fresh id each time.
 *
 * NiceModal keys instances by component, and its store outlives
 * testing-library's cleanup — so re-showing the same component handed back the
 * previous test's instance with its edits still in state, and racing `remove`
 * against `show` just traded that for an empty document. Registering a unique
 * id per test sidesteps the shared entry entirely.
 */
const open = async () => {
  const id = `edit-vendor-${(seq += 1)}`;
  render(<NiceModal.Provider />);
  NiceModal.register(id, EditVendorDrawer, { vendor });
  NiceModal.show(id);

  drawer = await screen.findByRole('dialog', {
    name: 'Edit vendor',
    hidden: true,
  });
  return drawer;
};

const field = (label: string) =>
  within(drawer).getByLabelText(label) as HTMLInputElement;

const button = (name: RegExp | string) =>
  within(drawer).getByRole('button', { name, hidden: true });

beforeEach(() => {
  updateVendor.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
  toastInfo.mockReset();
  updateVendor.mockReturnValue(ok());
});

describe('EditVendorDrawer', () => {
  it('prefills from the vendor record', async () => {
    await open();
    expect(field('Business name').value).toBe('Flamez');
    expect(field('City').value).toBe('Lagos');
    // Absent fields start blank rather than "undefined".
    expect(field('Website').value).toBe('');
  });

  it('sends only the fields that actually changed', async () => {
    // A full-object PATCH would rewrite every field on every save, turning an
    // untouched blank into an explicit empty string.
    const user = userEvent.setup();
    await open();

    setField('Business name', 'Flamez Ltd');
    await user.click(button(/Save changes/));

    await waitFor(() =>
      expect(updateVendor).toHaveBeenCalledWith({
        businessId: 'b1',
        patch: { business_name: 'Flamez Ltd' },
      })
    );
  });

  it('trims what it sends', async () => {
    const user = userEvent.setup();
    await open();

    setField('City', '  Abuja  ');
    await user.click(button(/Save changes/));

    await waitFor(() =>
      expect(updateVendor).toHaveBeenCalledWith({
        businessId: 'b1',
        patch: { city: 'Abuja' },
      })
    );
  });

  it('cannot save when nothing has changed', async () => {
    await open();
    expect(button(/Save changes/)).toBeDisabled();
    expect(within(drawer).getByText('No changes')).toBeInTheDocument();
  });

  it('counts the pending changes', async () => {
    const user = userEvent.setup();
    await open();

    // findBy*, not getBy*: typing is a keystroke-per-render and the whole
    // suite runs these files in parallel, so the counter can lag the last key
    // by a tick under load. It passed in isolation and failed in the full run
    // purely on timing.
    // Edits fields that start with a value. Typing into an initially-EMPTY
    // input is unreliable here: another suite's portalled dialog can leave the
    // document in a state where userEvent's focus click is dropped, and the
    // keystrokes go nowhere. The subject of this test is the counter, not which
    // field feeds it.
    setField('Business name', 'Flamez Ltd');
    expect(
      await within(drawer).findByText('1 field changed')
    ).toBeInTheDocument();

    setField('City', 'Abuja');
    expect(
      await within(drawer).findByText('2 fields changed')
    ).toBeInTheDocument();
  });

  it('does not offer the image or status fields', async () => {
    // The banner and logo are replaced by uploading on the header — a file
    // picker, not a text box — and status has its own approve/verify actions.
    await open();
    expect(within(drawer).queryByLabelText(/logo/i)).not.toBeInTheDocument();
    expect(within(drawer).queryByLabelText(/cover/i)).not.toBeInTheDocument();
    expect(within(drawer).queryByLabelText(/status/i)).not.toBeInTheDocument();
  });

  it('says plainly that editing payout details moves no money', async () => {
    await open();
    expect(within(drawer).getByText(/does not move money/)).toBeInTheDocument();
  });

  it('surfaces the server’s own failure message', async () => {
    updateVendor.mockReturnValue(fail('Business not found'));
    const user = userEvent.setup();
    await open();

    setField('Website', 'https://x.co');
    // Wait for the form to register the edit before clicking: Save is disabled
    // while there is nothing to save, and a click on a disabled button is a
    // no-op that would leave the spy uncalled.
    await waitFor(() => expect(button(/Save changes/)).toBeEnabled());
    await user.click(button(/Save changes/));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Business not found')
    );
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const addNote = vi.fn();
const resolveNote = vi.fn();
const deleteNote = vi.fn();
const notesQuery = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: (m: string) => toastSuccess(m),
    error: (m: string) => toastError(m),
  },
}));

vi.mock('@/redux/services/vendor-details/vendor-details.api-slice', () => ({
  useGetVendorNotesQuery: () => notesQuery(),
  useAddVendorNoteMutation: () => [addNote, { isLoading: false }],
  useResolveVendorNoteMutation: () => [resolveNote],
  useDeleteVendorNoteMutation: () => [deleteNote],
}));

import { VendorNotesSection } from '../organisms/vendor-notes-section';

const ok = () => ({ unwrap: () => Promise.resolve({}) });
const fail = (message: string) => ({
  unwrap: () => Promise.reject({ data: { message } }),
});

const note = (patch: Record<string, unknown> = {}) => ({
  _id: 'n1',
  body: 'Called about the payout',
  kind: 'note',
  resolved: false,
  author: { full_name: 'Kennedy' },
  createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
  ...patch,
});

const withNotes = (rows: unknown[]) =>
  notesQuery.mockReturnValue({
    data: { data: { data: rows } },
    isLoading: false,
  });

beforeEach(() => {
  addNote.mockReset();
  resolveNote.mockReset();
  deleteNote.mockReset();
  notesQuery.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
  addNote.mockReturnValue(ok());
  resolveNote.mockReturnValue(ok());
  deleteNote.mockReturnValue(ok());
});

describe('VendorNotesSection', () => {
  it('says plainly that the vendor cannot see this', () => {
    withNotes([]);
    render(<VendorNotesSection businessId="b1" />);
    expect(
      screen.getByText(/Internal only — the vendor never sees these/)
    ).toBeInTheDocument();
  });

  it('adds a note', async () => {
    withNotes([]);
    const user = userEvent.setup();
    render(<VendorNotesSection businessId="b1" />);

    await user.type(screen.getByLabelText('Note body'), 'Chased the payout');
    await user.click(screen.getByRole('button', { name: /Add note/ }));

    await waitFor(() =>
      expect(addNote).toHaveBeenCalledWith({
        businessId: 'b1',
        body: 'Chased the payout',
        kind: 'note',
      })
    );
  });

  it('flags the vendor with the same body', async () => {
    // A flag without a reason is useless, so it reuses the note body rather
    // than being a bare toggle.
    withNotes([]);
    const user = userEvent.setup();
    render(<VendorNotesSection businessId="b1" />);

    await user.type(screen.getByLabelText('Note body'), 'Late three times');
    await user.click(screen.getByRole('button', { name: /Flag vendor/ }));

    await waitFor(() =>
      expect(addNote).toHaveBeenCalledWith({
        businessId: 'b1',
        body: 'Late three times',
        kind: 'flag',
      })
    );
  });

  it('will not submit an empty body', async () => {
    withNotes([]);
    render(<VendorNotesSection businessId="b1" />);

    expect(screen.getByRole('button', { name: /Add note/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Flag vendor/ })).toBeDisabled();
  });

  it('offers Clear flag only on an open flag', async () => {
    withNotes([
      note({ _id: 'n1', kind: 'flag', resolved: false }),
      note({ _id: 'n2', kind: 'flag', resolved: true }),
      note({ _id: 'n3', kind: 'note' }),
    ]);
    render(<VendorNotesSection businessId="b1" />);

    // One open flag -> one clear button, not three.
    expect(screen.getAllByRole('button', { name: /Clear flag/ })).toHaveLength(
      1
    );
    expect(screen.getByText('Flagged')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('clears a flag', async () => {
    withNotes([note({ kind: 'flag', resolved: false })]);
    const user = userEvent.setup();
    render(<VendorNotesSection businessId="b1" />);

    await user.click(screen.getByRole('button', { name: /Clear flag/ }));
    await waitFor(() => expect(resolveNote).toHaveBeenCalledWith('n1'));
  });

  it('deletes a note', async () => {
    withNotes([note()]);
    const user = userEvent.setup();
    render(<VendorNotesSection businessId="b1" />);

    await user.click(screen.getByRole('button', { name: 'Delete note' }));
    await waitFor(() => expect(deleteNote).toHaveBeenCalledWith('n1'));
  });

  it('attributes each entry and dates it', () => {
    withNotes([note()]);
    render(<VendorNotesSection businessId="b1" />);
    expect(screen.getByText(/Kennedy · 3h ago/)).toBeInTheDocument();
  });

  it('surfaces the server’s own failure message', async () => {
    withNotes([]);
    addNote.mockReturnValue(fail('Business not found'));
    const user = userEvent.setup();
    render(<VendorNotesSection businessId="b1" />);

    await user.type(screen.getByLabelText('Note body'), 'x');
    await user.click(screen.getByRole('button', { name: /Add note/ }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Business not found')
    );
  });

  it('says nothing is recorded rather than showing an empty list', () => {
    withNotes([]);
    render(<VendorNotesSection businessId="b1" />);
    expect(
      screen.getByText('Nothing recorded about this vendor yet.')
    ).toBeInTheDocument();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NiceModal from '@ebay/nice-modal-react';
import type { PlatformAdmin } from '@/redux/services/users/users.api-slice';

const createAdmin = vi.fn();
const updateAdmin = vi.fn();
const toastError = vi.fn();
const toastSuccess = vi.fn();

vi.mock('@/redux/services/users/users.api-slice', () => ({
  useGetRolesQuery: () => ({
    data: {
      data: [
        { _id: 'role-super', name: 'super_admin' },
        { _id: 'role-ops', name: 'operations' },
      ],
    },
  }),
  useCreateAdminMutation: () => [createAdmin, { isLoading: false }],
  useUpdateAdminMutation: () => [updateAdmin, { isLoading: false }],
}));

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

import { AdminFormModal } from '../admin-form-modal';

const admin: PlatformAdmin = {
  _id: 'admin-1',
  full_name: 'Shola James',
  email: 'shola@mail.com',
  phone_number: '+2348123456789',
  status: 'active',
  role: { _id: 'role-super', name: 'super_admin', description: null },
  role_name: 'super_admin',
  createdAt: '2023-09-25T00:00:00.000Z',
};

const show = (props?: { admin: PlatformAdmin }) => {
  render(<NiceModal.Provider />);
  NiceModal.show(AdminFormModal, props);
};

const resolves = () => ({ unwrap: () => Promise.resolve({ data: admin }) });

beforeEach(() => {
  vi.clearAllMocks();
  createAdmin.mockReturnValue(resolves());
  updateAdmin.mockReturnValue(resolves());
});

describe('AdminFormModal — adding', () => {
  it('sends the role ID, not the label shown in the picker', async () => {
    const user = userEvent.setup();
    show();

    await screen.findByRole('dialog', { name: 'Add New Admin' });
    await user.type(screen.getByLabelText('Full name'), 'Kiki Mordi');
    await user.type(screen.getByLabelText('Email address'), 'kiki@mail.com');
    await user.type(screen.getByLabelText('Phone number'), '+2348100000000');

    // The picker shows "Operations"; the API takes a Mongo id, and sending the
    // name was rejected by @IsMongoId before this.
    await user.click(screen.getByRole('button', { name: /Select an option/ }));
    await user.click(screen.getByRole('button', { name: 'Operations' }));

    await user.click(screen.getByRole('button', { name: 'Add admin' }));

    await waitFor(() =>
      expect(createAdmin).toHaveBeenCalledWith({
        full_name: 'Kiki Mordi',
        email: 'kiki@mail.com',
        phone_number: '+2348100000000',
        role: 'role-ops',
      })
    );
  });

  it('surfaces the server refusal rather than a generic message', async () => {
    const user = userEvent.setup();
    createAdmin.mockReturnValue({
      unwrap: () =>
        Promise.reject({
          data: {
            message: 'An account with that email address already exists.',
          },
        }),
    });
    show();

    await screen.findByRole('dialog', { name: 'Add New Admin' });
    await user.type(screen.getByLabelText('Full name'), 'Kiki Mordi');
    await user.type(screen.getByLabelText('Email address'), 'kiki@mail.com');
    await user.click(screen.getByRole('button', { name: /Select an option/ }));
    await user.click(screen.getByRole('button', { name: 'Operations' }));
    await user.click(screen.getByRole('button', { name: 'Add admin' }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'An account with that email address already exists.'
      )
    );
    // The dialog stays open so the typed values are not lost.
    expect(
      screen.getByRole('dialog', { name: 'Add New Admin' })
    ).toBeInTheDocument();
  });
});

describe('AdminFormModal — editing', () => {
  it('opens on the admin as they are, and patches only that admin', async () => {
    const user = userEvent.setup();
    show({ admin });

    await screen.findByRole('dialog', { name: 'Edit Admin' });
    expect(screen.getByLabelText('Full name')).toHaveValue('Shola James');
    expect(screen.getByLabelText('Email address')).toHaveValue(
      'shola@mail.com'
    );
    // The role picker opens on the role they hold, spelled the way the design
    // shows it rather than the stored 'super_admin'.
    expect(
      screen.getByRole('button', { name: /Super admin/ })
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Full name'));
    await user.type(screen.getByLabelText('Full name'), 'Shola Adeyemi');
    await user.click(screen.getByRole('button', { name: 'Edit admin' }));

    await waitFor(() =>
      expect(updateAdmin).toHaveBeenCalledWith({
        id: 'admin-1',
        data: {
          full_name: 'Shola Adeyemi',
          email: 'shola@mail.com',
          phone_number: '+2348123456789',
          role: 'role-super',
        },
      })
    );
  });
});

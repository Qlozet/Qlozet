import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const updateBusiness = vi.fn(() => ({ unwrap: () => Promise.resolve({}) }));
const updateBusinessDetails = vi.fn(() => ({
  unwrap: () => Promise.resolve({}),
}));
const updateUser = vi.fn(() => ({ unwrap: () => Promise.resolve({}) }));

const business = {
  _id: 'b1',
  business_name: 'Aso Oke Co',
  business_email: 'hello@asooke.ng',
  business_phone_number: '+2348012345678',
  business_address: '12 Marina',
  country: 'Nigeria',
  state: 'Lagos',
  city: 'Ikeja',
  description: 'Handwoven cloth',
  status: 'verified',
  // Never set by this business: the form seeds these blank.
  website: undefined,
  year_founded: undefined,
  nin: undefined,
  bvn: undefined,
  zip_code: undefined,
};

const user = {
  full_name: 'Ada Obi',
  username: 'ada',
  email: 'ada@asooke.ng',
  phone_number: '+2348012345678',
};

vi.mock('@/redux/services/settings/settings.api-slice', () => ({
  useGetBusinessProfileQuery: () => ({
    data: business,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useGetUserProfileQuery: () => ({
    data: user,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useUpdateBusinessProfileMutation: () => [updateBusiness, {}],
  useUpdateBusinessProfileDetailsMutation: () => [updateBusinessDetails, {}],
  useUpdateUserProfileMutation: () => [updateUser, {}],
}));

// The forms are not under test — expose a button that submits the values the
// real form would hand back, seeded from the record exactly as the page seeds
// it (every field through `|| ''`).
vi.mock('../../molecules/organization-profile-form', () => ({
  OrganizationProfileForm: ({ initialData, onSubmit }: any) => (
    <button onClick={() => onSubmit({ ...initialData, ...submitOverrides })}>
      save-org
    </button>
  ),
}));
vi.mock('../../molecules/user-profile-form', () => ({
  UserProfileForm: ({ initialData, onSubmit }: any) => (
    <button onClick={() => onSubmit({ ...initialData, ...submitOverrides })}>
      save-user
    </button>
  ),
}));
vi.mock('../../molecules/vendor-profile-card', () => ({
  VendorProfileCard: () => null,
}));
vi.mock('../../molecules/user-profile-card', () => ({
  UserProfileCard: () => null,
}));

let submitOverrides: Record<string, unknown> = {};

import { ProfileContent } from '../profile-content';

beforeEach(() => {
  submitOverrides = {};
  updateBusiness.mockClear();
  updateBusinessDetails.mockClear();
  updateUser.mockClear();
});

describe('ProfileContent — organization save', () => {
  // Regression: this sent the whole object every time. An untouched field the
  // business had never set went out as an explicit empty string, and any field
  // changed elsewhere between the load and the save was overwritten.
  it('sends only the field that changed', async () => {
    submitOverrides = { about: 'Handwoven cloth, since 1994' };
    render(<ProfileContent />);
    await userEvent.click(screen.getByText('save-org'));

    expect(updateBusinessDetails).toHaveBeenCalledWith({
      description: 'Handwoven cloth, since 1994',
    });
  });

  it('never writes a blank over a field the business never set', async () => {
    // website, year_founded, nin and bvn are all unset, so the form submits ''.
    submitOverrides = { city: 'Yaba' };
    render(<ProfileContent />);
    await userEvent.click(screen.getByText('save-org'));

    expect(updateBusiness).toHaveBeenCalledWith({ city: 'Yaba' });
    expect(updateBusinessDetails).not.toHaveBeenCalled();
  });

  it('skips the endpoint whose half of the form is untouched', async () => {
    submitOverrides = { businessName: 'Aso Oke Limited' };
    render(<ProfileContent />);
    await userEvent.click(screen.getByText('save-org'));

    expect(updateBusinessDetails).toHaveBeenCalledWith({
      business_name: 'Aso Oke Limited',
    });
    expect(updateBusiness).not.toHaveBeenCalled();
  });

  it('sends nothing at all when nothing changed', async () => {
    render(<ProfileContent />);
    await userEvent.click(screen.getByText('save-org'));

    expect(updateBusiness).not.toHaveBeenCalled();
    expect(updateBusinessDetails).not.toHaveBeenCalled();
  });

  it('does send a genuine clearing of a field that had a value', async () => {
    submitOverrides = { about: '' };
    render(<ProfileContent />);
    await userEvent.click(screen.getByText('save-org'));

    expect(updateBusinessDetails).toHaveBeenCalledWith({ description: '' });
  });
});

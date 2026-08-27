import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const upload = vi.fn();
const updateVendor = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: (m: string) => toastSuccess(m),
    error: (m: string) => toastError(m),
  },
}));

vi.mock('@/redux/services/uploads/uploads.api-slice', () => ({
  useUploadProfileImageMutation: () => [upload],
}));

vi.mock('@/redux/services/vendor-details/vendor-details.api-slice', () => ({
  useUpdateVendorProfileMutation: () => [updateVendor],
  useGetVendorWarehousesQuery: () => ({ data: undefined, isLoading: false }),
}));

import { VendorImageUpload } from '../molecules/vendor-image-upload';

const ok = (value: unknown) => ({ unwrap: () => Promise.resolve(value) });
const fail = (message: string) => ({
  unwrap: () => Promise.reject({ data: { message } }),
});

const pick = async (file: File) => {
  const user = userEvent.setup();
  const input = document.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;
  await user.upload(input, file);
};

const image = (name = 'logo.png', size = 1000) => {
  const file = new File(['x'], name, { type: 'image/png' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

beforeEach(() => {
  upload.mockReset();
  updateVendor.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
});

// Portalled overlays from other suites can outlive their own cleanup; clearing
// the body keeps this file's queries unambiguous however it is scheduled.
afterEach(() => {
  document.body.innerHTML = '';
});

describe('VendorImageUpload', () => {
  it('uploads, then writes the URL to the vendor', async () => {
    upload.mockReturnValue(ok({ data: { url: 'https://cdn/x.png' } }));
    updateVendor.mockReturnValue(ok({}));

    render(
      <VendorImageUpload
        businessId="b1"
        field="cover_image_url"
        label="Change banner"
      />
    );
    await pick(image());

    await waitFor(() =>
      expect(updateVendor).toHaveBeenCalledWith({
        businessId: 'b1',
        patch: { cover_image_url: 'https://cdn/x.png' },
      })
    );
    expect(toastSuccess).toHaveBeenCalledWith('Change banner updated');
  });

  it('does not blank the existing image when the upload returns no URL', async () => {
    // Writing an empty string would erase whatever the vendor already had.
    upload.mockReturnValue(ok({ data: {} }));

    render(
      <VendorImageUpload
        businessId="b1"
        field="business_logo_url"
        label="Change logo"
      />
    );
    await pick(image());

    await waitFor(() => expect(toastError).toHaveBeenCalled());
    expect(updateVendor).not.toHaveBeenCalled();
  });

  it('rejects an oversized file before spending the round trip', async () => {
    render(
      <VendorImageUpload
        businessId="b1"
        field="business_logo_url"
        label="Change logo"
      />
    );
    await pick(image('big.png', 6 * 1024 * 1024));

    expect(upload).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith(
      'That image is over 5MB. Choose a smaller one.'
    );
  });

  it('never lets a non-image reach the upload', async () => {
    // The picker itself is restricted, so the browser filters non-images before
    // the change event — the type guard in the handler is the second line of
    // defence for a drag-drop or a spoofed pick.
    render(
      <VendorImageUpload
        businessId="b1"
        field="business_logo_url"
        label="Change logo"
      />
    );

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(input).toHaveAttribute('accept', 'image/*');

    await pick(new File(['x'], 'notes.pdf', { type: 'application/pdf' }));
    expect(upload).not.toHaveBeenCalled();
  });

  it('surfaces the server’s own failure message', async () => {
    upload.mockReturnValue(ok({ data: { url: 'https://cdn/x.png' } }));
    updateVendor.mockReturnValue(fail('Business not found'));

    render(
      <VendorImageUpload
        businessId="b1"
        field="cover_image_url"
        label="Change banner"
      />
    );
    await pick(image());

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Business not found')
    );
  });

  it('is disabled without a vendor to write to', () => {
    render(<VendorImageUpload field="cover_image_url" label="Change banner" />);
    expect(
      screen.getByRole('button', { name: 'Change banner' })
    ).toBeDisabled();
  });

  it('keeps the label reachable when only the icon is drawn', () => {
    // The avatar badge has no room for the text, so the name has to come from
    // the aria-label or the control is unlabelled for a screen reader.
    render(
      <VendorImageUpload
        businessId="b1"
        field="business_logo_url"
        label="Change logo"
        iconOnly
      />
    );

    const button = screen.getByRole('button', { name: 'Change logo' });
    expect(button).toHaveTextContent('');
  });
});

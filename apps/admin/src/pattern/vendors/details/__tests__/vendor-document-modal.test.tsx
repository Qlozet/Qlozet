import { beforeEach, describe, expect, it, vi } from 'vitest';
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
}));

// nice-modal-react's `create` needs a provider; the modal's own logic is what
// matters here, so `create` is reduced to the component it wraps and the
// visible/remove pair is stubbed.
vi.mock('@ebay/nice-modal-react', () => ({
  create: (component: unknown) => component,
  useModal: () => ({ visible: true, remove: vi.fn(), hide: vi.fn() }),
}));

import {
  VendorDocumentModal,
  type VendorDocumentModalProps,
} from '../organisms/vendor-document-modal';

// `create` is mocked out above, but the export is still typed as nice-modal's
// HOC, which demands the `id` its provider would supply. These tests render the
// plain component, so take it at its own prop type.
const Modal = VendorDocumentModal as unknown as (
  props: VendorDocumentModalProps
) => React.ReactElement;

const ok = (value: unknown) => ({ unwrap: () => Promise.resolve(value) });

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
  // jsdom implements neither.
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});

describe('VendorDocumentModal', () => {
  it('opens on the dropzone when the vendor has no document', () => {
    render(
      <Modal
        kind="CAC Document"
        businessId="b1"
        field="cac_document_url"
        uploadLabel="Upload CAC Document"
      />
    );

    expect(screen.getByText('Upload CAC Document')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('saves a CAC document as a list, which is how the record stores it', async () => {
    upload.mockReturnValue(ok({ data: { url: 'https://cdn/cac.pdf' } }));
    updateVendor.mockReturnValue(ok({}));

    render(
      <Modal kind="CAC Document" businessId="b1" field="cac_document_url" />
    );
    await pick(image('cac.png'));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(updateVendor).toHaveBeenCalledWith({
        businessId: 'b1',
        patch: { cac_document_url: ['https://cdn/cac.pdf'] },
      })
    );
    expect(toastSuccess).toHaveBeenCalledWith('CAC Document updated');
  });

  it('writes the logo to the SVG field, leaving the header avatar alone', async () => {
    upload.mockReturnValue(ok({ data: { url: 'https://cdn/logo.png' } }));
    updateVendor.mockReturnValue(ok({}));

    render(
      <Modal kind="PNG Logo" businessId="b1" field="business_logo_svg_url" />
    );
    await pick(image());
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(updateVendor).toHaveBeenCalledWith({
        businessId: 'b1',
        patch: { business_logo_svg_url: 'https://cdn/logo.png' },
      })
    );
  });

  it('does not blank the stored document when the upload returns no URL', async () => {
    upload.mockReturnValue(ok({ data: {} }));

    render(
      <Modal kind="PNG Logo" businessId="b1" field="business_logo_svg_url" />
    );
    await pick(image());
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(toastError).toHaveBeenCalled());
    expect(updateVendor).not.toHaveBeenCalled();
  });

  it('rejects an oversized file before spending the round trip', async () => {
    render(
      <Modal kind="PNG Logo" businessId="b1" field="business_logo_svg_url" />
    );
    await pick(image('big.png', 6 * 1024 * 1024));

    expect(toastError).toHaveBeenCalledWith(
      'That file is over 5MB. Choose a smaller one.'
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('stays read-only, showing download, when there is nowhere to save', () => {
    // No businessId/field: the pencil would open a dropzone whose Save could
    // not go anywhere.
    render(
      <Modal
        kind="CAC Document"
        url="https://cdn/cac.pdf"
        downloadLabel="Download Document"
      />
    );

    expect(
      screen.getByRole('button', { name: 'Download Document' })
    ).toBeEnabled();
    expect(screen.queryByRole('button', { name: /Replace/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });
});

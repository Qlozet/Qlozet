import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NiceModal from '@ebay/nice-modal-react';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back: vi.fn() }),
}));

const useGetAdminProductQuery = vi.fn();
const deleteProduct = vi.fn();
const addProductNote = vi.fn();

vi.mock('@/redux/services/products/products.api-slice', () => ({
  useDeleteProductMutation: () => [deleteProduct, { isLoading: false }],
}));

vi.mock('@/redux/services/products/admin-products.api-slice', () => ({
  useGetAdminProductQuery: (...args: unknown[]) =>
    useGetAdminProductQuery(...args),
  useAddProductNoteMutation: () => [addProductNote, { isLoading: false }],
  useGetProductNotesQuery: () => ({ data: undefined, isLoading: false }),
  useGetAdminProductReviewsQuery: () => ({
    data: undefined,
    isLoading: true,
    isFetching: false,
    isError: false,
  }),
  useEscalateProductMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/redux/services/vendor-details/vendor-details.api-slice', () => ({
  useResolveVendorNoteMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteVendorNoteMutation: () => [vi.fn(), { isLoading: false }],
}));

import { ProductDetailsTemplate } from '../product-details-template';

const PRODUCT_ID = '6a85d60758b5bf8a5636fa24';

const PRODUCT = {
  _id: PRODUCT_ID,
  kind: 'clothing',
  status: 'active',
  base_price: 40000,
  discounted_price: 32000,
  average_rating: 4.5,
  ratings: [{ value: 5 }, { value: 4 }],
  business: { business_name: 'Garm island' },
  clothing: {
    name: 'Garm Forest T-shirt',
    type: 'non_customize',
    taxonomy: { product_type: 'Top', categories: ['T-Shirt'] },
    images: [{ url: 'https://cdn.example/forest.png' }],
    color_variants: [{ hex: '#008000', variants: [{ size: 'L', stock: 9 }] }],
  },
};

const renderPage = () =>
  render(
    <NiceModal.Provider>
      <ProductDetailsTemplate productId={PRODUCT_ID} />
    </NiceModal.Provider>
  );

beforeEach(() => {
  push.mockReset();
  deleteProduct.mockReset();
  addProductNote.mockReset();
  useGetAdminProductQuery.mockReset();
  useGetAdminProductQuery.mockReturnValue({
    data: { data: PRODUCT },
    isLoading: false,
    isError: false,
  });
  deleteProduct.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  addProductNote.mockReturnValue({ unwrap: () => Promise.resolve({}) });
});

describe('ProductDetailsTemplate — header', () => {
  it('reads the nested clothing document, not flat fields', () => {
    renderPage();
    // The page used to read product.name / product.price, which the API does
    // not send — the heading was "Untitled product" and the price a dash.
    expect(screen.getByText('Garm Forest T-shirt')).toBeInTheDocument();
    // Uppercased in CSS, so the DOM still carries the vendor's real casing.
    expect(screen.getByText('Garm island')).toBeInTheDocument();
    expect(screen.getByText('NGN 32,000')).toBeInTheDocument();
  });

  it('reads the product through the admin endpoint, not the customer PDP', () => {
    renderPage();
    // GET /products/{id} 404s on anything not live from an approved vendor —
    // exactly what an admin opens this page to look at.
    expect(useGetAdminProductQuery).toHaveBeenCalledWith(PRODUCT_ID, {
      skip: false,
    });
  });
});

describe('ProductDetailsTemplate — actions', () => {
  it('opens the reviews drawer from the rating', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /read 2 reviews/i }));

    await waitFor(() =>
      expect(screen.getByText('Reviews')).toBeInTheDocument()
    );
  });

  it('confirms before deleting, and does not delete on the first click', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(
        screen.getByText('Are you sure you want to delete this product?')
      ).toBeInTheDocument()
    );
    expect(deleteProduct).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Delete Product' }));
    await waitFor(() => expect(deleteProduct).toHaveBeenCalledWith(PRODUCT_ID));
  });

  it('requires a reason before a flag can be raised', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole('button', { name: /flag this product/i })
    );

    // The Notes & flags panel below carries its own "Flag product" button, so
    // scope to the dialog rather than matching by name across the page.
    const dialog = await screen.findByRole('dialog');
    const confirm = within(dialog).getByRole('button', {
      name: 'Flag product',
    });
    // A flag without a reason is useless — the reason IS the note.
    expect(confirm).toBeDisabled();

    await user.type(
      within(dialog).getByLabelText(/what is wrong with it/i),
      'Images do not match the description'
    );
    await user.click(confirm);

    await waitFor(() =>
      expect(addProductNote).toHaveBeenCalledWith({
        productId: PRODUCT_ID,
        body: 'Images do not match the description',
        kind: 'flag',
      })
    );
  });

  it('opens the edit form on this product, not a blank one', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(push).toHaveBeenCalledWith(`/products/add-product?id=${PRODUCT_ID}`);
  });

  it('opens the customer preview', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /preview/i }));

    const preview = await screen.findByRole('dialog', {
      name: /customer preview of garm forest t-shirt/i,
    });
    // The shopper's view: the sale price, with the original struck through.
    // Naira symbol, via the shared formatCurrency the tables use — the detail
    // page behind it writes "NGN 32,000" from a local helper.
    expect(within(preview).getByText('₦32,000')).toBeInTheDocument();
    expect(within(preview).getByText('₦40,000')).toBeInTheDocument();
    // Nothing in a preview is clickable for the customer.
    expect(
      within(preview).getByRole('button', { name: 'Add to cart' })
    ).toBeDisabled();
  });

  it('warns in the preview when no customer could see the listing', async () => {
    const user = userEvent.setup();
    useGetAdminProductQuery.mockReturnValue({
      data: { data: { ...PRODUCT, status: 'draft' } },
      isLoading: false,
      isError: false,
    });
    renderPage();

    await user.click(screen.getByRole('button', { name: /preview/i }));

    const preview = await screen.findByRole('dialog', {
      name: /customer preview/i,
    });
    // A rendering alone can't answer "is this live?" — the gate is three
    // conditions and a draft fails the first.
    expect(
      within(preview).getByText('No customer can see this listing right now.')
    ).toBeInTheDocument();
    expect(
      within(preview).getByText(/set to "draft", not active/i)
    ).toBeInTheDocument();
  });
});

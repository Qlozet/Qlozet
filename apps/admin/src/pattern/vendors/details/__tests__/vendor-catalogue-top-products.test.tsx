import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const push = vi.fn();
const productsQuery = vi.fn();
const topQuery = vi.fn();
const approve = vi.fn();
const reject = vi.fn();
const showModal = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@ebay/nice-modal-react', () => ({
  default: {
    show: (...args: unknown[]) => showModal(...args),
    create: (component: unknown) => component,
  },
  useModal: () => ({ visible: false, hide: vi.fn(), remove: vi.fn() }),
}));
vi.mock('@/redux/services/products/admin-products.api-slice', () => ({
  useGetAdminProductsQuery: (...args: unknown[]) => productsQuery(...args),
  useApproveAdminProductMutation: () => [approve],
  useRejectAdminProductMutation: () => [reject],
}));
vi.mock('@/redux/services/vendor-details/vendor-details.api-slice', () => ({
  useGetVendorTopProductsQuery: (...args: unknown[]) => topQuery(...args),
}));

import { VendorCatalogueSection } from '../organisms/vendor-catalogue-section';
import { TopProductsTable } from '../organisms/top-products-table';

const product = (id: string, patch: Record<string, unknown> = {}) => ({
  _id: id,
  name: `Product ${id}`,
  kind: 'clothing',
  status: 'active',
  base_price: 20000,
  images: [],
  moderation: { status: 'approved' },
  ...patch,
});

const withProducts = (rows: unknown[]) =>
  productsQuery.mockReturnValue({
    data: { data: { data: rows, total_items: rows.length, total_pages: 1 } },
    isLoading: false,
    isFetching: false,
    isError: false,
  });

beforeEach(() => {
  [push, productsQuery, topQuery, approve, reject, showModal].forEach((m) =>
    m.mockReset()
  );
  approve.mockReturnValue({ unwrap: () => Promise.resolve({}) });
});

describe('VendorCatalogueSection', () => {
  it('opens the product page that exists, not /products/<id>', async () => {
    withProducts([product('p1')]);
    render(<VendorCatalogueSection businessId="b1" />);
    await userEvent.click(screen.getByTitle('Open Product p1'));
    expect(push).toHaveBeenCalledWith('/product-details?id=p1');
  });

  it('offers approve and reject only on listings waiting for review', () => {
    withProducts([
      product('live'),
      product('waiting', { moderation: { status: 'pending' } }),
    ]);
    render(<VendorCatalogueSection businessId="b1" />);
    expect(
      screen.getByRole('button', { name: 'Approve Product waiting' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reject Product waiting' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Approve Product live' })
    ).toBeNull();
  });

  it('approves straight from the card', async () => {
    withProducts([product('w1', { moderation: { status: 'pending' } })]);
    render(<VendorCatalogueSection businessId="b1" />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Approve Product w1' })
    );
    expect(approve).toHaveBeenCalledWith({ id: 'w1' });
    expect(push).not.toHaveBeenCalled();
  });

  it('rejecting asks for a reason first', async () => {
    withProducts([product('w1', { moderation: { status: 'pending' } })]);
    render(<VendorCatalogueSection businessId="b1" />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Reject Product w1' })
    );
    expect(reject).not.toHaveBeenCalled();
    const [, props] = showModal.mock.calls[0] as [
      unknown,
      { reason: { required: boolean } },
    ];
    expect(props.reason.required).toBe(true);
  });

  it('filters on the server, and offers approve-all in the review view', async () => {
    withProducts([
      product('a', { moderation: { status: 'pending' } }),
      product('b', { moderation: { status: 'pending' } }),
    ]);
    render(<VendorCatalogueSection businessId="b1" />);
    await userEvent.click(screen.getByRole('button', { name: 'Under review' }));
    expect(productsQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        business_id: 'b1',
        status: 'active',
        moderation_status: 'pending',
        page: 1,
      })
    );
    expect(
      screen.getByRole('button', { name: /Approve all on this page/ })
    ).toBeInTheDocument();
  });
});

describe('TopProductsTable', () => {
  const withTop = (rows: unknown[]) =>
    topQuery.mockReturnValue({
      data: { data: rows },
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
    });

  const top = [
    {
      _id: 't1',
      name: 'Agbada',
      kind: 'clothing',
      units_sold: 6,
      orders: 5,
      revenue: 300000,
      base_price: 50000,
    },
    {
      _id: 't2',
      name: 'Lace',
      kind: 'fabric',
      units_sold: 10,
      orders: 4,
      revenue: 100000,
      base_price: 10000,
    },
  ];

  it('ranks all time by default and switches to a window', async () => {
    withTop(top);
    render(<TopProductsTable businessId="b1" />);
    expect(topQuery).toHaveBeenLastCalledWith({
      businessId: 'b1',
      limit: 25,
      days: undefined,
    });
    await userEvent.click(screen.getByRole('button', { name: '30 days' }));
    expect(topQuery).toHaveBeenLastCalledWith({
      businessId: 'b1',
      limit: 25,
      days: 30,
    });
  });

  it('summarises the mix of what sells', () => {
    withTop(top);
    render(<TopProductsTable businessId="b1" />);
    expect(screen.getByText(/Clothing 75%, Fabric 25%/)).toBeInTheDocument();
  });

  it('a row opens the product', async () => {
    withTop(top);
    render(<TopProductsTable businessId="b1" />);
    const row = screen.getByText('Agbada').closest('tr') as HTMLElement;
    await userEvent.click(within(row).getByText('Agbada'));
    expect(push).toHaveBeenCalledWith('/product-details?id=t1');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NiceModal from '@ebay/nice-modal-react';
import type {
  CustomerReview,
  CustomerReviewsSummary,
} from '@/redux/services/customers/customers.api-slice';

const useGetCustomerReviewsQuery = vi.fn();

vi.mock('@/redux/services/customers/customers.api-slice', () => ({
  useGetCustomerReviewsQuery: (...args: unknown[]) =>
    useGetCustomerReviewsQuery(...args),
}));

import { CustomerReviewsDrawer } from '../customer-reviews-drawer';

const CUSTOMER_ID = '6a8d36d913059a4e22f225fa';

const query = (patch: Record<string, unknown> = {}) => ({
  data: undefined,
  isLoading: false,
  isFetching: false,
  isSuccess: true,
  isError: false,
  error: undefined,
  ...patch,
});

const summary = (
  patch: Partial<CustomerReviewsSummary> = {}
): CustomerReviewsSummary => ({
  total_reviews: 100,
  average_rating: 4.8,
  five_star: 35,
  four_star: 25,
  three_star: 20,
  two_star: 15,
  one_star: 5,
  ...patch,
});

const review = (patch: Partial<CustomerReview> = {}): CustomerReview => ({
  product_id: 'p1',
  product_name: 'Maison De Vetements Loafers',
  product_kind: 'clothing',
  product_image: 'https://cdn.example.com/loafers.png',
  vendor_name: 'Maison De Vetements',
  rating: 5,
  comment: 'Great dress, it fits perfectly. I will order more',
  created_at: '2026-08-15T09:31:00.000Z',
  ...patch,
});

const payload = (patch: Record<string, unknown> = {}) => ({
  summary: summary(),
  reviews: [review()],
  pagination: { page: 1, size: 20, total: 100, pages: 5 },
  ...patch,
});

let drawer: HTMLElement;
let seq = 0;

/** Fresh NiceModal id per test — its store outlives testing-library cleanup. */
const open = async () => {
  const id = `customer-reviews-${(seq += 1)}`;
  render(<NiceModal.Provider />);
  NiceModal.register(id, CustomerReviewsDrawer, {
    customerId: CUSTOMER_ID,
    customerName: 'Kenshin Jen',
  });
  NiceModal.show(id);

  drawer = await screen.findByRole('dialog', { hidden: true });
  return drawer;
};

/** The filled overlay's width for a bucket row, e.g. "35%". */
const barWidth = (label: string): string => {
  const row = within(drawer).getByText(label).parentElement as HTMLElement;
  const fill = row.querySelector('span > span') as HTMLElement;
  return fill.style.width;
};

beforeEach(() => {
  useGetCustomerReviewsQuery.mockReset();
  useGetCustomerReviewsQuery.mockReturnValue(
    query({ data: { data: payload() } })
  );
});

describe('CustomerReviewsDrawer', () => {
  it("asks for this customer's reviews, first page", async () => {
    await open();

    expect(useGetCustomerReviewsQuery).toHaveBeenCalledWith(
      { customerId: CUSTOMER_ID, page: 1, size: 20 },
      { skip: false }
    );
  });

  it('shows the average and the count it summarises', async () => {
    await open();

    expect(within(drawer).getByText('4.8')).toBeInTheDocument();
    expect(
      within(drawer).getByText('Overall rating of 100 reviews')
    ).toBeInTheDocument();
    // Not rounded up to five solid stars — the overlay is clipped to the value.
    expect(
      within(drawer).getAllByLabelText('4.8 out of 5').length
    ).toBeGreaterThan(0);
  });

  it('draws each bar as its share of all their reviews', async () => {
    await open();

    // 35 of 100, not 100% because it happens to be the tallest bucket.
    expect(barWidth('Excellent')).toBe('35%');
    expect(barWidth('Good')).toBe('25%');
    expect(barWidth('Poor')).toBe('5%');
  });

  it('pads the counts to two digits, like the design', async () => {
    await open();

    expect(within(drawer).getByText('05')).toBeInTheDocument();
    expect(within(drawer).getByText('35')).toBeInTheDocument();
  });

  it('renders the product and the vendor who sold it on each row', async () => {
    await open();

    expect(
      within(drawer).getByText('Maison De Vetements Loafers')
    ).toBeInTheDocument();
    expect(within(drawer).getByText('Maison De Vetements')).toBeInTheDocument();
    expect(
      within(drawer).getByText(/Great dress, it fits perfectly/)
    ).toBeInTheDocument();
  });

  it('shows a rating left without a comment as stars alone', async () => {
    useGetCustomerReviewsQuery.mockReturnValue(
      query({
        data: {
          data: payload({
            reviews: [review({ comment: null })],
            summary: summary({ total_reviews: 1 }),
            pagination: { page: 1, size: 20, total: 1, pages: 1 },
          }),
        },
      })
    );

    await open();

    expect(
      within(drawer).getByText('Maison De Vetements Loafers')
    ).toBeInTheDocument();
    expect(within(drawer).queryByText(/Great dress/)).toBeNull();
  });

  it('asks for a bigger page rather than a second request to merge', async () => {
    const user = userEvent.setup();
    await open();

    // 1 of 100 loaded.
    await user.click(
      within(drawer).getByRole('button', { name: /Show more/, hidden: true })
    );

    await waitFor(() =>
      expect(useGetCustomerReviewsQuery).toHaveBeenLastCalledWith(
        { customerId: CUSTOMER_ID, page: 1, size: 40 },
        { skip: false }
      )
    );
  });

  it('offers no Show more once everything is loaded', async () => {
    useGetCustomerReviewsQuery.mockReturnValue(
      query({
        data: {
          data: payload({
            summary: summary({ total_reviews: 1 }),
            pagination: { page: 1, size: 20, total: 1, pages: 1 },
          }),
        },
      })
    );

    await open();

    expect(
      within(drawer).queryByRole('button', { name: /Show more/, hidden: true })
    ).toBeNull();
  });

  it('says who wrote nothing rather than drawing empty bars', async () => {
    useGetCustomerReviewsQuery.mockReturnValue(
      query({
        data: {
          data: payload({
            summary: summary({
              total_reviews: 0,
              average_rating: 0,
              five_star: 0,
              four_star: 0,
              three_star: 0,
              two_star: 0,
              one_star: 0,
            }),
            reviews: [],
            pagination: { page: 1, size: 20, total: 0, pages: 0 },
          }),
        },
      })
    );

    await open();

    expect(within(drawer).getByText('No reviews yet')).toBeInTheDocument();
    expect(
      within(drawer).getByText(/Kenshin Jen hasn't reviewed anything/)
    ).toBeInTheDocument();
    expect(within(drawer).queryByText('Excellent')).toBeNull();
  });

  it('surfaces the API message when the read fails', async () => {
    useGetCustomerReviewsQuery.mockReturnValue(
      query({
        isError: true,
        isSuccess: false,
        error: { data: { message: 'Customer not found' } },
      })
    );

    await open();

    expect(within(drawer).getByText('Customer not found')).toBeInTheDocument();
  });
});

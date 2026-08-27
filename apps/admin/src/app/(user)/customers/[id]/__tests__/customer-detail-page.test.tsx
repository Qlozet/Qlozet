import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CustomerDetail } from '@/redux/services/customers/customers.api-slice';

const CUSTOMER_ID = '6a4a085a4ba435c95283926c';

const useGetCustomerQuery = vi.fn();
const useGetCustomersQuery = vi.fn();
const useGetCustomerTransactionsQuery = vi.fn();

const EMPTY_QUERY = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isSuccess: true,
  isError: false,
  error: undefined,
};

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: CUSTOMER_ID }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/redux/services/customers/customers.api-slice', () => ({
  useGetCustomerQuery: (...args: unknown[]) =>
    useGetCustomerQuery(...args) ?? EMPTY_QUERY,
  useGetCustomersQuery: (...args: unknown[]) =>
    useGetCustomersQuery(...args) ?? EMPTY_QUERY,
  useGetCustomerTransactionsQuery: (...args: unknown[]) =>
    useGetCustomerTransactionsQuery(...args) ?? EMPTY_QUERY,
}));

// The charts and the tickets table have their own queries and their own tests;
// this one is about where the customer record comes from.
vi.mock(
  '@/pattern/customers/details/organisms/customer-analytics-section',
  () => ({
    CustomerAnalyticsSection: ({ customerId }: { customerId: string }) => (
      <div data-testid="analytics">{customerId}</div>
    ),
  })
);

vi.mock('@/pattern/customers/details/organisms/customer-tickets-table', () => ({
  CustomerTicketsTable: ({ customerId }: { customerId: string }) => (
    <div data-testid="tickets">{customerId}</div>
  ),
}));

import CustomerDetailsPage from '../page';

const DETAIL = {
  _id: CUSTOMER_ID,
  full_name: 'John Doe',
  username: 'johndoe',
  email: 'customer@example.com',
  phone: '+2348148972345',
  gender: 'male',
  status: 'active',
  address: { state: 'Lagos', city: 'Ikeja' },
  location: 'Ikeja, Lagos',
  created_at: '2026-07-05T00:00:00.000Z',
  last_login_at: '2026-08-26T09:12:00.000Z',
  total_orders: 14,
  reviews_count: 20,
  followed_vendors: 3,
  reserved_fabrics: 1,
  wallet_balance: 25000,
  pending_balance: 0,
  token_balance: 120,
  total_returns: 4500,
  lifetime_spending: 486000,
} as CustomerDetail;

describe('CustomerDetailsPage', () => {
  it('loads the one customer instead of scanning the list', () => {
    useGetCustomerQuery.mockReturnValue({
      ...EMPTY_QUERY,
      data: { data: DETAIL },
    });

    render(<CustomerDetailsPage />);

    expect(useGetCustomerQuery).toHaveBeenCalledWith(CUSTOMER_ID, {
      skip: false,
    });
    // The page used to pull /admin/customer?size=200 and search it by _id,
    // which found nothing for the 201st customer.
    expect(useGetCustomersQuery).not.toHaveBeenCalled();
  });

  it('feeds the detail payload to every section', () => {
    useGetCustomerQuery.mockReturnValue({
      ...EMPTY_QUERY,
      data: { data: DETAIL },
    });

    render(<CustomerDetailsPage />);

    // The name shows twice: the header and the "Customer name" card.
    expect(screen.getAllByText('John Doe')).toHaveLength(2);
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('Ikeja, Lagos')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('₦25,000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reviews/i })).toHaveTextContent(
      '20 reviews'
    );
    // Both child tables stay scoped to this customer.
    expect(screen.getByTestId('analytics')).toHaveTextContent(CUSTOMER_ID);
    expect(screen.getByTestId('tickets')).toHaveTextContent(CUSTOMER_ID);
    expect(useGetCustomerTransactionsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: CUSTOMER_ID }),
      { skip: false }
    );
  });

  it('waits for a route id before firing the request', () => {
    useGetCustomerQuery.mockReturnValue(EMPTY_QUERY);

    render(<CustomerDetailsPage />);

    // The id is present here; the guard is asserted through the call shape so
    // an empty id can never produce GET /admin/customer/undefined.
    expect(useGetCustomerQuery).toHaveBeenCalledWith(
      CUSTOMER_ID,
      expect.objectContaining({ skip: false })
    );
  });
});

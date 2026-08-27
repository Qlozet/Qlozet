import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type {
  CustomerDetail,
  GetCustomerTransactionsParams,
} from '@/redux/services/customers/customers.api-slice';
import type { Transaction } from '@/redux/services/transactions/transactions.api-slice';

const useGetCustomerTransactionsQuery = vi.fn();

const EMPTY_QUERY = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isSuccess: true,
  isError: false,
  error: undefined,
};

vi.mock('@/redux/services/customers/customers.api-slice', () => ({
  useGetCustomerTransactionsQuery: (...args: unknown[]) =>
    useGetCustomerTransactionsQuery(...args) ?? EMPTY_QUERY,
}));

import { CustomerInfoGrid } from '../customer-info-grid';
import { CustomerDetailHeader } from '../customer-detail-header';
import { CustomerWalletSection } from '../customer-wallet-section';
import { CustomerTransactionsTable } from '../customer-transactions-table';

const CUSTOMER_ID = '6a4a085a4ba435c95283926c';

// GET /admin/customer/:id, exactly as the contract spells it: snake_case
// throughout, with every supported figure a number.
const detail = (patch: Partial<CustomerDetail> = {}): CustomerDetail =>
  ({
    _id: CUSTOMER_ID,
    full_name: 'John Doe',
    first_name: 'John',
    last_name: 'Doe',
    username: 'johndoe',
    email: 'customer@example.com',
    phone: '+2348148972345',
    gender: 'male',
    status: 'active',
    profile_picture: 'https://cdn.example.com/john.png',
    address: { state: 'Lagos', city: 'Ikeja' },
    location: 'Ikeja, Lagos',
    created_at: '2026-07-05T00:00:00.000Z',
    last_login_at: '2026-08-26T09:12:00.000Z',
    total_orders: 14,
    last_order_at: '2026-08-15T09:31:00.000Z',
    reviews_count: 20,
    followed_vendors: 3,
    reserved_fabrics: 1,
    wallet_balance: 25000,
    pending_balance: 0,
    token_balance: 120,
    total_returns: 4500,
    lifetime_spending: 486000,
    ...patch,
  }) as CustomerDetail;

/** The value an InfoCard shows under `label`. */
const cardValue = (label: string): string => {
  const card = screen.getByText(label).parentElement as HTMLElement;
  const values = card.querySelectorAll('p, a');
  return values[1]?.textContent?.trim() ?? '';
};

/** The value a MetricCard shows under `title`. */
const metricValue = (title: string): string => {
  // title <p> sits in a header row; the value <p> is its uncle.
  const block = screen.getByText(title).parentElement
    ?.parentElement as HTMLElement;
  const paragraphs = block.querySelectorAll('p');
  return paragraphs[paragraphs.length - 1]?.textContent?.trim() ?? '';
};

describe('CustomerInfoGrid', () => {
  it('fills every card from the detail payload', () => {
    render(<CustomerInfoGrid customer={detail()} />);

    expect(cardValue('Customer name')).toBe('John Doe');
    expect(cardValue('Location')).toBe('Ikeja, Lagos');
    expect(cardValue('Phone number')).toBe('+2348148972345');
    expect(cardValue('Gender')).toBe('male');
    expect(cardValue('Total orders')).toBe('14');
    expect(cardValue('Followed Vendors')).toBe('3');
    expect(cardValue('Reserved Fabric')).toBe('1');
    // created_at, not createdAt — the camelCase read left this dashed.
    expect(cardValue('Date joined')).toBe('5th Jul, 2026');
    // Formatted from last_login_at; the clock is the test machine's, so assert
    // the shape rather than a timezone-dependent hour.
    expect(cardValue('Last logged in')).toMatch(
      /^\d{1,2}:\d{2}(am|pm) - \d{2}\/\d{2}\/2026$/
    );
  });

  it('builds the location from the address when the string is absent', () => {
    render(
      <CustomerInfoGrid
        customer={detail({ location: null, address: { state: 'Lagos' } })}
      />
    );

    expect(cardValue('Location')).toBe('Lagos');
  });

  it('renders a real zero as 0, not a dash', () => {
    render(
      <CustomerInfoGrid
        customer={detail({
          total_orders: 0,
          followed_vendors: 0,
          reserved_fabrics: 0,
        })}
      />
    );

    // A customer who has ordered nothing has zero orders. That is an answer,
    // and it must not read as "we don't know".
    expect(cardValue('Total orders')).toBe('0');
    expect(cardValue('Followed Vendors')).toBe('0');
    expect(cardValue('Reserved Fabric')).toBe('0');
  });

  it('dashes only the values the payload has no source for', () => {
    render(
      <CustomerInfoGrid
        customer={detail({
          location: null,
          address: null,
          gender: null,
          last_login_at: null,
          total_orders: null,
          followed_vendors: null,
          reserved_fabrics: null,
        })}
      />
    );

    for (const label of [
      'Location',
      'Gender',
      'Last logged in',
      'Total orders',
      'Followed Vendors',
      'Reserved Fabric',
    ]) {
      expect(cardValue(label)).toBe('—');
    }
  });
});

describe('CustomerDetailHeader', () => {
  it('shows the reviews the customer actually wrote', () => {
    render(<CustomerDetailHeader customer={detail({ reviews_count: 7 })} />);

    expect(screen.getByRole('button', { name: /reviews/i })).toHaveTextContent(
      '7 reviews'
    );
  });

  it('shows 0 reviews rather than the old hardcoded 20', () => {
    render(<CustomerDetailHeader customer={detail({ reviews_count: 0 })} />);

    const button = screen.getByRole('button', { name: /reviews/i });
    expect(button).toHaveTextContent('0 reviews');
    expect(button).not.toHaveTextContent('20');
  });

  it('dashes the count when the payload carries none', () => {
    render(<CustomerDetailHeader customer={detail({ reviews_count: null })} />);

    expect(screen.getByRole('button', { name: /reviews/i })).toHaveTextContent(
      '— reviews'
    );
  });
});

describe('CustomerWalletSection', () => {
  it('reads the four wallet figures from the detail payload', () => {
    render(
      <CustomerWalletSection customer={detail()} customerId={CUSTOMER_ID} />
    );

    expect(metricValue('Wallet Balance')).toBe('₦25,000');
    expect(metricValue('Token Balance')).toBe('120 TCN');
    expect(metricValue('Total Returns')).toBe('₦4,500');
    expect(metricValue('Lifetime Spending')).toBe('₦486,000');
  });

  it('renders a zero balance as money, not as a dash', () => {
    render(
      <CustomerWalletSection
        customer={detail({
          wallet_balance: 0,
          token_balance: 0,
          total_returns: 0,
          lifetime_spending: 0,
        })}
        customerId={CUSTOMER_ID}
      />
    );

    expect(metricValue('Wallet Balance')).toBe('₦0');
    expect(metricValue('Token Balance')).toBe('0 TCN');
    expect(metricValue('Total Returns')).toBe('₦0');
    expect(metricValue('Lifetime Spending')).toBe('₦0');
  });

  it('dashes a figure the payload has no source for', () => {
    render(
      <CustomerWalletSection
        customer={detail({
          wallet_balance: null,
          token_balance: null,
          total_returns: null,
          lifetime_spending: null,
        })}
        customerId={CUSTOMER_ID}
      />
    );

    expect(metricValue('Wallet Balance')).toBe('—');
    expect(metricValue('Token Balance')).toBe('—');
    expect(metricValue('Total Returns')).toBe('—');
    expect(metricValue('Lifetime Spending')).toBe('—');
  });

  it('scopes the transactions table to this customer', () => {
    render(
      <CustomerWalletSection customer={detail()} customerId={CUSTOMER_ID} />
    );

    expect(useGetCustomerTransactionsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: CUSTOMER_ID }),
      { skip: false }
    );
  });
});

const transaction = (patch: Partial<Transaction> = {}): Transaction =>
  ({
    _id: 'tx-1',
    transactionId: 'TRX-1042',
    amount: 25000,
    currency: 'NGN',
    type: 'credit',
    narration: 'Wallet top-up',
    status: 'successful',
    createdAt: '2026-08-15T09:31:00.000Z',
    ...patch,
  }) as Transaction;

const page = (rows: Transaction[]) => ({
  data: {
    data: rows,
    total_items: 12,
    total_pages: 3,
    current_page: 1,
    page_size: 5,
    has_next_page: true,
    has_previous_page: false,
  },
});

describe('CustomerTransactionsTable', () => {
  it('asks the customer-scoped endpoint for the first page', () => {
    useGetCustomerTransactionsQuery.mockReturnValue({
      ...EMPTY_QUERY,
      data: page([transaction()]),
    });

    render(<CustomerTransactionsTable customerId={CUSTOMER_ID} />);

    const args = useGetCustomerTransactionsQuery.mock
      .calls[0][0] as GetCustomerTransactionsParams;
    expect(args).toEqual({ customerId: CUSTOMER_ID, page: 1, size: 5 });
  });

  it('renders the rows the endpoint returned', () => {
    useGetCustomerTransactionsQuery.mockReturnValue({
      ...EMPTY_QUERY,
      data: page([transaction()]),
    });

    render(<CustomerTransactionsTable customerId={CUSTOMER_ID} />);

    expect(screen.getByText('TRX-1042')).toBeInTheDocument();
    expect(screen.getByText('NGN 25,000')).toBeInTheDocument();
    expect(screen.getByText('Wallet top-up')).toBeInTheDocument();
    expect(screen.getByText('Successful')).toBeInTheDocument();
  });

  it('offers no search box — the endpoint takes page and size only', () => {
    useGetCustomerTransactionsQuery.mockReturnValue({
      ...EMPTY_QUERY,
      data: page([transaction()]),
    });

    render(<CustomerTransactionsTable customerId={CUSTOMER_ID} />);

    expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();
  });

  it('fires nothing until there is an id to scope by', () => {
    useGetCustomerTransactionsQuery.mockReturnValue(EMPTY_QUERY);

    render(<CustomerTransactionsTable customerId="" />);

    expect(useGetCustomerTransactionsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: '' }),
      { skip: true }
    );
  });
});

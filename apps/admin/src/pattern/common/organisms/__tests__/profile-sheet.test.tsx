import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const useGetAdminProfileOverviewQuery = vi.fn();
const useGetCurrentUserQuery = vi.fn();
const useGetRolesQuery = vi.fn();
const useGetLatestDigestQuery = vi.fn();
const markDigestRead = vi.fn();

vi.mock('@/redux/services/dashboard/dashboard.api-slice', () => ({
  useGetAdminProfileOverviewQuery: (...args: unknown[]) =>
    useGetAdminProfileOverviewQuery(...args) ?? {
      data: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    },
}));

vi.mock('@/redux/services/users/users.api-slice', () => ({
  useGetCurrentUserQuery: (...args: unknown[]) =>
    useGetCurrentUserQuery(...args) ?? { data: undefined, isLoading: false },
  useGetRolesQuery: (...args: unknown[]) =>
    useGetRolesQuery(...args) ?? { data: undefined },
}));

vi.mock('@/redux/services/assistant/assistant.api-slice', () => ({
  useGetLatestDigestQuery: () =>
    useGetLatestDigestQuery() ?? { data: undefined, isLoading: false },
  useMarkDigestReadMutation: () => [markDigestRead],
}));

import { ProfileSheet } from '../profile-sheet';
import { AdminTasksSection } from '../admin-tasks-section';

const OVERVIEW = {
  currency: 'NGN',
  taskWindowDays: 30,
  stats: {
    customers: 10000,
    vendors: 20000,
    tasksCompleted: 20,
    ticketsClosed: 20000,
  },
  metrics: {
    vendorsManaged: 20,
    ticketsResolved: 100,
    totalSalesOversight: 500000,
  },
  tasks: [
    {
      id: '1',
      title: 'Approved vendor',
      vendor: 'Ankara Bliss',
      status: 'completed' as const,
      at: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    },
    {
      id: '2',
      title: 'Purchase report for last month',
      vendor: null,
      status: 'pending' as const,
      at: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    },
  ],
};

beforeEach(() => {
  useGetAdminProfileOverviewQuery.mockReset();
  useGetCurrentUserQuery.mockReset();
  useGetRolesQuery.mockReset();
  useGetLatestDigestQuery.mockReset();

  useGetCurrentUserQuery.mockReturnValue({
    data: { data: { full_name: 'Kennedy Ekechukwu', email: 'k@e.com' } },
    isLoading: false,
  });
  useGetRolesQuery.mockReturnValue({ data: undefined });
  useGetLatestDigestQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
  });
});

const withOverview = (value: unknown, extra: Record<string, unknown> = {}) => {
  const refetch = vi.fn();
  useGetAdminProfileOverviewQuery.mockReturnValue({
    data: value === undefined ? undefined : { data: value },
    isLoading: false,
    isFetching: false,
    refetch,
    ...extra,
  });
  return refetch;
};

describe('ProfileSheet', () => {
  it('renders the four stats the design calls for', () => {
    withOverview(OVERVIEW);
    render(<ProfileSheet open onOpenChange={vi.fn()} />);

    for (const label of [
      'Customers',
      'Vendors',
      'Task Completed',
      'Tickets closed',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getAllByText('20,000')).toHaveLength(2); // vendors + tickets
    expect(screen.getByText('10,000')).toBeInTheDocument();
  });

  it('renders the metrics panel with sales in naira', () => {
    withOverview(OVERVIEW);
    render(<ProfileSheet open onOpenChange={vi.fn()} />);

    expect(screen.getByText('Vendors Managed')).toBeInTheDocument();
    expect(screen.getByText('Tickets resolved')).toBeInTheDocument();
    // The design mocks a dollar figure; the marketplace trades in naira.
    expect(screen.getByText('₦500,000')).toBeInTheDocument();
  });

  it('keeps the per-admin and platform-wide figures distinct', () => {
    withOverview(OVERVIEW);
    render(<ProfileSheet open onOpenChange={vi.fn()} />);

    // "Tickets closed" is platform-wide (20,000); "Tickets resolved" is this
    // admin's own (100). Reading one for the other is the bug this guards.
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getAllByText('20')).toHaveLength(2); // tasksCompleted + vendorsManaged
  });

  it('does not fetch while the drawer is closed', () => {
    withOverview(OVERVIEW);
    render(<ProfileSheet open={false} onOpenChange={vi.fn()} />);

    expect(useGetAdminProfileOverviewQuery).toHaveBeenCalledWith(undefined, {
      skip: true,
    });
  });

  it('renders zeroes rather than crashing when the endpoint returns nothing', () => {
    withOverview(undefined);
    render(<ProfileSheet open onOpenChange={vi.fn()} />);

    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });
});

describe('AdminTasksSection', () => {
  const props = {
    tasks: OVERVIEW.tasks,
    windowDays: 30,
    isLoading: false,
    isFetching: false,
    onRefresh: vi.fn(),
  };

  it('lists tasks with their vendor and relative time', () => {
    render(<AdminTasksSection {...props} />);

    expect(screen.getByText('Approved vendor')).toBeInTheDocument();
    expect(screen.getByText('Ankara Bliss')).toBeInTheDocument();
    expect(screen.getAllByText('5d ago')).toHaveLength(2);
  });

  it('filters by the Completed and Pending tabs', async () => {
    const user = userEvent.setup();
    render(<AdminTasksSection {...props} />);

    await user.click(screen.getByRole('tab', { name: 'Completed' }));
    expect(screen.getByText('Approved vendor')).toBeInTheDocument();
    expect(
      screen.queryByText('Purchase report for last month')
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Pending' }));
    expect(
      screen.getByText('Purchase report for last month')
    ).toBeInTheDocument();
    expect(screen.queryByText('Approved vendor')).not.toBeInTheDocument();
  });

  it('distinguishes "no tasks at all" from "none in this tab"', async () => {
    const user = userEvent.setup();
    render(<AdminTasksSection {...props} tasks={[OVERVIEW.tasks[0]]} />);

    await user.click(screen.getByRole('tab', { name: 'Pending' }));
    expect(
      screen.getByText('No pending tasks in this period.')
    ).toBeInTheDocument();

    render(<AdminTasksSection {...props} tasks={[]} />);
    expect(
      screen.getByText('No tickets have been assigned to you recently.')
    ).toBeInTheDocument();
  });

  it('follows the API’s window rather than hardcoding a month', () => {
    render(<AdminTasksSection {...props} windowDays={7} />);
    expect(screen.getByText('Tasks (last 7 days)')).toBeInTheDocument();
  });

  it('refreshes on demand and locks the button while in flight', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    const { rerender } = render(
      <AdminTasksSection {...props} onRefresh={onRefresh} />
    );
    await user.click(screen.getByRole('button', { name: 'Refresh tasks' }));
    expect(onRefresh).toHaveBeenCalledOnce();

    rerender(<AdminTasksSection {...props} onRefresh={onRefresh} isFetching />);
    expect(
      screen.getByRole('button', { name: 'Refresh tasks' })
    ).toBeDisabled();
  });
});

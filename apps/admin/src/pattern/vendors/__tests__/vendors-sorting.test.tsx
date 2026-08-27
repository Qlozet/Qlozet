import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import {
  createVendorsTableColumns,
  type VendorSortColumn,
} from '@/pattern/vendors/molecules/vendors-table-columns';

const noop = () => {};

const renderColumns = (
  overrides: Partial<Parameters<typeof createVendorsTableColumns>[0]> = {},
  rows: Business[] = []
) => {
  const columns = createVendorsTableColumns({
    onViewDetails: noop,
    onApprove: noop,
    onVerify: noop,
    onReject: noop,
    onSetInReview: noop,
    onToggleSort: noop,
    ...overrides,
  }) as ColumnDef<Business, unknown>[];

  return render(
    <DataTable<Business>
      columns={columns}
      data={rows}
      pagination={{ pageIndex: 0, pageSize: 8 }}
      setPagination={vi.fn()}
      pageCount={1}
      isSuccess
    />
  );
};

describe('vendors table sorting', () => {
  const SORTABLE: { label: string; column: VendorSortColumn }[] = [
    { label: "Vendor's name", column: 'name' },
    { label: 'Date onboarded', column: 'date' },
    { label: 'Products', column: 'products' },
    { label: 'Orders', column: 'orders' },
    { label: 'Revenue', column: 'revenue' },
  ];

  it('offers every column the endpoint can order by', () => {
    renderColumns();
    for (const { label } of SORTABLE) {
      expect(
        screen.getByRole('button', { name: `Sort by ${label.toLowerCase()}` })
      ).toBeInTheDocument();
    }
  });

  it('asks the server for each column by its own key', async () => {
    const onToggleSort = vi.fn();
    const user = userEvent.setup();
    renderColumns({ onToggleSort });

    for (const { label, column } of SORTABLE) {
      await user.click(
        screen.getByRole('button', { name: `Sort by ${label.toLowerCase()}` })
      );
      expect(onToggleSort).toHaveBeenLastCalledWith(column);
    }
  });

  it('announces the active direction on the sorted column only', () => {
    renderColumns({ sort: 'revenue', order: 'desc' });

    expect(
      screen.getByRole('button', { name: 'Revenue, sorted descending' })
    ).toBeInTheDocument();
    // The others stay in their unsorted state.
    expect(
      screen.getByRole('button', { name: 'Sort by orders' })
    ).toBeInTheDocument();
  });

  it('reflects an ascending sort', () => {
    renderColumns({ sort: 'products', order: 'asc' });
    expect(
      screen.getByRole('button', { name: 'Products, sorted ascending' })
    ).toBeInTheDocument();
  });
});

describe('vendors row actions', () => {
  const vendor = (status: string): Business =>
    ({ _id: 'b1', business_name: 'Flamez', status }) as Business;

  const openMenu = async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Actions for/ }));
    return user;
  };

  const labels = () =>
    screen.getAllByRole('menuitem').map((el) => el.textContent);

  it('does not offer Approve to an already-approved vendor', async () => {
    // A no-op the admin has to reason about, and it makes the menu look broken.
    renderColumns({}, [vendor('approved')]);
    await openMenu();
    expect(labels()).not.toContain('Approve');
    expect(labels()).toContain('Verify');
  });

  it('offers nothing redundant to a verified vendor', async () => {
    renderColumns({}, [vendor('verified')]);
    await openMenu();
    const items = labels();
    expect(items).not.toContain('Approve');
    expect(items).not.toContain('Verify');
    expect(items).toContain('Reject');
  });

  it('offers the full ladder to a pending vendor', async () => {
    renderColumns({}, [vendor('pending')]);
    await openMenu();
    const items = labels();
    expect(items).toContain('Approve');
    expect(items).toContain('Verify');
    expect(items).toContain('Reject');
    // Already in review — sending it back would change nothing.
    expect(items).not.toContain('Send to review');
  });

  it('offers Send to review, which the table never exposed before', async () => {
    // The mutation existed and was wired on the detail page only, so sending a
    // vendor back meant opening their page first.
    renderColumns({}, [vendor('rejected')]);
    await openMenu();
    expect(labels()).toContain('Send to review');
    expect(labels()).not.toContain('Reject');
  });

  it('disables the state changes while one is in flight', async () => {
    renderColumns({ isUpdating: true }, [vendor('pending')]);
    await openMenu();

    expect(screen.getByRole('menuitem', { name: /Approve/ })).toHaveAttribute(
      'data-disabled'
    );
    // Navigation is still allowed.
    expect(
      screen.getByRole('menuitem', { name: /View details/ })
    ).not.toHaveAttribute('data-disabled');
  });
});

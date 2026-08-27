import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../data-table';

interface Row {
  id: string;
}

const columns: ColumnDef<Row, unknown>[] = [
  { id: 'id', header: 'Id', cell: ({ row }) => row.original.id },
];

const page = Array.from({ length: 8 }, (_, i) => ({ id: `row-${i}` }));

const renderTable = (
  props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}
) =>
  render(
    <DataTable<Row>
      columns={columns}
      data={page}
      pagination={{ pageIndex: 0, pageSize: 8 }}
      setPagination={vi.fn()}
      pageCount={2}
      isSuccess
      {...props}
    />
  );

describe('DataTable pagination footer', () => {
  it('reports the row total, not the page count', () => {
    // It used to print the PAGE count in the "of" slot, so a 16-row, 2-page
    // table announced "Showing 1 - 8 of 2".
    renderTable({ totalRows: 16 });
    expect(screen.getByText(/Showing 1 - 8 of 16/)).toBeInTheDocument();
  });

  it('counts within the last page correctly', () => {
    renderTable({
      totalRows: 16,
      pagination: { pageIndex: 1, pageSize: 8 },
    });
    expect(screen.getByText(/Showing 9 - 16 of 16/)).toBeInTheDocument();
  });

  it('does not run past the total on a short final page', () => {
    renderTable({
      totalRows: 11,
      data: page.slice(0, 3),
      pagination: { pageIndex: 1, pageSize: 8 },
    });
    expect(screen.getByText(/Showing 9 - 11 of 11/)).toBeInTheDocument();
  });

  it('falls back to the rows it was handed when no total is given', () => {
    // Tables that do not paginate server-side still read sensibly.
    renderTable();
    expect(screen.getByText(/Showing 1 - 8 of 8/)).toBeInTheDocument();
  });

  it('shows the empty state instead of a footer when there are no rows', () => {
    renderTable({ data: [], totalRows: 0, emptyMessage: 'No vendors found.' });
    expect(screen.getByText('No vendors found.')).toBeInTheDocument();
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });
});

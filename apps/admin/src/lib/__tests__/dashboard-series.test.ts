import { describe, expect, it } from 'vitest';
import {
  hasAnyValue,
  maxOf,
  readSeries,
  returnsBreakdown,
  sumSeries,
  withoutZeroes,
} from '@/lib/dashboard-series';
import type { Chart } from '@/redux/services/dashboard/dashboard.api-slice';
import type { AdminOrder } from '@/redux/services/orders/orders.api-slice';

const chart = (data: { label: string; value: number; color?: string }[]) =>
  ({
    chartType: 'bar',
    title: 'Revenue by Month',
    series: [{ key: 'revenue', name: 'Revenue', data }],
  }) as Chart;

describe('readSeries', () => {
  it("maps the API's { label, value } onto the { name, value } recharts wants", () => {
    expect(readSeries(chart([{ label: 'Aug', value: 156921.99 }]))).toEqual([
      { name: 'Aug', value: 156921.99 },
    ]);
  });

  it('carries a point colour through when the API sets one', () => {
    expect(
      readSeries(chart([{ label: 'Processing', value: 48, color: '#9C8578' }]))
    ).toEqual([{ name: 'Processing', value: 48, color: '#9C8578' }]);
  });

  it('omits the colour key entirely rather than setting it undefined', () => {
    // recharts' <Cell fill> falls back to the series colour on a missing key
    // but paints transparent on an explicit undefined.
    expect(
      Object.keys(readSeries(chart([{ label: 'Aug', value: 1 }]))[0])
    ).toEqual(['name', 'value']);
  });

  it('returns an empty series rather than throwing while the query is in flight', () => {
    expect(readSeries(undefined)).toEqual([]);
    expect(
      readSeries({ chartType: 'bar', title: 'x', series: [] } as Chart)
    ).toEqual([]);
  });
});

describe('series helpers', () => {
  it('treats an all-zero series as empty — a zero-filled year is not data', () => {
    const zeroFilledYear = readSeries(
      chart(['Jan', 'Feb', 'Mar'].map((label) => ({ label, value: 0 })))
    );
    expect(hasAnyValue(zeroFilledYear)).toBe(false);
    expect(hasAnyValue(readSeries(chart([{ label: 'Jan', value: 0.5 }])))).toBe(
      true
    );
  });

  it('sums to kobo, so float addition does not leak onto the card', () => {
    expect(
      sumSeries(
        readSeries(
          chart([
            { label: 'Jan', value: 0.1 },
            { label: 'Feb', value: 0.2 },
          ])
        )
      )
    ).toBe(0.3);
  });

  it('reports 0 as the max of an empty series instead of -Infinity', () => {
    // Math.max() with no arguments returns -Infinity, which would make the
    // chart's YAxis domain nonsensical.
    expect(maxOf([])).toBe(0);
    expect(
      maxOf(
        readSeries(
          chart([
            { label: 'a', value: 3 },
            { label: 'b', value: 7 },
          ])
        )
      )
    ).toBe(7);
  });

  it('drops zero slices so a donut has no invisible wedge with a visible legend row', () => {
    const statuses = readSeries(
      chart([
        { label: 'Processing', value: 48 },
        { label: 'Returned', value: 0 },
        { label: 'Completed', value: 1 },
      ])
    );
    expect(withoutZeroes(statuses).map((p) => p.name)).toEqual([
      'Processing',
      'Completed',
    ]);
  });
});

describe('returnsBreakdown', () => {
  // `_id` is the only field AdminOrder requires; everything else is optional.
  let next = 0;
  const order = (fields: Partial<AdminOrder>): AdminOrder =>
    ({ _id: `order-${(next += 1)}`, ...fields }) as AdminOrder;

  it('returns nothing when no order carries refund information', () => {
    // A 0% return rate the data cannot substantiate is worse than an empty
    // card, so this drives the empty template instead.
    expect(returnsBreakdown([order({ status: 'completed' })])).toEqual([]);
  });

  it('splits refunded from kept, counting partial refunds as returned', () => {
    expect(
      returnsBreakdown([
        order({ refund_status: 'refunded' }),
        order({ refund_status: 'partial' }),
        order({ refund_status: 'none' }),
        order({ refund_status: 'none' }),
      ])
    ).toEqual([
      { name: 'Returned', value: 2 },
      { name: 'Kept', value: 2 },
    ]);
  });

  it('ignores orders with no refund field while counting the ones that have it', () => {
    expect(
      returnsBreakdown([
        order({ refund_status: 'refunded' }),
        order({ status: 'pending' }),
      ])
    ).toEqual([
      { name: 'Returned', value: 1 },
      { name: 'Kept', value: 0 },
    ]);
  });
});

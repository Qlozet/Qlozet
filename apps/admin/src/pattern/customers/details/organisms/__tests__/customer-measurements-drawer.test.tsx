import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NiceModal from '@ebay/nice-modal-react';
import type { CustomerMeasurements } from '@/redux/services/customers/customers.api-slice';

const useGetCustomerMeasurementsQuery = vi.fn();

vi.mock('@/redux/services/customers/customers.api-slice', () => ({
  useGetCustomerMeasurementsQuery: (...args: unknown[]) =>
    useGetCustomerMeasurementsQuery(...args),
}));

import { CustomerMeasurementsDrawer } from '../customer-measurements-drawer';

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

/**
 * GET /admin/customer/:id/measurements. A set is a flat map holding only what
 * the customer recorded, so the fixtures below are deliberately partial.
 */
const payload = (patch: Partial<CustomerMeasurements> = {}) =>
  ({
    full_name: 'John Doe',
    gender: 'male',
    sets: [
      {
        name: 'default',
        unit: 'cm',
        active: true,
        created_at: '2026-08-25T09:12:00.000Z',
        measurements: {
          chest: 96,
          waist: 81,
          hip: 99,
          shoulder_breadth: 45,
        },
      },
    ],
    active_set: {
      name: 'default',
      unit: 'cm',
      active: true,
      created_at: '2026-08-25T09:12:00.000Z',
      measurements: {
        chest: 96,
        waist: 81,
        hip: 99,
        shoulder_breadth: 45,
      },
    },
    body_type: null,
    ...patch,
  }) as CustomerMeasurements;

const wide = (count: number) =>
  Object.fromEntries(
    [
      'neck',
      'shoulder_breadth',
      'chest',
      'waist',
      'hip',
      'arm_length',
      'sleeve_length',
      'thigh',
      'inseam',
      'outseam',
      'leg_length',
      'crotch_depth',
      'bicep',
      'wrist',
      'knee',
      'calf',
    ]
      .slice(0, count)
      .map((key, i) => [key, 20 + i])
  );

let drawer: HTMLElement;
let seq = 0;

/**
 * Opens the drawer under a fresh id each time — NiceModal keys instances by
 * component and its store outlives testing-library's cleanup, so re-showing the
 * same component hands back the previous test's instance with its state.
 */
const open = async () => {
  const id = `customer-measurements-${(seq += 1)}`;
  render(<NiceModal.Provider />);
  NiceModal.register(id, CustomerMeasurementsDrawer, {
    customerId: CUSTOMER_ID,
    customerName: 'John Doe',
  });
  NiceModal.show(id);

  drawer = await screen.findByRole('dialog', { hidden: true });
  return drawer;
};

const button = (name: RegExp | string) =>
  within(drawer).getByRole('button', { name, hidden: true });

/** The value rendered beside a measurement's label. */
const rowValue = (label: string): string => {
  const row = within(drawer).getByText(label).parentElement as HTMLElement;
  return row.querySelectorAll('span')[1]?.textContent?.trim() ?? '';
};

beforeEach(() => {
  useGetCustomerMeasurementsQuery.mockReset();
  useGetCustomerMeasurementsQuery.mockReturnValue(
    query({ data: { data: payload() } })
  );
});

describe('CustomerMeasurementsDrawer', () => {
  it('reads the customer from the path, not the caller', async () => {
    await open();

    expect(useGetCustomerMeasurementsQuery).toHaveBeenCalledWith(CUSTOMER_ID, {
      skip: false,
    });
  });

  it('renders only the measurements the customer recorded', async () => {
    await open();

    expect(within(drawer).getByText('Chest/Bust Circ.')).toBeInTheDocument();
    expect(within(drawer).getByText('Shoulder Width')).toBeInTheDocument();
    // Nothing invented to fill out the grid.
    expect(within(drawer).queryByText('Ankle Circum.')).toBeNull();
    expect(within(drawer).queryByText('Knee Circum.')).toBeNull();
  });

  it('converts to inches on the toggle and back again', async () => {
    const user = userEvent.setup();
    await open();

    expect(rowValue('Waist Circ.')).toBe('81');

    await user.click(button('in'));
    // 81cm → 31.9in, not 81 with a different suffix.
    await waitFor(() => expect(rowValue('Waist Circ.')).toBe('31.9'));

    await user.click(button('cm'));
    await waitFor(() => expect(rowValue('Waist Circ.')).toBe('81'));
  });

  it('holds the tail back behind View More', async () => {
    const user = userEvent.setup();
    const set = {
      name: 'default',
      unit: 'cm' as const,
      active: true,
      created_at: '2026-08-25T09:12:00.000Z',
      measurements: wide(16),
    };
    useGetCustomerMeasurementsQuery.mockReturnValue(
      query({ data: { data: payload({ sets: [set], active_set: set }) } })
    );

    await open();

    // Twelve shown, the last four behind the button.
    expect(within(drawer).queryByText('Knee Circum.')).toBeNull();

    await user.click(button(/View More/));
    expect(within(drawer).getByText('Knee Circum.')).toBeInTheDocument();

    await user.click(button(/View Less/));
    await waitFor(() =>
      expect(within(drawer).queryByText('Knee Circum.')).toBeNull()
    );
  });

  it('offers no View More when everything already fits', async () => {
    await open();

    expect(
      within(drawer).queryByRole('button', { name: /View More/ })
    ).toBeNull();
  });

  it('dates the body type only when the classification was actually stored', async () => {
    useGetCustomerMeasurementsQuery.mockReturnValue(
      query({
        data: {
          data: payload({
            body_type: {
              type: 'inverted_triangle',
              confidence: 'high',
              flattering_fits: ['tailored'],
              avoid_fits: [],
              style_advice: [],
              // Derived for this response — there is no "last checked" moment.
              computed_at: null,
              from_set: 'default',
            },
          }),
        },
      })
    );

    await open();

    expect(within(drawer).getByText('Body Type - Male')).toBeInTheDocument();
    expect(within(drawer).getByText('Inverted triangle')).toBeInTheDocument();
    expect(within(drawer).queryByText(/Last checked/)).toBeNull();
  });

  it('says whose measurements are missing rather than showing empty fields', async () => {
    useGetCustomerMeasurementsQuery.mockReturnValue(
      query({
        data: {
          data: payload({ sets: [], active_set: null, body_type: null }),
        },
      })
    );

    await open();

    expect(within(drawer).getByText('No measurements yet')).toBeInTheDocument();
    expect(
      within(drawer).getByText(/John Doe hasn't recorded any body measurements/)
    ).toBeInTheDocument();
  });

  it('surfaces the API message when the read fails', async () => {
    useGetCustomerMeasurementsQuery.mockReturnValue(
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

import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NiceModal from '@ebay/nice-modal-react';
import { CustomerMeasurementsModal } from '../customer-measurements-modal';

const SET = {
  name: 'Me',
  unit: 'cm' as const,
  active: true,
  createdAt: '2026-10-01T00:00:00.000Z',
  measurements: {
    chest: 107,
    waist: 97,
    hip: 104,
    shoulder_width: 51.1,
    height: 181,
  },
  tailoring_meta: { shoulder_width: { tier: 'rough' } },
};

const customer = (patch: Record<string, unknown> = {}) =>
  ({
    _id: 'c1',
    username: null,
    full_name: 'Ada Obi',
    profile_picture: '',
    status: 'active',
    total_orders: 2,
    orders: [],
    default_measurement: SET,
    gender: 'male',
    body_type: {
      type: 'rectangle',
      confidence: 'high',
      flattering_fits: ['structured', 'layered'],
      avoid_fits: ['very_baggy'],
      computed_at: null,
    },
    ...patch,
  }) as never;

let seq = 0;
let panel: HTMLElement;

const open = async (props: Record<string, unknown>) => {
  const id = `vendor-measurements-${(seq += 1)}`;
  render(<NiceModal.Provider />);
  NiceModal.register(id, CustomerMeasurementsModal, props);
  NiceModal.show(id);
  panel = await screen.findByRole('dialog', { hidden: true });
};

describe('CustomerMeasurementsModal (vendor)', () => {
  it('shows the default set grouped, with the summary figures', async () => {
    await open({ customer: customer(), measurementSet: SET });
    expect(within(panel).getByText('Body Measurement')).toBeInTheDocument();
    expect(
      within(panel).getByText(/^Current profile · Updated /)
    ).toBeInTheDocument();
    expect(within(panel).getByText('Upper body')).toBeInTheDocument();
    expect(within(panel).getByText('Lengths')).toBeInTheDocument();
    // Once as a summary figure, once in its group.
    expect(within(panel).getAllByText('Waist').length).toBeGreaterThan(0);
  });

  it('shows the body type the way the admin panel does', async () => {
    await open({ customer: customer(), measurementSet: SET });
    expect(within(panel).getByText('Body Type - Male')).toBeInTheDocument();
    expect(within(panel).getByText('Rectangle')).toBeInTheDocument();
    expect(within(panel).getByText('Structured')).toBeInTheDocument();
    expect(within(panel).getByText('Very baggy')).toBeInTheDocument();
    expect(
      within(panel).getByText('Worked out from their default measurements')
    ).toBeInTheDocument();
  });

  it('marks rough estimates for the tailor to verify', async () => {
    await open({ customer: customer(), measurementSet: SET });
    expect(within(panel).getByText('Verify')).toBeInTheDocument();
  });

  it('converts to inches', async () => {
    const user = userEvent.setup();
    await open({ customer: customer(), measurementSet: SET });
    const row = () =>
      within(panel)
        .getAllByText('Waist')
        .at(-1)!
        .parentElement?.querySelectorAll('span')[1]?.textContent;
    expect(row()).toBe('97');
    await user.click(
      within(panel).getByRole('button', { name: 'in', hidden: true })
    );
    await waitFor(() => expect(row()).toBe('38.2'));
  });

  it('hides an unclassified body type', async () => {
    await open({
      customer: customer({
        body_type: {
          type: 'unclassified',
          confidence: 'low',
          flattering_fits: [],
          avoid_fits: [],
          computed_at: null,
        },
      }),
      measurementSet: SET,
    });
    expect(within(panel).queryByText(/Body Type/)).toBeNull();
  });

  it('says so when the customer has no default set', async () => {
    await open({
      customer: customer({ default_measurement: null, body_type: null }),
    });
    expect(within(panel).getByText('No measurements yet')).toBeInTheDocument();
  });
});

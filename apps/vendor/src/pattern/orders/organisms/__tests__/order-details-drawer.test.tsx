import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  act,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NiceModal from '@ebay/nice-modal-react';

// ── Module stubs ──────────────────────────────────────────────────────────
// Only the data-fetching edges are replaced; the pure order helpers
// (getVendorItems, getVendorShipment, …) run for real so the drawer is
// exercised the way it behaves in the app.

vi.mock('@/redux/services/orders/orders.api-slice', async (importOriginal) => {
  // Declared inside the factory — vi.mock is hoisted above module scope.
  const noopMutation = () => [
    vi.fn().mockResolvedValue({}),
    { isLoading: false },
  ];
  return {
    ...(await importOriginal<Record<string, unknown>>()),
    useFulfillOrderMutation: noopMutation,
    useConfirmOrderMutation: noopMutation,
    useRejectOrderMutation: noopMutation,
    // Added with per-item rejection — unmocked it is a real RTK hook and
    // crashes the render with "could not find react-redux context".
    useRejectOrderItemMutation: noopMutation,
    // Order-scoped measurements card (order-quote-drawer); harmless here.
    useGetOrderMeasurementsQuery: () => ({ data: null, isLoading: false }),
  };
});

vi.mock(
  '@/redux/services/business/business.api-slice',
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    useGetOrderEarningsQuery: () => ({ data: undefined, isLoading: false }),
  })
);

// Bespoke order chat — real RTK hooks otherwise, which need a store Provider.
vi.mock(
  '@/redux/services/messaging/messaging.api-slice',
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    useGetOrderMessagesQuery: () => ({
      data: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }),
    useSendOrderMessageMutation: () => [
      vi.fn().mockResolvedValue({}),
      { isLoading: false },
    ],
  })
);

vi.mock('@/redux/store', () => ({
  useAppSelector: () => ({ _id: 'biz-1' }),
  useAppDispatch: () => vi.fn(),
}));

import { OrderDetailsDrawer } from '../order-details-drawer';

// ── Fixtures ──────────────────────────────────────────────────────────────

const baseOrder = {
  _id: 'order-1',
  reference: 'QLZ-001',
  status: 'processing',
  type: 'standard',
  total: 45000,
  subtotal: 45000,
  createdAt: '2026-03-09T10:00:00.000Z',
  customer: { _id: 'cust-1', username: 'ada' },
  items: [],
  shipments: [],
};

const item = (name: string, images: string[]) => ({
  business: 'biz-1',
  total_price: 15000,
  product: {
    kind: 'clothing',
    base_price: 15000,
    clothing: { name, images: images.map((url) => ({ url })) },
  },
});

const renderDrawer = async (order: Record<string, unknown>) => {
  render(
    <NiceModal.Provider>
      <div />
    </NiceModal.Provider>
  );
  await act(async () => {
    NiceModal.show(OrderDetailsDrawer, { order: order as never });
  });
  await screen.findByText('Order details');
};

const panelImage = () => screen.queryByTestId('order-media-panel-image');

beforeEach(() => {
  // The companion panel is desktop-only; report a desktop viewport so the
  // drawer takes the panel path rather than the mobile lightbox fallback.
  window.matchMedia = ((query: string) => ({
    matches: /min-width/.test(query),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

// ── Bespoke design preview (regression) ───────────────────────────────────

describe('OrderDetailsDrawer — bespoke design', () => {
  const bespokeOrder = {
    ...baseOrder,
    type: 'bespoke',
    items: [],
    bespoke_design: {
      _id: 'design-1',
      name: 'Royal Agbada',
      category: 'agbada',
      design_images: [
        'https://cdn.test/design-1.png',
        'https://cdn.test/design-2.png',
      ],
      description: JSON.stringify({ notes: 'Loose sleeves', selections: {} }),
    },
  };

  it('shows the design preview for a bespoke order', async () => {
    await renderDrawer(bespokeOrder);

    expect(screen.getByText('Royal Agbada')).toBeInTheDocument();
    expect(screen.getByText('Bespoke design')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'View Royal Agbada media' })
    ).toBeInTheDocument();
  });

  it('renders the design thumbnail image', async () => {
    await renderDrawer(bespokeOrder);

    const thumb = screen
      .getByRole('button', { name: 'View Royal Agbada media' })
      .querySelector('img');
    expect(thumb).toHaveAttribute('src', 'https://cdn.test/design-1.png');
  });

  it('opens the Bespoke Design modal when the design is clicked', async () => {
    const user = userEvent.setup();
    await renderDrawer(bespokeOrder);

    expect(screen.queryByText('Design details')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /View design/i }));

    expect(await screen.findByText('Design details')).toBeInTheDocument();
    // The modal's own content, not just the card behind it.
    expect(await screen.findByText('Design Images')).toBeInTheDocument();
  });

  it('does not render a design section for a standard order', async () => {
    await renderDrawer({ ...baseOrder, items: [item('Kaftan', ['x.png'])] });
    expect(screen.queryByText('Bespoke design')).not.toBeInTheDocument();
  });

  it('does not render a design section when the design is an unpopulated id', async () => {
    await renderDrawer({
      ...baseOrder,
      type: 'bespoke',
      bespoke_design: 'design-1',
    });
    expect(screen.queryByText('Bespoke design')).not.toBeInTheDocument();
    // Falls back to the normal (empty) items section rather than showing nothing.
    expect(screen.getByText('Your items (0)')).toBeInTheDocument();
  });
});

// ── Large preview is click-driven (regression) ────────────────────────────

describe('OrderDetailsDrawer — large image preview', () => {
  const twoItemOrder = {
    ...baseOrder,
    items: [
      item('Kaftan', [
        'https://cdn.test/kaftan-1.png',
        'https://cdn.test/kaftan-2.png',
      ]),
      item('Cap', ['https://cdn.test/cap-1.png']),
    ],
  };

  it('opens the media panel alongside the drawer with the order media', async () => {
    await renderDrawer(twoItemOrder);

    expect(screen.getByText('Your items (2)')).toBeInTheDocument();
    // The panel auto-opens seeded with the vendor's item images so the vendor
    // sees what was ordered without an extra click.
    await waitFor(() =>
      expect(panelImage()).toHaveAttribute(
        'src',
        'https://cdn.test/kaftan-1.png'
      )
    );
  });

  it('shows the large image only after an item thumbnail is clicked', async () => {
    const user = userEvent.setup();
    await renderDrawer(twoItemOrder);

    await user.click(screen.getByRole('button', { name: 'View Kaftan media' }));

    await waitFor(() =>
      expect(panelImage()).toHaveAttribute(
        'src',
        'https://cdn.test/kaftan-1.png'
      )
    );
  });

  it('replaces the main image when another thumbnail is clicked', async () => {
    const user = userEvent.setup();
    await renderDrawer(twoItemOrder);

    await user.click(screen.getByRole('button', { name: 'View Kaftan media' }));
    await waitFor(() =>
      expect(panelImage()).toHaveAttribute(
        'src',
        'https://cdn.test/kaftan-1.png'
      )
    );

    await user.click(screen.getByRole('button', { name: 'View Cap media' }));
    await waitFor(() =>
      expect(panelImage()).toHaveAttribute('src', 'https://cdn.test/cap-1.png')
    );

    // Exactly one large image — the second click swapped it, it didn't stack a
    // separate expanded view on top.
    expect(screen.getAllByTestId('order-media-panel-image')).toHaveLength(1);
  });

  it('does not open the separate expanded-image modal', async () => {
    const user = userEvent.setup();
    await renderDrawer(twoItemOrder);

    await user.click(screen.getByRole('button', { name: 'View Kaftan media' }));
    await waitFor(() => expect(panelImage()).toBeInTheDocument());

    // The lightbox modal titles itself with the item name in a dialog heading.
    expect(
      screen.queryByRole('dialog', { name: 'Kaftan' })
    ).not.toBeInTheDocument();
  });

  it('the panel handle closes the drawer and panel together', async () => {
    await renderDrawer(twoItemOrder);

    await waitFor(() => expect(panelImage()).toBeInTheDocument());

    // The panel sits outside SheetContent by design, so Radix marks it
    // aria-hidden while the drawer is open — hence `hidden: true`. Radix also
    // puts `pointer-events: none` on <body>; the panel opts back in with a
    // Tailwind class that jsdom never applies, so fireEvent is used instead of
    // userEvent's pointer simulation here.
    fireEvent.click(
      screen.getByRole('button', { name: 'Close order details', hidden: true })
    );

    await waitFor(() => expect(panelImage()).not.toBeInTheDocument());
    await waitFor(() =>
      expect(screen.queryByText('Order details')).not.toBeInTheDocument()
    );

    // handleClose schedules NiceModal's remove() 300ms out; let it fire while
    // the test environment is still alive, or it lands after teardown as an
    // unhandled "window is not defined" and fails the whole run.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });
  });

  it('seeds the panel with the bespoke design media', async () => {
    await renderDrawer({
      ...baseOrder,
      type: 'bespoke',
      items: [],
      bespoke_design: {
        name: 'Royal Agbada',
        design_images: ['https://cdn.test/d1.png'],
      },
    });

    // Bespoke orders have no catalogue items — the design IS the garment, so
    // the auto-opened panel shows the design images.
    await waitFor(() =>
      expect(panelImage()).toHaveAttribute('src', 'https://cdn.test/d1.png')
    );
  });
});

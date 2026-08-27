import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import NiceModal from '@ebay/nice-modal-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { OrderItemDetailModal } from '../order-item-detail-modal';

/**
 * The order drawer is a Radix Sheet, and its companion surfaces — the media
 * panel, the item detail modal, the media preview above that — all render
 * outside SheetContent. Radix dismisses a Dialog on any pointer interaction
 * outside its Content, so clicking any of them (the item modal's own close
 * button included) took the drawer down with it.
 *
 * These exercise the drawer's Sheet wiring rather than the whole drawer, which
 * needs an order payload and a dozen queries to render.
 */
const Drawer = ({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) => (
  <Sheet open onOpenChange={onOpenChange}>
    <SheetContent
      side="right"
      onInteractOutside={(event) => event.preventDefault()}
      aria-describedby={undefined}
    >
      <button type="button">Inside the drawer</button>
    </SheetContent>
  </Sheet>
);

/** Radix's dismissable layer listens for a primary-button pointerdown. */
const clickThrough = (element: Element) => {
  fireEvent.pointerDown(element, { button: 0, ctrlKey: false });
  fireEvent.click(element);
};

describe('order drawer dismissal', () => {
  it('stays open when a click lands outside its content', () => {
    const onOpenChange = vi.fn();
    render(<Drawer onOpenChange={onOpenChange} />);

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    try {
      clickThrough(outside);
      expect(onOpenChange).not.toHaveBeenCalled();
    } finally {
      outside.remove();
    }
  });

  it('survives closing the item detail modal opened from it', async () => {
    const onOpenChange = vi.fn();

    render(
      <NiceModal.Provider>
        <Drawer onOpenChange={onOpenChange} />
      </NiceModal.Provider>
    );

    // The item modal portals to <body>, i.e. outside SheetContent.
    NiceModal.show(OrderItemDetailModal, {
      item: { _id: 'item-1', total_price: 24000 } as never,
    });

    // `hidden: true` is load-bearing: Radix aria-hidden's everything outside an
    // open modal Dialog, so the item modal — which renders outside the Sheet —
    // is absent from the accessibility tree while the drawer is open. It is
    // visible and interactive; a screen reader cannot reach it. Separate defect
    // from the dismissal one under test here.
    //
    // Scoping also matters: the Sheet renders its own X, also named "Close",
    // and a loose query resolves on that one before the modal even mounts.
    const modal = await screen.findByRole('dialog', {
      name: 'Item details',
      hidden: true,
    });
    clickThrough(
      within(modal).getByRole('button', { name: 'Close', hidden: true })
    );

    // The modal goes; the drawer stays.
    expect(
      screen.queryByRole('dialog', { name: 'Item details', hidden: true })
    ).not.toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByText('Inside the drawer')).toBeInTheDocument();
  });

  it('survives a click on the item modal’s backdrop', async () => {
    const onOpenChange = vi.fn();

    render(
      <NiceModal.Provider>
        <Drawer onOpenChange={onOpenChange} />
      </NiceModal.Provider>
    );

    NiceModal.show(OrderItemDetailModal, {
      item: { _id: 'item-1', total_price: 24000 } as never,
    });
    await screen.findByRole('dialog', {
      name: 'Item details',
      hidden: true,
    });

    // The backdrop is the modal's own dismiss target and sits furthest from
    // SheetContent — the clearest "outside" click Radix could act on.
    const backdrop = document.querySelector('.backdrop-blur-sm');
    expect(backdrop).toBeTruthy();
    clickThrough(backdrop!);

    expect(
      screen.queryByRole('dialog', { name: 'Item details', hidden: true })
    ).not.toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

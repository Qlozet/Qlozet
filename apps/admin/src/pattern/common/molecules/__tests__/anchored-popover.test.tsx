import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { AnchoredPopover } from '../anchored-popover';

/**
 * The bug this exists to prevent: every table toolbar sits inside the DataTable
 * card, which is `overflow-hidden` for its rounded corners. A panel positioned
 * `absolute` inside that toolbar was clipped by the card, losing its lower half
 * with no way to scroll to it.
 */
const Harness = ({ startOpen = false }: { startOpen?: boolean }) => {
  const [open, setOpen] = useState(startOpen);
  return (
    <div data-testid="clipping-card" style={{ overflow: 'hidden' }}>
      <AnchoredPopover
        open={open}
        onOpenChange={setOpen}
        label="Filter products"
        trigger={
          <button type="button" onClick={() => setOpen((v) => !v)}>
            Filter By :
          </button>
        }
      >
        <p>Min price</p>
      </AnchoredPopover>
    </div>
  );
};

describe('AnchoredPopover', () => {
  it('renders the panel outside the clipping ancestor', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Filter By :' }));

    const panel = screen.getByRole('dialog', { name: 'Filter products' });
    const card = screen.getByTestId('clipping-card');
    // Portalled to the body, so the card's overflow can't cut it off.
    expect(card.contains(panel)).toBe(false);
    expect(document.body.contains(panel)).toBe(true);
  });

  it('positions itself fixed, so it can never be clipped or scrolled away', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Filter By :' }));

    const panel = screen.getByRole('dialog', { name: 'Filter products' });
    expect(panel.style.position).toBe('fixed');
    // Capped to the room actually available, so it scrolls internally rather
    // than running off the bottom of the screen.
    expect(panel.style.maxHeight).not.toBe('');
  });

  it('renders nothing while closed', () => {
    render(<Harness />);
    expect(
      screen.queryByRole('dialog', { name: 'Filter products' })
    ).not.toBeInTheDocument();
  });

  it('closes on Escape and on a click outside', async () => {
    const user = userEvent.setup();
    render(<Harness startOpen />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filter By :' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps a click inside the panel from closing it', async () => {
    const user = userEvent.setup();
    render(<Harness startOpen />);

    await user.click(screen.getByText('Min price'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

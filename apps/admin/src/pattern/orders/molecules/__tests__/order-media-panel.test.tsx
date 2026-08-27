import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { OrderMediaPanel } from '../order-media-panel';

const renderPanel = (images: string[]) =>
  render(<OrderMediaPanel images={images} drawerOpen onClose={vi.fn()} />);

const image = () => screen.getByTestId('order-media-panel-image');
const skeleton = () => screen.queryByTestId('order-media-panel-skeleton');

describe('OrderMediaPanel', () => {
  // A garment photo off the network arrives well after the drawer does. Until
  // it lands the panel is a 469x559 hole, which reads as a broken panel rather
  // than one still filling in.
  it('pulses a skeleton over the image until it loads', () => {
    renderPanel(['https://cdn.test/wool.jpg']);

    expect(skeleton()).toBeInTheDocument();
    expect(skeleton()).toHaveClass('animate-pulse');
    expect(image()).toHaveClass('opacity-0');
  });

  it('reveals the image and drops the skeleton once it loads', () => {
    renderPanel(['https://cdn.test/wool.jpg']);

    fireEvent.load(image());

    expect(skeleton()).not.toBeInTheDocument();
    expect(image()).toHaveClass('opacity-100');
  });

  // A URL that 404s never fires `onLoad`, so the skeleton has to be ended by
  // the error too — otherwise it pulses forever on an image never coming.
  it('replaces the skeleton with a message when the image fails', () => {
    renderPanel(['https://cdn.test/gone.jpg']);

    fireEvent.error(image());

    expect(skeleton()).not.toBeInTheDocument();
    expect(
      screen.getByText('This image could not be loaded')
    ).toBeInTheDocument();
  });

  // Load state is keyed by URL: stepping back to an image the browser already
  // has must not flash grey while the cached file is handed straight over.
  it('does not re-skeleton an image that has already loaded', async () => {
    renderPanel(['https://cdn.test/one.jpg', 'https://cdn.test/two.jpg']);
    fireEvent.load(image());

    await userEvent.click(screen.getByRole('button', { name: /next image/i }));
    expect(skeleton()).toBeInTheDocument();
    fireEvent.load(image());

    await userEvent.click(
      screen.getByRole('button', { name: /previous image/i })
    );
    expect(skeleton()).not.toBeInTheDocument();
  });

  it('shows the empty placeholder when the order has no media', () => {
    renderPanel([]);

    expect(screen.getByText('No media for this order')).toBeInTheDocument();
    expect(skeleton()).not.toBeInTheDocument();
  });
});

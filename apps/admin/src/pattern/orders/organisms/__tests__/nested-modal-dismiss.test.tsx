import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  NESTED_MODAL_LAYER,
  useNestedModalDismiss,
} from '@/lib/hooks/useNestedModalDismiss';

/**
 * These cover the two ways a plain fixed-overlay modal breaks when it is opened
 * from inside a Radix dialog: the parent locks pointer events on <body>, and it
 * owns Escape.
 */

const Modal = ({
  label,
  onClose,
  enabled = true,
}: {
  label: string;
  onClose: () => void;
  enabled?: boolean;
}) => {
  useNestedModalDismiss(onClose, enabled);
  return (
    <div data-testid={label} className={`fixed inset-0 ${NESTED_MODAL_LAYER}`}>
      <button type="button" onClick={onClose}>
        Close {label}
      </button>
    </div>
  );
};

describe('useNestedModalDismiss', () => {
  it('opts the overlay back into pointer events', () => {
    // The reported bug: a modal Radix dialog sets `pointer-events: none` on
    // <body>, so without this class the X never receives the click and the
    // modal cannot be dismissed at all.
    render(<Modal label="item" onClose={vi.fn()} />);
    expect(screen.getByTestId('item')).toHaveClass('pointer-events-auto');
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<Modal label="item" onClose={onClose} />);

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('stops Escape reaching the dialog behind it', () => {
    // Radix listens on document. A capture-phase listener on document runs
    // before the target, so stopPropagation there keeps the event from ever
    // bubbling back — otherwise Escape closes the DRAWER and strands the modal.
    const parentDialog = vi.fn();
    document.addEventListener('keydown', parentDialog);

    try {
      render(<Modal label="item" onClose={vi.fn()} />);
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(parentDialog).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('keydown', parentDialog);
    }
  });

  it('lets other keys through to the layer beneath', () => {
    // The media preview still needs its own arrow-key handler to fire.
    const parentDialog = vi.fn();
    document.addEventListener('keydown', parentDialog);

    try {
      render(<Modal label="item" onClose={vi.fn()} />);
      fireEvent.keyDown(document.body, { key: 'ArrowRight' });
      expect(parentDialog).toHaveBeenCalledOnce();
    } finally {
      document.removeEventListener('keydown', parentDialog);
    }
  });

  it('closes only the topmost modal when two are stacked', () => {
    const closeItem = vi.fn();
    const closePreview = vi.fn();

    render(
      <>
        <Modal label="item" onClose={closeItem} />
        <Modal label="preview" onClose={closePreview} />
      </>
    );

    fireEvent.keyDown(document.body, { key: 'Escape' });

    // Both listeners sit on document and capture listeners on the same node all
    // fire regardless of stopPropagation, so without the layer stack one
    // Escape would dismiss the preview AND the item modal underneath it.
    expect(closePreview).toHaveBeenCalledOnce();
    expect(closeItem).not.toHaveBeenCalled();
  });

  it('hands Escape back to the layer beneath once the top one unmounts', () => {
    const closeItem = vi.fn();
    const closePreview = vi.fn();

    const { rerender } = render(
      <>
        <Modal label="item" onClose={closeItem} />
        <Modal label="preview" onClose={closePreview} />
      </>
    );
    rerender(
      <>
        <Modal label="item" onClose={closeItem} />
      </>
    );

    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(closeItem).toHaveBeenCalledOnce();
    expect(closePreview).not.toHaveBeenCalled();
  });

  it('does not intercept Escape while disabled', () => {
    // A hidden modal must not swallow the key from the drawer behind it.
    const onClose = vi.fn();
    const parentDialog = vi.fn();
    document.addEventListener('keydown', parentDialog);

    try {
      render(<Modal label="item" onClose={onClose} enabled={false} />);
      fireEvent.keyDown(document.body, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
      expect(parentDialog).toHaveBeenCalledOnce();
    } finally {
      document.removeEventListener('keydown', parentDialog);
    }
  });

  it('deregisters on unmount so a closed modal never handles Escape', () => {
    const onClose = vi.fn();
    const { unmount } = render(<Modal label="item" onClose={onClose} />);

    unmount();
    fireEvent.keyDown(document.body, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });
});

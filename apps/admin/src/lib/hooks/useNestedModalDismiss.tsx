'use client';

import { useEffect, useRef } from 'react';

/**
 * Makes a plain fixed-overlay modal usable when it is opened from inside a
 * Radix dialog (the order drawer, a Sheet).
 *
 * A *modal* Radix dialog locks the page behind it: `react-remove-scroll` sets
 * `pointer-events: none` on <body> and re-enables pointer events only inside
 * the dialog's own layer, and Radix binds Escape on the document. An overlay
 * portalled to <body> therefore ends up:
 *
 *   1. un-clickable — its close button and backdrop never receive the click, so
 *      the modal cannot be dismissed at all; and
 *   2. behind a hijacked Escape — the key reaches the Sheet first and closes
 *      the DRAWER, leaving the modal stranded on screen.
 *
 * This hook fixes (2). For (1), spread `NESTED_MODAL_LAYER` onto the overlay's
 * outermost element.
 *
 * Only needed for modals opened from within a dialog; a modal opened from an
 * ordinary page is already interactive.
 */

/**
 * Currently-open nested modals, oldest first.
 *
 * These modals stack (the media preview opens from the item modal, which opens
 * from the drawer), and each mounts its own listener. Without this, one Escape
 * would dismiss every layer at once — capture listeners on the same node all
 * fire regardless of `stopPropagation`. Only the last entry acts.
 */
const openLayers: symbol[] = [];

export const useNestedModalDismiss = (
  close: () => void,
  enabled: boolean = true
) => {
  // Identity for this modal's place in the stack, stable across renders.
  const layer = useRef<symbol | null>(null);
  if (layer.current == null) layer.current = Symbol('nested-modal');

  useEffect(() => {
    if (!enabled) return;

    const id = layer.current;
    openLayers.push(id!);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // Only the topmost layer closes; the ones underneath stay put.
      if (openLayers[openLayers.length - 1] !== id) return;

      // Capture phase + stopPropagation: the event is intercepted on its way
      // down, so Radix's own document listener never runs and the Sheet behind
      // does not close too.
      event.stopPropagation();
      close();
    };

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      const index = openLayers.indexOf(id!);
      if (index >= 0) openLayers.splice(index, 1);
    };
    // `close` is memoised by both callers, so this registers once per open.
  }, [close, enabled]);
};

/**
 * Class for the overlay's outermost element. See `useNestedModalDismiss` — the
 * parent dialog sets `pointer-events: none` on <body>, so this layer has to opt
 * back in or nothing inside it is clickable.
 */
export const NESTED_MODAL_LAYER = 'pointer-events-auto';

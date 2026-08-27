'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface AnchoredPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The button that opens it. Rendered in place; the panel is not. */
  trigger: ReactNode;
  children: ReactNode;
  /** Panel width in px. Clamped to the viewport on narrow screens. */
  width?: number;
  label: string;
  /** Classes for the anchor element that wraps the trigger. */
  className?: string;
  /** Classes for the portalled panel — e.g. tighter padding for a menu. */
  panelClassName?: string;
}

const GAP = 8;
const VIEWPORT_MARGIN = 12;

/**
 * A popover panel anchored to its trigger, rendered through a portal.
 *
 * The portal is the whole point. Every table toolbar in the console sits inside
 * the DataTable card, which is `overflow-hidden` for its rounded corners — so a
 * panel positioned `absolute` inside the toolbar gets clipped by the card, and
 * anything below the fold is simply cut off with no way to reach it. The filter
 * popovers all lost their bottom halves that way.
 *
 * Portalling to the body escapes the clip; position is then computed from the
 * trigger's own rect. The panel is right-aligned to the trigger, flips above it
 * when there is more room up than down, and is clamped inside the viewport so
 * it can never hang off an edge. Its height is capped at the space actually
 * available, so it scrolls internally rather than overflowing the screen.
 */
export const AnchoredPopover = ({
  open,
  onOpenChange,
  trigger,
  children,
  width = 320,
  label,
  className,
  panelClassName,
}: AnchoredPopoverProps) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({
    // Off-screen until measured, so the first paint can't flash in the corner.
    top: -9999,
    left: -9999,
  });

  useEffect(() => setMounted(true), []);

  const reposition = useCallback(() => {
    const anchor = anchorRef.current?.getBoundingClientRect();
    if (!anchor) return;

    const panelWidth = Math.min(width, window.innerWidth - VIEWPORT_MARGIN * 2);

    const spaceBelow = window.innerHeight - anchor.bottom - GAP;
    const spaceAbove = anchor.top - GAP;
    // Flip up only when below genuinely has less room — a panel that jumps
    // above the trigger for a few pixels' difference reads as a glitch.
    const openUp = spaceBelow < 240 && spaceAbove > spaceBelow;

    const maxHeight =
      Math.max(openUp ? spaceAbove : spaceBelow, 160) - VIEWPORT_MARGIN;

    // Right-align to the trigger, then pull back inside the viewport.
    const left = Math.min(
      Math.max(anchor.right - panelWidth, VIEWPORT_MARGIN),
      window.innerWidth - panelWidth - VIEWPORT_MARGIN
    );

    const height = panelRef.current?.offsetHeight ?? 0;

    setStyle({
      position: 'fixed',
      left,
      top: openUp
        ? Math.max(
            anchor.top - GAP - Math.min(height, maxHeight),
            VIEWPORT_MARGIN
          )
        : anchor.bottom + GAP,
      width: panelWidth,
      maxHeight,
    });
  }, [width]);

  // Measure before paint so the panel never renders in the wrong place first.
  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        anchorRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      onOpenChange(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    // `true` so a scroll inside any container — the page, the table — moves the
    // panel with its trigger instead of leaving it stranded.
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, onOpenChange, reposition]);

  return (
    <div ref={anchorRef} className={className}>
      {trigger}

      {open &&
        mounted &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={label}
            style={style}
            className={cn(
              'z-[120] overflow-y-auto overscroll-contain rounded-xl border border-border bg-white p-4 shadow-xl dark:bg-card',
              panelClassName
            )}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  );
};

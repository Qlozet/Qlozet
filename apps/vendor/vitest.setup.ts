import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount anything mounted during a test so the DOM is clean for the next one.
afterEach(() => {
  cleanup();
});

// next/image runs its URLs through the Next image optimizer, so `src` in the
// DOM ends up as "/_next/image?url=…&w=…". Rendering a plain <img> keeps the
// original URL on the element, which is what the tests actually assert on.
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, priority, sizes, quality, loader, ...rest }: any) =>
    React.createElement('img', { src, alt, ...rest }),
}));

// jsdom implements neither the Pointer Capture API nor scrollIntoView, both of
// which Radix primitives (Dialog, Select, Dropdown, Popover…) call on open.
// Without these, any test that opens one dies on "hasPointerCapture is not a
// function" rather than on anything it's asserting.
Element.prototype.hasPointerCapture ??= vi.fn(() => false);
Element.prototype.setPointerCapture ??= vi.fn();
Element.prototype.releasePointerCapture ??= vi.fn();
Element.prototype.scrollIntoView ??= vi.fn();

// jsdom has no ResizeObserver, and Recharts' ResponsiveContainer plus a few
// Radix primitives measure themselves with it on mount. A no-op is enough:
// nothing resizes in a test.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// next-themes and the responsive hooks read matchMedia on mount.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})) as unknown as typeof window.matchMedia;

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@ebay/nice-modal-react', () => ({
  default: {
    show: vi.fn(),
    create: (Component: unknown) => Component,
  },
  useModal: () => ({ visible: false, hide: vi.fn(), remove: vi.fn() }),
}));

import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarNav } from '../sidebar';

// The nav uses tooltips to name the collapsed rail's icons; the app supplies
// the provider from the dashboard layout.
const renderNav = (props: Parameters<typeof SidebarNav>[0] = {}) =>
  render(
    <TooltipProvider>
      <SidebarNav {...props} />
    </TooltipProvider>
  );

describe('SidebarNav', () => {
  // The rail collapses to icons below 2xl and relies on tooltips for naming.
  // Inside the mobile drawer there is room, so labels must not be width-gated.
  it('always shows labels in drawer mode', () => {
    renderNav({ expanded: true });
    const label = screen.getByText('Vendors');
    expect(label.className).toContain('inline-block');
    expect(label.className).not.toContain('hidden');
  });

  it('keeps labels width-gated on the desktop rail', () => {
    renderNav();
    expect(screen.getByText('Vendors').className).toContain('2xl:inline-block');
  });

  // The drawer has to close itself once a destination is chosen, or the user
  // lands on the new page with the nav still covering it.
  it('reports navigation so the drawer can close', async () => {
    const onNavigate = vi.fn();
    renderNav({ expanded: true, onNavigate });

    await userEvent.click(screen.getByRole('link', { name: /vendors/i }));
    expect(onNavigate).toHaveBeenCalled();
  });

  // Unbuilt sections open the work-in-progress modal; that is a destination
  // too, so the drawer must not stay open behind it.
  it('reports navigation for work-in-progress items too', async () => {
    const onNavigate = vi.fn();
    renderNav({ expanded: true, onNavigate });

    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(onNavigate).toHaveBeenCalled();
  });
});

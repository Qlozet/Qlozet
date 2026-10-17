import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const pathname = vi.fn(() => '/vendors');
const consoleAccess = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => pathname(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('@/lib/hooks/use-console-access', () => ({
  useConsoleAccess: () => consoleAccess(),
}));
vi.mock('../forced-password-change', () => ({
  ForcedPasswordChange: () => <div>forced password change</div>,
}));

import { AccessGate } from '../access-gate';
import { canView } from '@/lib/access';

const withAccess = (access: unknown) =>
  consoleAccess.mockReturnValue({
    access,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    can: () => true,
    canView: (r: never) => canView(access as never, r),
  });

const support = {
  type: 'platform',
  status: 'active',
  role: { _id: 'r1', name: 'customer_support', description: null },
  is_super_admin: false,
  full_access: false,
  permissions: ['customers.view', 'tickets.view'],
  must_change_password: false,
};

beforeEach(() => {
  pathname.mockReturnValue('/vendors');
  consoleAccess.mockReset();
});

describe('AccessGate', () => {
  it('renders the page while access is still unknown', () => {
    withAccess(undefined);
    render(
      <AccessGate>
        <p>the page</p>
      </AccessGate>
    );
    expect(screen.getByText('the page')).toBeInTheDocument();
  });

  it('replaces a page the role cannot view with a plain refusal', () => {
    withAccess(support);
    render(
      <AccessGate>
        <p>the page</p>
      </AccessGate>
    );
    expect(screen.queryByText('the page')).toBeNull();
    expect(
      screen.getByText('You do not have access to Vendors')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your role, Customer support,/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to dashboard' })
    ).toHaveAttribute('href', '/dashboard');
  });

  it('renders a page the role may view', () => {
    pathname.mockReturnValue('/customers/abc');
    withAccess(support);
    render(
      <AccessGate>
        <p>the page</p>
      </AccessGate>
    );
    expect(screen.getByText('the page')).toBeInTheDocument();
  });

  it('a full-access role sees everything', () => {
    withAccess({ ...support, full_access: true, permissions: [] });
    render(
      <AccessGate>
        <p>the page</p>
      </AccessGate>
    );
    expect(screen.getByText('the page')).toBeInTheDocument();
  });

  it('a temporary password blocks every page until it is changed', () => {
    pathname.mockReturnValue('/customers');
    withAccess({ ...support, must_change_password: true });
    render(
      <AccessGate>
        <p>the page</p>
      </AccessGate>
    );
    expect(screen.queryByText('the page')).toBeNull();
    expect(screen.getByText('forced password change')).toBeInTheDocument();
  });
});

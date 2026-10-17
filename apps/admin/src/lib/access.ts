// What the signed-in staff account may do in the console, read from
// GET /users/me/access. The server enforces the same grid on every request;
// this only decides what to show, so nobody is offered a screen that will
// refuse them.

import type { MyAccess } from '@/redux/services/users/users.api-slice';

/** The rows of the Edit Access grid, as the backend names them. */
export type ConsoleResource =
  | 'dashboard'
  | 'vendors'
  | 'customers'
  | 'orders'
  | 'products'
  | 'tickets'
  | 'payments'
  | 'marketing'
  | 'blogs'
  | 'admin-management'
  | 'performance'
  | 'announcements'
  | 'notifications'
  | 'live-chat'
  | 'settings';

export type ConsoleAction = 'view' | 'create' | 'edit' | 'delete';

export const RESOURCE_LABELS: Record<ConsoleResource, string> = {
  dashboard: 'Dashboard',
  vendors: 'Vendors',
  customers: 'Customers',
  orders: 'Orders',
  products: 'Products',
  tickets: 'Tickets & Complaints',
  payments: 'Payments & Payouts',
  marketing: 'Marketing',
  blogs: 'Blogs / Static Pages',
  'admin-management': 'Admin Management',
  performance: 'Performance Analytics',
  announcements: 'Announcements',
  notifications: 'Notifications',
  'live-chat': 'Live chat Logs',
  settings: 'Settings',
};

/**
 * Which grid row a console page belongs to. First match on the path prefix
 * wins. A page with no row (the notification inbox) is open to every staff
 * account.
 */
const ROUTE_RESOURCES: [prefix: string, resource: ConsoleResource][] = [
  ['/dashboard', 'dashboard'],
  ['/vendors', 'vendors'],
  ['/customers', 'customers'],
  ['/products', 'products'],
  ['/product-details', 'products'],
  ['/orders', 'orders'],
  ['/disputes', 'orders'],
  ['/admin', 'admin-management'],
  ['/support', 'tickets'],
  ['/help-center', 'blogs'],
  ['/wallet', 'payments'],
  ['/payment', 'payments'],
  ['/marketing', 'marketing'],
  ['/performance', 'performance'],
  ['/settings', 'settings'],
];

export const resourceForPath = (pathname: string): ConsoleResource | null => {
  const path = (pathname || '').split('?')[0];
  for (const [prefix, resource] of ROUTE_RESOURCES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return resource;
  }
  return null;
};

export const permissionName = (
  resource: ConsoleResource,
  action: ConsoleAction
): string => `${resource}.${action}`;

/**
 * Whether the account may do this. Unknown access (still loading, or the
 * read failed) answers yes: hiding the whole console on a flaky request is
 * worse than showing a page the server will refuse, and the server does
 * refuse it.
 */
export const can = (
  access: MyAccess | null | undefined,
  resource: ConsoleResource,
  action: ConsoleAction
): boolean => {
  if (!access) return true;
  if (access.full_access) return true;
  return (access.permissions ?? []).includes(permissionName(resource, action));
};

export const canView = (
  access: MyAccess | null | undefined,
  resource: ConsoleResource | null
): boolean => (resource ? can(access, resource, 'view') : true);

/** `super_admin` → `Super admin`. */
export const formatAccessRole = (access?: MyAccess | null): string | null => {
  const raw = access?.role?.name?.replace(/[_-]+/g, ' ').trim();
  if (!raw) return null;
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

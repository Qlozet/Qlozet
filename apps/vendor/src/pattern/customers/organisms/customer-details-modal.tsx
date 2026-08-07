'use client';

// Customer Details Modal - Organism
// A clean, floating customer overview: profile header (avatar, name, status,
// contact), a Measurement action, and a compact, paginated order-history table
// (a handful of orders at a time). Resolves the customer from
// GET /business/customers by id (no single-customer endpoint exists).

import React, { useCallback, useMemo, useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import NiceModal from '@ebay/nice-modal-react';
import { useRouter } from 'next/navigation';
import {
  Ruler,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useGetVendorCustomersQuery,
  type CustomerOrderPreview,
  type VendorCustomer,
} from '@/redux/services/customers/customers.api-slice';
import {
  getCustomerIdentifier,
  getCustomerName,
  getCustomerStatus,
  formatCount,
  type CustomerStatusVariant,
} from '@/lib/customers';
import { APP_ROUTES } from '@/lib/routes';
import { CustomerMeasurementsModal } from '../details/organisms/customer-measurements-modal';
import { CustomerAvatar } from '../atoms/customer-avatar';

const STATUS_BADGE_VARIANT: Record<
  CustomerStatusVariant,
  'success' | 'error' | 'warning'
> = {
  active: 'success',
  inactive: 'error',
  suspended: 'warning',
};

const ORDERS_PER_PAGE = 5;

/* ------------------------------------------------------------------ */
/*  Formatters + order status badge                                    */
/* ------------------------------------------------------------------ */

const formatNaira = (value?: number): string =>
  typeof value === 'number' && !Number.isNaN(value)
    ? `₦${value.toLocaleString()}`
    : '—';

const formatDate = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
};

const shortRef = (ref?: string): string =>
  ref ? `#${ref.slice(-6).toUpperCase()}` : '—';

const orderStatusBadge = (
  status?: string
): { label: string; className: string } => {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-[#FEF6E7] text-[#DD900D]' },
    in_review: { label: 'In Review', className: 'bg-[#E7F0FA] text-[#3387CC]' },
    processing: {
      label: 'Processing',
      className: 'bg-[#F4EBFF] text-[#7E22CE]',
    },
    in_transit: {
      label: 'In Transit',
      className: 'bg-[#EAECF0] text-[#475467]',
    },
    shipped: { label: 'Shipped', className: 'bg-[#E7F0FA] text-[#3387CC]' },
    delivered: { label: 'Delivered', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    completed: { label: 'Completed', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    cancelled: { label: 'Cancelled', className: 'bg-[#FBEAE9] text-[#D42620]' },
    refunded: { label: 'Refunded', className: 'bg-[#FEECEB] text-[#D42620]' },
    returned: { label: 'Returned', className: 'bg-[#FEECEB] text-[#D42620]' },
  };
  return (
    map[status ?? ''] ?? {
      label: status
        ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
        : '—',
      className: 'bg-[#EAECF0] text-[#475467]',
    }
  );
};

/* ------------------------------------------------------------------ */
/*  Contact chip                                                       */
/* ------------------------------------------------------------------ */

const ContactChip = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300">
    {icon}
    <span className="truncate">{children}</span>
  </span>
);

/* ------------------------------------------------------------------ */
/*  Order history table (paginated, a few at a time)                   */
/* ------------------------------------------------------------------ */

const OrderHistoryTable = ({
  orders,
  loading,
  onView,
}: {
  orders: CustomerOrderPreview[];
  loading: boolean;
  onView: (o: CustomerOrderPreview) => void;
}) => {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));
  const current = Math.min(page, pageCount - 1);
  const start = current * ORDERS_PER_PAGE;
  const slice = orders.slice(start, start + ORDERS_PER_PAGE);

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] dark:border-border px-6 py-10 text-center">
        <ShoppingBag className="size-7 text-gray-300" />
        <p className="text-sm font-medium text-[#333] dark:text-white">
          No orders yet
        </p>
        <p className="text-xs text-grey3 dark:text-gray-400">
          This customer hasn&apos;t placed any orders.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#EEF0F2] dark:border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left">
          <thead>
            <tr className="bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] text-[11px] uppercase tracking-wider text-grey3 dark:text-gray-400">
              <th className="px-4 py-2.5 font-semibold">Order ID</th>
              <th className="px-4 py-2.5 font-semibold">Date</th>
              <th className="px-4 py-2.5 font-semibold">Amount</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3F5] dark:divide-border">
            {slice.map((o) => {
              const badge = orderStatusBadge(o.status);
              return (
                <tr
                  key={o._id}
                  className="hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-[#333] dark:text-white">
                    {shortRef(o.reference)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {formatNaira(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
                        badge.className
                      )}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onView(o)}
                      className="text-xs"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination footer — only when there's more than one page */}
      {orders.length > ORDERS_PER_PAGE && (
        <div className="flex items-center justify-end gap-4 border-t border-[#EEF0F2] dark:border-border px-4 py-2.5">
          <span className="text-xs text-grey3 dark:text-gray-400">
            Showing {start + 1}–
            {Math.min(start + ORDERS_PER_PAGE, orders.length)} of{' '}
            {orders.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current === 0}
              aria-label="Previous page"
              className="flex size-7 items-center justify-center rounded-md border border-[#E5E7EB] dark:border-border text-gray-500 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-1 text-xs font-medium text-gray-600 dark:text-gray-300">
              {current + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current >= pageCount - 1}
              aria-label="Next page"
              className="flex size-7 items-center justify-center rounded-md border border-[#E5E7EB] dark:border-border text-gray-500 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */

interface CustomerDetailsModalProps {
  customerId: string;
}

export const CustomerDetailsModal = create<CustomerDetailsModalProps>(
  ({ customerId }) => {
    const { visible, resolve, hide, remove } = useModal();
    const router = useRouter();

    const { data, isLoading, isFetching } = useGetVendorCustomersQuery(
      { page: 1, limit: 200, orders_limit: 50 },
      { skip: !customerId || !visible }
    );

    const customer = useMemo((): VendorCustomer | undefined => {
      if (!data) return undefined;
      let list: VendorCustomer[] = [];
      if (Array.isArray(data)) {
        list = data as unknown as VendorCustomer[];
      } else if (Array.isArray(data.data)) {
        list = data.data;
      } else if (data.data && Array.isArray((data.data as any).data)) {
        list = (data.data as any).data;
      }
      return list.find((c) => c._id === customerId);
    }, [data, customerId]);

    const orders = useMemo(() => customer?.orders ?? [], [customer]);
    const loading = isLoading || isFetching;

    const handleClose = (open?: boolean | React.MouseEvent) => {
      if (typeof open !== 'boolean' || !open) {
        resolve({ resolved: true });
        hide();
        setTimeout(() => remove(), 300);
      }
    };

    const openMeasurements = () => {
      if (!customer) return;
      NiceModal.show(CustomerMeasurementsModal, {
        customer,
        measurementSet: customer.default_measurement ?? undefined,
      });
    };

    const handleViewOrder = useCallback(
      (order: CustomerOrderPreview) => {
        resolve({ resolved: true });
        hide();
        setTimeout(() => remove(), 300);
        router.push(APP_ROUTES.orders);
        toast.info(
          `Navigated to orders — look for ${shortRef(order.reference)}`
        );
      },
      [resolve, hide, remove, router]
    );

    return (
      <Dialog open={visible} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl p-0 gap-0 bg-white dark:bg-card">
          {/* text-left: DialogHeader centres its title below `sm` by default */}
          <DialogHeader className="border-b border-border px-6 py-4 text-left">
            <DialogTitle className="text-base font-semibold text-[#0C0C0D] dark:text-white">
              Customer details
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[75vh] space-y-6 overflow-y-auto px-6 py-5">
            {/* Profile header */}
            {loading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-7 w-56 rounded-lg" />
                </div>
              </div>
            ) : customer ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <CustomerAvatar customer={customer} size="lg" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-[#0C0C0D] dark:text-white">
                        {getCustomerName(customer)}
                      </h3>
                      <Badge
                        variant={
                          STATUS_BADGE_VARIANT[
                            getCustomerStatus(customer).variant
                          ]
                        }
                        shape="square"
                        className="h-[22px] px-2 text-[11px] font-normal"
                      >
                        {getCustomerStatus(customer).label}
                      </Badge>
                    </div>
                    <p className="text-sm text-grey3 dark:text-gray-400">
                      @{getCustomerIdentifier(customer)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {customer.email && (
                        <ContactChip
                          icon={
                            <Mail className="size-3 shrink-0 text-gray-400" />
                          }
                        >
                          {customer.email}
                        </ContactChip>
                      )}
                      {customer.phone_number && (
                        <ContactChip
                          icon={
                            <Phone className="size-3 shrink-0 text-gray-400" />
                          }
                        >
                          {customer.phone_number}
                        </ContactChip>
                      )}
                      <ContactChip
                        icon={
                          <ShoppingBag className="size-3 shrink-0 text-gray-400" />
                        }
                      >
                        {formatCount(customer.total_orders)} orders
                      </ContactChip>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={openMeasurements}
                  className="shrink-0 gap-2"
                >
                  <Ruler className="size-4" />
                  Measurement
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Customer not found.
              </p>
            )}

            {/* Order history */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0C0C0D] dark:text-white">
                  Order history
                </h3>
                {orders.length > 0 && (
                  <span className="text-xs text-grey3 dark:text-gray-400">
                    {orders.length} total
                  </span>
                )}
              </div>
              <OrderHistoryTable
                orders={orders}
                loading={loading}
                onView={handleViewOrder}
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="min-w-[7rem]"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

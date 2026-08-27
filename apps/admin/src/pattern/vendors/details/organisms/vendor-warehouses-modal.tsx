'use client';

import { create, useModal } from '@ebay/nice-modal-react';
import { X } from 'lucide-react';
import {
  NESTED_MODAL_LAYER,
  useNestedModalDismiss,
} from '@/lib/hooks/useNestedModalDismiss';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetVendorWarehousesQuery,
  type VendorWarehouse,
} from '@/redux/services/vendor-details/vendor-details.api-slice';

interface VendorWarehousesModalProps {
  businessId: string;
}

const COLUMNS: { header: string; read: (w: VendorWarehouse) => string }[] = [
  { header: 'Warehouse name', read: (w) => w.name ?? '' },
  { header: 'Warehouse address', read: (w) => w.address ?? '' },
  { header: 'Contact name', read: (w) => w.contact_name ?? '' },
  { header: 'Phone number', read: (w) => w.contact_phone ?? '' },
  { header: 'Email', read: (w) => w.contact_email ?? '' },
];

/**
 * A vendor's warehouses, from GET /admin/businesses/:id/warehouses.
 *
 * The info grid could previously only show a COUNT: the warehouse list endpoint
 * is scoped to the caller's own business, so there was nothing an admin could
 * open. The admin route takes the id in the path.
 */
export const VendorWarehousesModal = create<VendorWarehousesModalProps>(
  ({ businessId }) => {
    const modal = useModal();
    const close = () => modal.remove();
    useNestedModalDismiss(close, modal.visible);

    const { data, isLoading, isError, error } = useGetVendorWarehousesQuery(
      { businessId, page: 1, size: 50 },
      { skip: !businessId }
    );

    if (!modal.visible) return null;

    const warehouses = data?.data?.data ?? [];

    return (
      <div
        className={`fixed inset-0 z-[110] flex items-center justify-center p-4 ${NESTED_MODAL_LAYER}`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Warehouses"
          className="relative z-10 flex max-h-[85vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-card p-6 shadow-2xl max-lg:p-4"
        >
          <div className="flex shrink-0 items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground max-lg:text-lg">
              Warehouses
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : isError ? (
              <p className="py-10 text-center text-sm text-destructive">
                {(error as { data?: { message?: string } })?.data?.message ??
                  "Couldn't load warehouses."}
              </p>
            ) : warehouses.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                This vendor has no warehouses.
              </p>
            ) : (
              // Five columns will not fit a phone; the table scrolls sideways
              // inside its own border rather than stretching the dialog.
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="bg-muted/50">
                      {COLUMNS.map((column) => (
                        <th
                          key={column.header}
                          scope="col"
                          className="whitespace-nowrap px-5 py-4 text-sm font-medium text-foreground"
                        >
                          {column.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {warehouses.map((warehouse) => (
                      <tr
                        key={warehouse._id}
                        className="border-t border-border"
                      >
                        {COLUMNS.map((column) => {
                          const value = column.read(warehouse);
                          return (
                            <td
                              key={column.header}
                              className="px-5 py-4 text-sm text-muted-foreground"
                            >
                              {value || '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 flex shrink-0 justify-end">
            <Button type="button" onClick={close} className="min-w-[160px]">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

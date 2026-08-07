'use client';

import Image from 'next/image';
import NiceModal from '@ebay/nice-modal-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetVendorQuotesQuery } from '@/redux/services/bespoke/bespoke.api-slice';
import { OrderQuoteDrawer } from '@/pattern/orders/organisms/order-quote-drawer';

// Quote-request status → pill styling.
const statusPill = (status: string): { label: string; className: string } => {
  const s = (status || '').toLowerCase();
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'New request', className: 'bg-[#FEF6E7] text-[#DD900D] dark:bg-[#DD900D]/10 dark:text-[#FBBF24]' },
    draft: { label: 'Draft', className: 'bg-[#EAECF0] text-[#475467] dark:bg-gray-800 dark:text-gray-300' },
    submitted: { label: 'Quoted', className: 'bg-[#E7F6EC] text-[#0F973D] dark:bg-[#0F973D]/10 dark:text-[#4ADE80]' },
    revision_requested: { label: 'Revision', className: 'bg-[#F4EBFF] text-[#7E22CE] dark:bg-[#7E22CE]/10 dark:text-[#C084FC]' },
    accepted: { label: 'Accepted', className: 'bg-[#E3EFFC] text-[#1671D9] dark:bg-[#1671D9]/10 dark:text-[#60A5FA]' },
    declined: { label: 'Declined', className: 'bg-[#FBEAE9] text-[#D42620] dark:bg-[#D42620]/10 dark:text-[#F87171]' },
  };
  return map[s] ?? { label: status || '—', className: 'bg-[#EAECF0] text-[#475467] dark:bg-gray-800 dark:text-gray-300' };
};

const naira = (n?: number) =>
  typeof n === 'number' ? `₦${n.toLocaleString()}` : '—';

export const QuoteRequestsTemplate = () => {
  const { data, isLoading } = useGetVendorQuotesQuery();

  // Response is paginated: data.data may be the paging object OR the array.
  const raw: any = data?.data;
  const quotes: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);

  const open = (quote: any) => {
    // Reuse the existing quote-builder drawer — it derives the quote id from
    // `bespoke_quote`. Pass the design so it has context.
    NiceModal.show(OrderQuoteDrawer, {
      order: {
        _id: quote._id,
        bespoke_quote: quote._id,
        bespoke_quote_status: quote.status,
        type: 'bespoke',
        bespoke_design: quote.design,
        customer: quote.customer,
      } as any,
    });
  };

  return (
    <div className='w-full'>
      <div className='mb-5'>
        <h1 className='text-xl font-semibold text-foreground'>Quote Requests</h1>
        <p className='text-sm text-muted-foreground'>
          Custom design requests from customers. Open one to send your quote.
        </p>
      </div>

      {isLoading ? (
        <div className='flex flex-wrap gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-64 w-full rounded-2xl sm:w-[220px]' />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-border bg-card py-16 text-center'>
          <p className='text-sm font-medium text-foreground'>No quote requests yet</p>
          <p className='mt-1 text-xs text-muted-foreground'>
            When a customer requests a quote for a custom design, it shows up here.
          </p>
        </div>
      ) : (
        <div className='flex flex-wrap gap-4'>
          {quotes.map((q) => {
            const design = q.design ?? {};
            const img = design.design_images?.[0];
            const pill = statusPill(q.status);
            const customerName = q.customer
              ? `${q.customer.first_name ?? ''} ${q.customer.last_name ?? ''}`.trim() ||
                q.customer.email
              : 'Customer';
            const total =
              typeof q.total === 'number' && q.total > 0
                ? q.total
                : (q.line_items ?? []).reduce(
                    (s: number, li: any) => s + (li.amount || 0),
                    0,
                  );
            return (
              <button
                key={q._id}
                onClick={() => open(q)}
                className='flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-md sm:w-[220px]'
              >
                <div className='relative h-40 w-full bg-muted'>
                  {img ? (
                    <Image
                      src={img}
                      alt={design.name ?? 'Design'}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
                      No image
                    </div>
                  )}
                  <span
                    className={cn(
                      'absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase',
                      pill.className,
                    )}
                  >
                    {pill.label}
                  </span>
                </div>
                <div className='flex flex-1 flex-col gap-1 p-4'>
                  <p className='truncate text-sm font-semibold text-foreground'>
                    {design.name ?? 'Custom design'}
                  </p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {customerName}
                    {design.category ? ` · ${design.category}` : ''}
                    {design.gender ? ` · ${design.gender}` : ''}
                  </p>
                  <div className='mt-auto flex items-center justify-between pt-2'>
                    <span className='text-xs text-muted-foreground'>
                      {q.status === 'submitted' ? 'Your quote' : 'Tap to quote'}
                    </span>
                    <span className='text-sm font-semibold text-foreground'>
                      {total > 0 ? naira(total) : ''}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

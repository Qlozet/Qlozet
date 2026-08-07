'use client';

import { CheckCircleIcon, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetTicketQuery,
  type Ticket as TicketType,
} from '@/redux/services/tickets/tickets.api-slice';
import {
  formatDateTime,
  issueTypeLabel,
  readField,
  statusLabel,
  statusVariant,
} from '../lib/ticket-fields';

interface SupportSuccessProps {
  // The ticket returned by POST /tickets (null if the response carried no body).
  ticket: TicketType | null;
  onSubmitAnother: () => void;
  onViewTickets: () => void;
}

const withHash = (value: string): string =>
  value.startsWith('#') ? value : `#${value}`;

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) =>
  value === null ? null : (
    <div className='flex items-center justify-between gap-4 text-left'>
      <span className='text-xs text-grey3'>{label}</span>
      <span className='text-xs font-medium text-grey-black'>{value}</span>
    </div>
  );

// Shown after the Get-support form is submitted: confirms the created ticket
// and routes to a new request or the vendor's ticket list. Every value here
// comes from the API — fields the backend doesn't return are omitted rather
// than filled in.
export const SupportSuccess = ({
  ticket,
  onSubmitAnother,
  onViewTickets,
}: SupportSuccessProps) => {
  const id = ticket?._id ?? '';

  // POST /tickets has no documented response schema, so re-read the created
  // ticket from the documented GET /tickets/{id} and fall back to the POST
  // payload if that read fails.
  const { data, isLoading, isFetching } = useGetTicketQuery(id, { skip: !id });
  const detail = data?.data ?? ticket;
  const loading = Boolean(id) && (isLoading || isFetching);

  const rawRef = detail ? readField(detail, 'reference', 'ticket_id') : '—';
  const reference =
    rawRef !== '—' ? withHash(rawRef) : id ? withHash(id) : '';

  const rawIssue = detail ? readField(detail, 'issue_type', 'category') : '—';
  const issue = rawIssue === '—' ? null : issueTypeLabel(rawIssue);

  const submitted = detail?.createdAt ? formatDateTime(detail.createdAt) : null;

  const status =
    typeof detail?.status === 'string' && detail.status.trim()
      ? detail.status
      : null;

  return (
    <div className='mx-auto mt-6 w-full max-w-137 rounded-2xl bg-white p-8 text-center shadow-sm'>
      <div className='flex justify-center'>
        <span className='flex size-16 items-center justify-center rounded-full border-success text-success'>
          <CheckCircleIcon className='size-15' strokeWidth={1.5} color='#056921' />
        </span>
      </div>

      <h2 className='mt-5 text-lg font-semibold text-grey-black'>
        Support Ticket Submitted
      </h2>
      <p className='mt-2 text-sm text-grey3'>
        {reference
          ? `Your support ticket has been received and has been assigned ticket ${reference}`
          : 'Your support ticket has been received.'}
      </p>

      <div className='bg-[#F8F8F8F8] px-4 py-5 mt-6 rounded-xl'>
        {loading ? (
          <div className='space-y-3'>
            <Skeleton className='mx-auto h-5 w-44' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        ) : (
          <>
            <div className='flex max-md:flex-col md:flex-row items-center justify-center gap-2'>
              {reference && (
                <div className='flex max-md:flex-col md:flex-row items-center justify-center gap-2 text-sm text-grey-black text-wrap'>
                  <Ticket className='size-6' />
                    <p className="font-semibold">
                    Ticket ID: <span className="font-medium">{reference}</span>
                    </p>
                </div>
              )}
              {status && (
                <Badge
                  variant={statusVariant(status)}
                  shape='square'
                  className='flex h-[26px] w-fit items-center px-3 text-xs font-normal'
                >
                  {statusLabel(status)}
                </Badge>
              )}
            </div>

            {(issue || submitted) && (
              <div className='mt-4 space-y-3 border-t border-black/5 pt-4'>
                <DetailRow label='Issue type' value={issue} />
                <DetailRow label='Submitted' value={submitted} />
              </div>
            )}

            {reference && (
              <p className='mx-auto mt-5 max-w-85 text-xs text-grey3'>
                You can reference this ID in any follow up conversation
              </p>
            )}
          </>
        )}
      </div>

      <div className='mt-6 space-y-3'>
        <Button type='button' onClick={onSubmitAnother} className='w-full'>
          Submit Another Request
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={onViewTickets}
          className='w-full'
        >
          View My Tickets
        </Button>
      </div>
    </div>
  );
};

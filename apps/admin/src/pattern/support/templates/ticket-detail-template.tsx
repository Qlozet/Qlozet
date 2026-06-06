'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { GoBackButton } from '@/pattern/admin/atoms/go-back-button';
import {
  useGetTicketsQuery,
  useReplyToTicketMutation,
} from '@/redux/services/tickets/tickets.api-slice';
import { readField } from '../lib/ticket-fields';
import { USE_SUPPORT_MOCKS, MOCK_TICKETS } from '../lib/mock-data';
import { TicketDetailCard } from '../details/organisms/ticket-detail-card';
import { TicketInformationCard } from '../details/organisms/ticket-information-card';
import { TicketActivities } from '../details/organisms/ticket-activities';

export const TicketDetailTemplate = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  // No admin single-ticket endpoint, so resolve from the (cached) list by id —
  // matching the customer-details precedent. A large page covers deep-links.
  const { data, isLoading, isFetching } = useGetTicketsQuery({
    page: 1,
    size: 200,
  });
  const ticket = useMemo(
    () =>
      (USE_SUPPORT_MOCKS ? MOCK_TICKETS : data?.data?.data ?? []).find(
        (t) => t._id === id
      ),
    [data, id]
  );

  const [reply, { isLoading: isSending }] = useReplyToTicketMutation();

  const handleSendReply = async (message: string): Promise<boolean> => {
    try {
      await reply({ ticket_id: id, message }).unwrap();
      toast.success('Reply sent');
      return true;
    } catch {
      toast.error('Could not send reply. Please try again.');
      return false;
    }
  };

  const handleCopyId = () => {
    const ref = ticket
      ? readField(ticket, 'reference', 'ticket_id', '_id')
      : '';
    if (ref && ref !== '—' && navigator.clipboard) {
      navigator.clipboard.writeText(ref);
      toast.success('Ticket ID copied');
    }
  };

  // No endpoints for these yet — surface the shared WIP modal-style toast.
  const comingSoon = () => toast.info('This action is coming soon');

  const loading = USE_SUPPORT_MOCKS ? false : isLoading || isFetching;

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-12">
      <GoBackButton href={APP_ROUTES.support} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TicketDetailCard
            ticket={ticket}
            isLoading={loading}
            isSending={isSending}
            onSendReply={handleSendReply}
            onCopyId={handleCopyId}
            onFlag={comingSoon}
          />
        </div>

        <div className="lg:col-span-1">
          <TicketInformationCard
            ticket={ticket}
            isLoading={loading}
            onReassign={comingSoon}
            onEdit={comingSoon}
            onResolve={comingSoon}
          />
        </div>
      </div>

      <TicketActivities />
    </div>
  );
};

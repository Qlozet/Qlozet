'use client';

import { useParams } from 'next/navigation';
import NiceModal from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { GoBackButton } from '@/pattern/common/atoms/go-back-button';
import { useGetTicketQuery } from '@/redux/services/tickets/tickets.api-slice';
import { readField } from '../lib/ticket-fields';
import { TicketDetailCard } from '../details/organisms/ticket-detail-card';
import { TicketInformationCard } from '../details/organisms/ticket-information-card';
import { TicketActivities } from '../details/organisms/ticket-activities';
import { AddTicketModal } from '../organisms/add-ticket-modal';

export const TicketDetailTemplate = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const { data, isLoading, isFetching } = useGetTicketQuery(id, { skip: !id });
  const ticket = data?.data;

  // No vendor reply/resolve/assign endpoint exists (verified against Swagger —
  // reply is admin-only, PATCH /tickets/{id} only edits issue_type/description).
  const handleSendReply = async (): Promise<boolean> => {
    toast.info('Replying to tickets is coming soon.');
    return false;
  };

  const handleEdit = () => {
    if (ticket) NiceModal.show(AddTicketModal, { ticket });
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

  // No endpoints for these yet — honest "coming soon" toast.
  const comingSoon = () => toast.info('This action is coming soon.');

  const loading = isLoading || isFetching;

  return (
    <div className='w-full min-h-screen h-fit space-y-6 p-4 pb-12'>
      <GoBackButton href={APP_ROUTES.support} />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <TicketDetailCard
            ticket={ticket}
            isLoading={loading}
            onSendReply={handleSendReply}
            onCopyId={handleCopyId}
            onFlag={comingSoon}
          />
        </div>

        <div className='lg:col-span-1'>
          <TicketInformationCard
            ticket={ticket}
            isLoading={loading}
            onReassign={comingSoon}
            onEdit={handleEdit}
            onResolve={comingSoon}
          />
        </div>
      </div>

      <TicketActivities />
    </div>
  );
};

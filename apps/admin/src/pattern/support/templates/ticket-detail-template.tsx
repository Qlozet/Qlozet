'use client';

import { useParams } from 'next/navigation';
import NiceModal from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { GoBackButton } from '@/pattern/admin/atoms/go-back-button';
import {
  populatedReplies,
  useGetTicketByIdQuery,
  useGetTicketsQuery,
  useReplyToTicketMutation,
} from '@/redux/services/tickets/tickets.api-slice';
import { useBusinessNames } from '../lib/use-business-names';
import { ReassignTicketModal } from '../organisms/reassign-ticket-modal';
import { EditTicketDrawer } from '../organisms/edit-ticket-drawer';
import { TicketDetailCard } from '../details/organisms/ticket-detail-card';
import { TicketInformationCard } from '../details/organisms/ticket-information-card';
import { TicketActivities } from '../details/organisms/ticket-activities';

export const TicketDetailTemplate = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const {
    data,
    isLoading,
    isFetching,
    isError: byIdFailed,
    error,
  } = useGetTicketByIdQuery(id, { skip: !id });

  // The admin list is queried unconditionally, for two reasons:
  //  1. GET /tickets/{id} isn't under the /admin prefix, so it may be scoped to
  //     the requesting user — the list is the fallback when it rejects.
  //  2. More importantly, /tickets/{id} returns `replies` as an array of *ids*
  //     while the list returns them fully populated. The list is currently the
  //     only source of reply bodies, so the conversation has to come from it.
  const {
    data: listData,
    isFetching: isFetchingList,
    isError: listFailed,
  } = useGetTicketsQuery({ page: 1, size: 200 }, { skip: !id });

  const listTicket = (listData?.data?.data ?? []).find((row) => row._id === id);
  const ticket = data?.data ?? listTicket;

  const replies = populatedReplies(listTicket);

  // The ticket claims replies exist but none came back with a body.
  const repliesUnresolved =
    (ticket?.replies?.length ?? 0) > 0 && replies.length === 0;

  const { businessName } = useBusinessNames();
  const vendorName = businessName(ticket?.business);

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

  const handleCopyId = async () => {
    // Copies the full ObjectId — the UI only ever shows its tail.
    const ref = ticket?._id;
    if (!ref) return;
    try {
      await navigator.clipboard.writeText(ref);
      toast.success('Ticket ID copied');
    } catch {
      toast.error('Could not copy the ticket ID.');
    }
  };

  const handleReassign = () =>
    NiceModal.show(ReassignTicketModal, {
      ticketId: id,
      currentAssigneeId: ticket?.assigned_to ?? undefined,
    });

  const handleEdit = () =>
    NiceModal.show(EditTicketDrawer, {
      ticketId: id,
      issueType: ticket?.issue_type ?? '',
      description: ticket?.description ?? '',
    });

  const loading = isLoading || isFetching || isFetchingList;

  // Only a genuine dead end once both the direct fetch and the fallback fail.
  const isError = byIdFailed && listFailed;

  const errorMessage =
    (error as { data?: { message?: string } })?.data?.message ??
    'We could not load this ticket.';

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-12">
      <GoBackButton href={APP_ROUTES.support} />

      {isError ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-1 rounded-2xl bg-white p-6 text-center custom-card-shadow">
          <p className="text-base font-medium text-destructive">
            Error loading ticket
          </p>
          <p className="text-sm text-grey3">{errorMessage}</p>
        </div>
      ) : !loading && !ticket ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-1 rounded-2xl bg-white p-6 text-center custom-card-shadow">
          <p className="text-base font-medium text-grey-black">
            Ticket not found
          </p>
          <p className="text-sm text-grey3">
            This ticket may have been removed, or the link is out of date.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TicketDetailCard
                ticket={ticket}
                vendorName={vendorName}
                replies={replies}
                repliesUnresolved={repliesUnresolved}
                isLoading={loading}
                isSending={isSending}
                onSendReply={handleSendReply}
                onCopyId={handleCopyId}
              />
            </div>

            <div className="lg:col-span-1">
              <TicketInformationCard
                ticket={ticket}
                vendorName={vendorName}
                isLoading={loading}
                onReassign={handleReassign}
                onEdit={handleEdit}
              />
            </div>
          </div>

          <TicketActivities />
        </>
      )}
    </div>
  );
};

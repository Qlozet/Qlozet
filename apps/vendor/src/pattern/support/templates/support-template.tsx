// Support Template
// Vendor Support flow: a "Get support" form → success confirmation → the
// vendor's ticket list ("My Tickets"). Ticket details open at /support/[id].

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { type SupportData } from '@/lib/validations/support';
import { useCreateTicketMutation } from '@/redux/services/tickets/tickets.api-slice';
import { SupportForm } from '../molecules/support-form';
import { SupportSuccess } from '../organisms/support-success';
import { SupportTicketsList } from '../organisms/support-tickets-list';

type SupportView = 'form' | 'success' | 'tickets';

const withHash = (value: string): string =>
  value.startsWith('#') ? value : `#${value}`;

export const SupportTemplate: React.FC = () => {
  const router = useRouter();
  const [view, setView] = useState<SupportView>('form');
  const [ticketId, setTicketId] = useState('');

  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const handleSubmit = async (data: SupportData) => {
    try {
      const response = await createTicket({
        issue_type: data.issueType,
        description: data.message,
      }).unwrap();

      const created = response?.data;
      const ref =
        (typeof created?.reference === 'string' && created.reference) ||
        created?._id ||
        '';
      setTicketId(ref ? withHash(ref) : 'your ticket');
      setView('success');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Could not submit your request. Please try again.';
      toast.error(message);
    }
  };

  const openDetails = (id: string) =>
    router.push(`${APP_ROUTES.support}/${encodeURIComponent(id)}`);

  return (
    <section className='w-full min-h-[80vh] bg-[#F8F9FA] p-4'>
      {view === 'form' && (
        <SupportForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}

      {view === 'success' && (
        <SupportSuccess
          ticketId={ticketId}
          onSubmitAnother={() => setView('form')}
          onViewTickets={() => setView('tickets')}
        />
      )}

      {view === 'tickets' && (
        <SupportTicketsList
          onAddTicket={() => setView('form')}
          onViewDetails={openDetails}
        />
      )}
    </section>
  );
};

export default SupportTemplate;

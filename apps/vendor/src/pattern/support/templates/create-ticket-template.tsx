// Create Ticket Template
// /support/create-ticket — the "Get support" form, then the submitted
// confirmation. Back returns to the ticket list.

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { type SupportData } from '@/lib/validations/support';
import { GoBackButton } from '@/pattern/common/atoms/go-back-button';
import {
  useCreateTicketMutation,
  type Ticket,
} from '@/redux/services/tickets/tickets.api-slice';
import { SupportForm } from '../molecules/support-form';
import { SupportSuccess } from '../organisms/support-success';

export const CreateTicketTemplate: React.FC = () => {
  const router = useRouter();

  // `ticket` can be null on a successful create (the POST response body isn't
  // documented), so submission is tracked separately from the payload.
  const [submitted, setSubmitted] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const handleSubmit = async (data: SupportData): Promise<boolean> => {
    try {
      const response = await createTicket({
        issue_type: data.issueType,
        description: data.message,
      }).unwrap();

      setTicket(response?.data ?? null);
      setSubmitted(true);
      return true;
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Could not submit your request. Please try again.';
      toast.error(message);
      return false;
    }
  };

  const submitAnother = () => {
    setSubmitted(false);
    setTicket(null);
  };

  return (
    <section className='w-full min-h-[80vh] space-y-6 bg-[#F8F9FA]'>
      <GoBackButton href={APP_ROUTES.support} />

      {submitted ? (
        <SupportSuccess
          ticket={ticket}
          onSubmitAnother={submitAnother}
          onViewTickets={() => router.push(APP_ROUTES.support)}
        />
      ) : (
        <SupportForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}
    </section>
  );
};

export default CreateTicketTemplate;

// Support Template
// Vendor Support landing page: the vendor's ticket list ("Tickets").
// Creating a ticket lives at /support/create-ticket, details at /support/[id].

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/lib/routes';
import { SupportTicketsList } from '../organisms/support-tickets-list';

export const SupportTemplate: React.FC = () => {
  const router = useRouter();

  return (
    <section className='w-full min-h-[80vh] bg-[#F8F9FA]'>
      <SupportTicketsList
        onAddTicket={() => router.push(APP_ROUTES.supportCreateTicket)}
        onViewDetails={(id) =>
          router.push(`${APP_ROUTES.support}/${encodeURIComponent(id)}`)
        }
      />
    </section>
  );
};

export default SupportTemplate;

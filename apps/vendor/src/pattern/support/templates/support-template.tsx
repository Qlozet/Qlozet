// Support Template
// Vendor Support → Tickets: an "Add Ticket" action over the tickets table.

'use client';

import React from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { CirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SupportTicketsTable } from '../organisms/support-tickets-table';
import { AddTicketModal } from '../organisms/add-ticket-modal';

interface SupportTemplateProps {
  className?: string;
}

export const SupportTemplate: React.FC<SupportTemplateProps> = ({
  className,
}) => {
  const showAddTicket = () => NiceModal.show(AddTicketModal);

  return (
    <section className={cn('w-full min-h-[80vh] space-y-6 p-4', className)}>
      <div className='flex justify-end'>
        <Button onClick={showAddTicket} className='gap-2'>
          <CirclePlus className='size-4' />
          Add Ticket
        </Button>
      </div>

      <SupportTicketsTable />
    </section>
  );
};

export default SupportTemplate;

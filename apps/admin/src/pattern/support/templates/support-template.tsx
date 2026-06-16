'use client';

import { useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { CirclePlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SupportTabs, type SupportTab } from '../molecules/support-tabs';
import { TicketsTable } from '../organisms/tickets-table';
import { LiveChatTable } from '../organisms/live-chat-table';
import { AddTicketDrawer, type TicketDraft } from '../organisms/add-ticket-drawer';

export const SupportTemplate = () => {
  const [tab, setTab] = useState<SupportTab>('tickets');

  const showAddTicket = async () => {
    const draft = (await NiceModal.show(AddTicketDrawer)) as
      | TicketDraft
      | undefined;
    // TODO(api): POST the draft to a create-ticket endpoint once it exists, then
    // refetch the tickets list. For now confirm capture optimistically.
    if (draft) toast.success('Ticket created');
  };

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* Header: view switcher + primary action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SupportTabs value={tab} onChange={setTab} />

        <Button onClick={showAddTicket} className="gap-2 self-end sm:self-auto">
          <CirclePlus className="size-4" />
          Add Ticket
        </Button>
      </div>

      {tab === 'tickets' ? <TicketsTable /> : <LiveChatTable />}
    </div>
  );
};

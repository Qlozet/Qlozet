'use client';

import { CheckCircle2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SupportSuccessProps {
  ticketId: string;
  onSubmitAnother: () => void;
  onViewTickets: () => void;
}

// Shown after the Get-support form is submitted: confirms the created ticket
// and routes to a new request or the vendor's ticket list.
export const SupportSuccess = ({
  ticketId,
  onSubmitAnother,
  onViewTickets,
}: SupportSuccessProps) => {
  return (
    <div className='mx-auto mt-6 w-full max-w-[480px] rounded-[12px] bg-white p-8 text-center shadow'>
      <div className='flex justify-center'>
        <span className='flex size-16 items-center justify-center rounded-full border-2 border-success text-success'>
          <CheckCircle2 className='size-9' strokeWidth={1.5} />
        </span>
      </div>

      <h2 className='mt-5 text-lg font-bold text-grey-black'>
        Support Ticket Submitted
      </h2>
      <p className='mt-2 text-sm text-grey2'>
        Your support ticket has been received and has been assigned ticket{' '}
        {ticketId}
      </p>

      <div className='mt-6 rounded-xl bg-[#F8F9FA] px-4 py-5'>
        <p className='flex items-center justify-center gap-2 text-sm font-semibold text-grey-black'>
          <Ticket className='size-4' />
          Ticket ID: {ticketId}
        </p>
        <p className='mx-auto mt-2 max-w-[340px] text-xs text-grey2'>
          We will respond to your inquiry within 24 hours. You can reference this
          ID in any follow up conversation
        </p>
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

'use client';

import { useState } from 'react';
import { ClipboardList, Flag, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { Ticket } from '@/redux/services/tickets/tickets.api-slice';
import {
  readField,
  readName,
  statusLabel,
  statusVariant,
} from '../../lib/ticket-fields';

interface TicketDetailCardProps {
  ticket?: Ticket;
  isLoading?: boolean;
  isSending?: boolean;
  /** Returns true when the reply was sent so the field can clear. */
  onSendReply: (message: string) => Promise<boolean>;
  onCopyId: () => void;
  onFlag: () => void;
}

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-[#3387CC]">{label}</p>
    <p className="text-sm font-medium text-grey-black">{value}</p>
  </div>
);

export const TicketDetailCard = ({
  ticket,
  isLoading,
  isSending,
  onSendReply,
  onCopyId,
  onFlag,
}: TicketDetailCardProps) => {
  const [message, setMessage] = useState('');

  if (isLoading || !ticket) {
    return (
      <div className="space-y-5 rounded-2xl bg-white p-6 custom-card-shadow">
        <div className="flex gap-4">
          <Skeleton className="size-14 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        </div>
        <div className="flex gap-12">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    );
  }

  const title = `${readField(ticket, 'reference', 'ticket_id')} - ${readField(
    ticket,
    'subject',
    'title'
  )}`;

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const ok = await onSendReply(trimmed);
    if (ok) setMessage('');
  };

  return (
    <div className="space-y-5 rounded-2xl bg-white p-6 custom-card-shadow">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#B42318] text-white">
          <ShoppingCart className="size-6" />
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-bold text-grey-black">{title}</h2>
          <Badge
            variant={statusVariant(ticket.status)}
            shape="square"
            className="mt-1 flex h-[24px] w-fit items-center px-3 text-xs font-normal"
          >
            {statusLabel(ticket.status)}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopyId}
            aria-label="Copy ticket ID"
            className="flex size-9 items-center justify-center rounded-lg bg-[#F8F9FA] text-grey3 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ClipboardList className="size-4" />
          </button>
          <button
            type="button"
            onClick={onFlag}
            aria-label="Flag ticket"
            className="flex size-9 items-center justify-center rounded-lg bg-[#F8F9FA] text-error hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Flag className="size-4" />
          </button>
        </div>
      </div>

      {/* Customer / Category */}
      <div className="flex gap-12">
        <Meta label="Customer" value={readName(ticket)} />
        <Meta label="Category" value={readField(ticket, 'category', 'issue_type')} />
      </div>

      {/* Original message */}
      <div className="rounded-xl border border-border p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-grey3">
          {readField(ticket, 'description', 'message')}
        </p>
      </div>

      {/* Reply composer */}
      <div className="flex items-center gap-3 rounded-lg border border-border p-1.5">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Enter your message here...."
          className="border-0 shadow-none focus-visible:ring-0"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSend}
          disabled={isSending || !message.trim()}
        >
          {isSending ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

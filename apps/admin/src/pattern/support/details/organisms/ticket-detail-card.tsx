'use client';

import { useState } from 'react';
import { ClipboardList, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  Ticket,
  TicketReply,
} from '@/redux/services/tickets/tickets.api-slice';
import {
  EM_DASH,
  shortTicketId,
  statusLabel,
  statusVariant,
  ticketCategory,
  ticketSubject,
} from '../../lib/ticket-fields';
import { TicketReplyThread } from '../molecules/ticket-reply-thread';

interface TicketDetailCardProps {
  ticket?: Ticket;
  /** Vendor name resolved from the ticket's `business` id. */
  vendorName?: string;
  replies?: TicketReply[];
  /** True when the ticket has replies that came back as ids only. */
  repliesUnresolved?: boolean;
  isLoading?: boolean;
  isSending?: boolean;
  /** Returns true when the reply was sent so the field can clear. */
  onSendReply: (message: string) => Promise<boolean>;
  onCopyId: () => void;
}

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-[#3387CC]">{label}</p>
    <p className="text-sm font-medium text-grey-black">{value}</p>
  </div>
);

export const TicketDetailCard = ({
  ticket,
  vendorName,
  replies = [],
  repliesUnresolved,
  isLoading,
  isSending,
  onSendReply,
  onCopyId,
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

  const title = `${shortTicketId(ticket._id)} - ${ticketSubject(ticket)}`;

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
          {/* No flag control: the backend has no ticket-flag endpoint, and
              UpdateTicketDto carries no status field either. */}
        </div>
      </div>

      {/* Vendor / Category */}
      <div className="flex gap-12">
        <Meta label="Vendor" value={vendorName || EM_DASH} />
        <Meta label="Category" value={ticketCategory(ticket)} />
      </div>

      {/* Original message */}
      <div className="rounded-xl border border-border p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-grey3">
          {ticket.description?.trim() || EM_DASH}
        </p>

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {ticket.attachments.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#3387CC] underline"
              >
                Attachment
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Conversation */}
      <TicketReplyThread replies={replies} unresolved={repliesUnresolved} />

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

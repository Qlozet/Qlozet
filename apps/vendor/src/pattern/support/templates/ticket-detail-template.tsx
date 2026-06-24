'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_ROUTES } from '@/lib/routes';
import { GoBackButton } from '@/pattern/common/atoms/go-back-button';
import { useGetTicketQuery } from '@/redux/services/tickets/tickets.api-slice';
import {
  formatDateTime,
  readField,
  statusLabel,
  statusVariant,
} from '../lib/ticket-fields';
import { ChatComposer } from '../molecules/chat-composer';
import { ChatMessageBubble } from '../molecules/chat-message-bubble';
import { nowTime, type ChatMessage } from '../lib/chat-types';

const ref = (id: string) => (id.startsWith('#') ? id : `#${id}`);

const MetaChip = ({ label, value }: { label: string; value: string }) => (
  <div className='flex items-center gap-2 rounded-lg bg-[#F8F9FA] px-3 py-2'>
    <span className='flex size-6 items-center justify-center rounded-full bg-brown3 text-white'>
      <Clock className='size-3.5' />
    </span>
    <div className='leading-tight'>
      <p className='text-[11px] text-grey2'>{label}</p>
      <p className='text-xs font-medium text-grey-black'>{value}</p>
    </div>
  </div>
);

export const TicketDetailTemplate = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const { data, isLoading, isFetching } = useGetTicketQuery(id, { skip: !id });
  const ticket = data?.data;
  const loading = isLoading || isFetching;

  // No vendor ticket-message/reply endpoint exists (verified against Swagger —
  // reply is admin-only). So the thread starts honestly empty; composed
  // messages append locally. TODO(api): swap to a real messages query/mutation.
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${prev.length}`, kind: 'text', direction: 'out', text, time: nowTime() },
    ]);
  };

  const comingSoon = () => toast.info('This action is coming soon.');

  const ticketTitle = ticket
    ? ref(readField(ticket, 'reference', 'ticket_id') === '—'
        ? ticket._id
        : readField(ticket, 'reference', 'ticket_id'))
    : '';

  return (
    <div className='w-full min-h-screen h-fit space-y-6 p-4 pb-10'>
      <GoBackButton href={APP_ROUTES.support} />

      <div className='flex flex-col overflow-hidden rounded-2xl bg-white custom-card-shadow'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4 border-b border-border px-6 py-4'>
          {loading ? (
            <div className='space-y-2'>
              <Skeleton className='h-5 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
          ) : (
            <div>
              <h1 className='text-base font-bold text-grey-black'>
                Ticket {ticketTitle}
              </h1>
              <p className='text-xs text-grey2'>
                {readField(ticket ?? {}, 'category', 'issue_type')}
              </p>
            </div>
          )}

          {!loading && ticket && (
            <Badge
              variant={statusVariant(ticket.status)}
              shape='square'
              className='flex h-[26px] w-fit items-center px-3 text-xs font-normal'
            >
              {statusLabel(ticket.status)}
            </Badge>
          )}
        </div>

        {/* Meta chips */}
        <div className='flex flex-wrap justify-end gap-3 px-6 py-3'>
          {loading ? (
            <>
              <Skeleton className='h-10 w-40 rounded-lg' />
              <Skeleton className='h-10 w-40 rounded-lg' />
            </>
          ) : (
            <>
              <MetaChip
                label='Created'
                value={formatDateTime(ticket?.createdAt)}
              />
              <MetaChip
                label='Updated'
                value={
                  ticket?.updatedAt ? formatDateTime(ticket.updatedAt) : 'Just Now'
                }
              />
            </>
          )}
        </div>

        {/* Thread */}
        <div className='min-h-[320px] max-h-[460px] flex-1 space-y-3 overflow-y-auto bg-[#FCFCFC] px-6 py-4'>
          {messages.length > 0 ? (
            messages.map((message) => (
              <ChatMessageBubble
                key={message.id}
                text={message.text}
                time={message.time}
                direction={message.direction}
              />
            ))
          ) : (
            <div className='flex h-full min-h-[280px] items-center justify-center text-center text-sm text-grey2'>
              No messages yet. Start the conversation below.
            </div>
          )}
        </div>

        {/* Composer */}
        <ChatComposer
          onSend={handleSend}
          onAttach={comingSoon}
          onEmoji={comingSoon}
          onMic={comingSoon}
        />
      </div>
    </div>
  );
};

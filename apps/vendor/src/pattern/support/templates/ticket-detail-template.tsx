'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_ROUTES } from '@/lib/routes';
import { GoBackButton } from '@/pattern/common/atoms/go-back-button';
import {
  useGetTicketQuery,
  useReplyToTicketMutation,
} from '@/redux/services/tickets/tickets.api-slice';
import {
  formatDateTime,
  issueTypeLabel,
  issueTypeVisual,
  readField,
  statusLabel,
  statusVariant,
} from '../lib/ticket-fields';
import { ChatComposer } from '../molecules/chat-composer';
import { ChatMessageBubble } from '../molecules/chat-message-bubble';
import { nowTime, type ChatMessage } from '../lib/chat-types';

const ref = (id: string) => (id.startsWith('#') ? id : `#${id}`);

const MetaChip = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-2 rounded-lg bg-[#F8F9FA] dark:bg-[#4A4949] px-3 py-2">
    <span className="flex size-6 items-center justify-center rounded-full bg-brown3 text-white">
      <Clock className="size-3.5" />
    </span>
    <div className="leading-tight">
      <p className="text-[11px] text-grey2 dark:text-gray-400">{label}</p>
      <p className="text-xs font-medium text-grey-black dark:text-white">
        {value}
      </p>
    </div>
  </div>
);

export const TicketDetailTemplate = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const { data, isLoading, isFetching } = useGetTicketQuery(id, { skip: !id });
  const ticket = data?.data;
  const loading = isLoading || isFetching;

  const [replyToTicket] = useReplyToTicketMutation();

  // The ticket document carries its populated reply thread (each sender
  // includes its user type), so the chat is rebuilt from the server on every
  // fetch. The ticket's own description opens the thread as the first message.
  const timeOf = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

  const serverMessages = useMemo<ChatMessage[]>(() => {
    if (!ticket) return [];
    const thread: ChatMessage[] = [];
    const description = readField(ticket, 'description');
    if (description !== '—') {
      thread.push({
        id: 'description',
        kind: 'text',
        direction: 'out',
        text: description,
        time: timeOf(ticket.createdAt),
      });
    }
    const rawReplies = (ticket as { replies?: unknown }).replies;
    const replies = Array.isArray(rawReplies) ? rawReplies : [];
    replies.forEach((reply, index) => {
      if (!reply || typeof reply !== 'object') return;
      const entry = reply as {
        _id?: string;
        message?: string;
        createdAt?: string;
        sender?: { type?: string } | string;
      };
      if (!entry.message) return;
      const senderType =
        typeof entry.sender === 'object' ? entry.sender?.type : undefined;
      thread.push({
        id: String(entry._id ?? `reply-${index}`),
        kind: 'text',
        direction: senderType === 'vendor' ? 'out' : 'in',
        text: String(entry.message),
        time: timeOf(entry.createdAt),
      });
    });
    return thread;
  }, [ticket]);

  // Optimistic copies of replies still in flight; the refetch that follows a
  // successful send carries the real entry, so pending clears on arrival.
  const [pending, setPending] = useState<ChatMessage[]>([]);
  useEffect(() => {
    setPending([]);
  }, [serverMessages.length]);

  const messages = [...serverMessages, ...pending];

  const handleSend = async (text: string) => {
    const tempId = `pending-${Date.now()}`;
    setPending((prev) => [
      ...prev,
      { id: tempId, kind: 'text', direction: 'out', text, time: nowTime() },
    ]);
    try {
      await replyToTicket({ id, message: text }).unwrap();
    } catch {
      toast.error('Could not send your reply — please try again.');
      setPending((prev) => prev.filter((message) => message.id !== tempId));
    }
  };

  const comingSoon = () => toast.info('This action is coming soon.');

  const ticketTitle = ticket
    ? ref(
        readField(ticket, 'reference', 'ticket_id') === '—'
          ? ticket._id
          : readField(ticket, 'reference', 'ticket_id')
      )
    : '';

  return (
    <div className="mx-auto w-full max-w-7xl min-h-screen h-fit space-y-6 pb-10">
      <GoBackButton href={APP_ROUTES.support} />

      <div className="flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-card custom-card-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            (() => {
              const visual = issueTypeVisual(
                readField(ticket ?? {}, 'category', 'issue_type')
              );
              const CategoryIcon = visual.icon;
              return (
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: visual.color }}
                  >
                    <CategoryIcon className="size-5" />
                  </span>
                  <div>
                    <h1 className="text-base font-bold text-grey-black dark:text-white">
                      Ticket {ticketTitle}
                    </h1>
                    <p className="text-xs text-grey2 dark:text-gray-400">
                      {issueTypeLabel(
                        readField(ticket ?? {}, 'category', 'issue_type')
                      )}
                    </p>
                  </div>
                </div>
              );
            })()
          )}

          {!loading && ticket && (
            <Badge
              variant={statusVariant(ticket.status)}
              shape="square"
              className="flex h-[26px] w-fit items-center px-3 text-xs font-normal"
            >
              {statusLabel(ticket.status)}
            </Badge>
          )}
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap justify-end gap-3 px-6 py-3">
          {loading ? (
            <>
              <Skeleton className="h-10 w-40 rounded-lg" />
              <Skeleton className="h-10 w-40 rounded-lg" />
            </>
          ) : (
            <>
              <MetaChip
                label="Created"
                value={formatDateTime(ticket?.createdAt)}
              />
              <MetaChip
                label="Updated"
                value={
                  ticket?.updatedAt
                    ? formatDateTime(ticket.updatedAt)
                    : 'Just Now'
                }
              />
            </>
          )}
        </div>

        {/* Thread */}
        <div className="min-h-[320px] max-h-[460px] flex-1 space-y-3 overflow-y-auto bg-[#FCFCFC] dark:bg-[#2A2A2A] px-6 py-4">
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
            <div className="flex h-full min-h-[280px] items-center justify-center text-center text-sm text-grey2 dark:text-gray-400">
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

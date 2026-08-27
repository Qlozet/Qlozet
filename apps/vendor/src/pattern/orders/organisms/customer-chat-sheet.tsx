'use client';

import { useEffect, useRef } from 'react';
import { Loader2, Lock, Store, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChatMessageBubble } from '@/pattern/support/molecules/chat-message-bubble';
import { ChatComposer } from '@/pattern/support/molecules/chat-composer';
import {
  useGetOrderMessagesQuery,
  useSendOrderMessageMutation,
  type OrderMessage,
} from '@/redux/services/messaging/messaging.api-slice';
import { useOrderMessageSocket } from '@/lib/hooks/useOrderMessageSocket';

interface CustomerChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: string;
  customerName?: string;
  /** True while the order is in production/transit — messages can be sent. */
  canSend: boolean;
}

function fmtTime(m: OrderMessage): string {
  const iso = m.createdAt || m.created_at;
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CustomerChatSheet({
  open,
  onOpenChange,
  reference,
  customerName,
  canSend,
}: CustomerChatSheetProps) {
  const {
    data: messages = [],
    isLoading,
    refetch,
  } = useGetOrderMessagesQuery(reference, { skip: !open || !reference });
  const [sendMessage] = useSendOrderMessageMutation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live delivery — refetch the thread when a new message lands.
  useOrderMessageSocket(open ? reference : null, open, () => {
    refetch();
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading, open]);

  const handleSend = async (text: string) => {
    try {
      await sendMessage({ reference, content: text }).unwrap();
    } catch (err) {
      const msg = (err as { data?: { message?: string | string[] } })?.data
        ?.message;
      toast.error(
        (Array.isArray(msg) ? msg[0] : msg) || 'Could not send your message.'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* A Dialog (not a bare portal) so it gets its own focus scope — otherwise
          the order drawer's focus trap steals focus and the composer can't be
          typed in. Overlay/content are z-60/61, above the design media panel. */}
      <DialogContent
        showCloseButton={false}
        className="flex h-[75vh] flex-col !gap-0 !overflow-hidden !p-0 sm:h-[600px] sm:!max-h-[85vh] sm:!w-[420px] sm:!max-w-[calc(100vw-2rem)] sm:!overflow-hidden"
      >
        <DialogTitle className="sr-only">
          Chat with {customerName || 'the customer'}
        </DialogTitle>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#F1F1F1] dark:bg-[#4A4949]">
              <Store className="size-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-grey-black dark:text-white">
                {customerName || 'Customer'}
              </span>
              <span className="text-[11px] text-grey2 dark:text-gray-400">
                Order {reference}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close chat"
            className="flex size-8 items-center justify-center rounded-full text-grey3 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-[#FAF9F7] px-4 py-4 dark:bg-[#2A2A2A]"
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-5 animate-spin text-grey2" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 px-6 text-center">
              <p className="text-sm font-semibold text-grey-black dark:text-white">
                No messages yet
              </p>
              <p className="max-w-[260px] text-xs text-grey2 dark:text-gray-400">
                Message the customer about fit, fabric, and progress on this
                bespoke order.
              </p>
            </div>
          ) : (
            messages.map((m) =>
              m.sender_role === 'admin' ? (
                <div key={m._id} className="flex justify-center">
                  <span className="max-w-[85%] rounded-lg bg-[#FBF3E0] px-3 py-1.5 text-[11px] text-[#8A6D3B]">
                    {m.content}
                  </span>
                </div>
              ) : (
                <ChatMessageBubble
                  key={m._id}
                  text={m.content}
                  time={fmtTime(m)}
                  direction={m.sender_role === 'vendor' ? 'out' : 'in'}
                />
              )
            )
          )}
        </div>

        {/* Composer */}
        {canSend ? (
          <div className="shrink-0">
            <ChatComposer onSend={handleSend} />
          </div>
        ) : (
          <div className="flex shrink-0 items-center justify-center gap-2 border-t border-border bg-gray-50 px-4 py-3.5 dark:bg-white/5">
            <Lock className="size-3.5 text-grey2" />
            <span className="text-center text-[11.5px] text-grey2 dark:text-gray-400">
              Chat opens while the order is in production or transit.
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

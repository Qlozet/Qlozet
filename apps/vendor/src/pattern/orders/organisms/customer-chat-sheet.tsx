'use client';

import { useEffect, useRef } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
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
  }, [messages, isLoading]);

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle>{customerName || 'Customer'}</SheetTitle>
          <SheetDescription>Order {reference}</SheetDescription>
        </SheetHeader>

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

        {canSend ? (
          <ChatComposer onSend={handleSend} />
        ) : (
          <div className="flex items-center justify-center gap-2 border-t border-border bg-gray-50 px-4 py-3.5 dark:bg-white/5">
            <Lock className="size-3.5 text-grey2" />
            <span className="text-center text-[11.5px] text-grey2 dark:text-gray-400">
              Chat opens while the order is in production or transit.
            </span>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

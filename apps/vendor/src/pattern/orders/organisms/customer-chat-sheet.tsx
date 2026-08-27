'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Lock, Store, X } from 'lucide-react';
import { toast } from 'sonner';
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

  // Mount + slide/fade so the panel animates in and out.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), 500);
    return () => window.clearTimeout(t);
  }, [open]);

  // Live delivery — refetch the thread when a new message lands.
  useOrderMessageSocket(open ? reference : null, open, () => {
    refetch();
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading, visible]);

  if (!mounted || typeof document === 'undefined') return null;

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

  const close = () => onOpenChange(false);

  return createPortal(
    <>
      {/* Backdrop — above the drawer (z-50), media panel (z-55) and design
          preview (z-70). data-order-chat-panel + pointer-events-auto so it's
          clickable and doesn't dismiss the underlying order drawer. */}
      <div
        data-order-chat-panel
        className={`pointer-events-auto fixed inset-0 z-[78] bg-black/40 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={close}
      />

      {/* Floating panel — bottom sheet on mobile, right panel on desktop. */}
      <div
        data-order-chat-panel
        className={`pointer-events-auto fixed bottom-3 left-3 right-3 z-[80] flex max-h-[75vh] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl transition-all duration-500 ease-out dark:bg-card lg:bottom-6 lg:left-auto lg:right-6 lg:top-6 lg:max-h-[640px] lg:w-[420px] ${
          visible
            ? 'translate-y-0 opacity-100 lg:translate-x-0'
            : 'translate-y-[calc(100%+24px)] opacity-100 lg:translate-y-0 lg:translate-x-6 lg:opacity-0'
        }`}
      >
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
            onClick={close}
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
          <ChatComposer onSend={handleSend} />
        ) : (
          <div className="flex items-center justify-center gap-2 border-t border-border bg-gray-50 px-4 py-3.5 dark:bg-white/5">
            <Lock className="size-3.5 text-grey2" />
            <span className="text-center text-[11.5px] text-grey2 dark:text-gray-400">
              Chat opens while the order is in production or transit.
            </span>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

'use client';

import { Loader2 } from 'lucide-react';
import {
  useGetAdminOrderMessagesQuery,
  type OrderMessage,
} from '@/redux/services/messaging/messaging.api-slice';

interface OrderConversationViewProps {
  reference: string;
}

function fmtTime(m: OrderMessage): string {
  const iso = m.createdAt || m.created_at;
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Read-only view of a bespoke order's customer <-> tailor chat, for admin
 * oversight (e.g. as dispute evidence). Admin never sends here.
 */
export function OrderConversationView({
  reference,
}: OrderConversationViewProps) {
  const { data: messages = [], isLoading } = useGetAdminOrderMessagesQuery(
    reference,
    { skip: !reference }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="size-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <p className="py-3 text-center text-xs text-gray-400">
        No chat on this order.
      </p>
    );
  }

  return (
    <div className="flex max-h-72 flex-col gap-2 overflow-y-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
      {messages.map((m) => {
        if (m.sender_role === 'admin') {
          return (
            <div key={m._id} className="flex justify-center">
              <span className="max-w-[85%] rounded-md bg-[#FBF3E0] px-2.5 py-1 text-[11px] text-[#8A6D3B]">
                {m.content}
              </span>
            </div>
          );
        }
        const isVendor = m.sender_role === 'vendor';
        return (
          <div
            key={m._id}
            className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[78%] rounded-2xl px-3 py-2 ${
                isVendor
                  ? 'rounded-br-sm bg-primary/10 text-gray-800 dark:text-gray-100'
                  : 'rounded-bl-sm bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100'
              }`}
            >
              <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {isVendor ? 'Vendor' : 'Customer'}
              </span>
              <p className="whitespace-pre-wrap break-words text-[13px] leading-snug">
                {m.content}
              </p>
              <span className="mt-0.5 block text-right text-[9.5px] text-gray-400">
                {fmtTime(m)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

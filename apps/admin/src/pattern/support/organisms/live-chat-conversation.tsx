'use client';

import { useRef, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ChatMessageBubble } from '../molecules/chat-message-bubble';
import { ChatVoiceMessage } from '../molecules/chat-voice-message';
import { ChatComposer } from '../molecules/chat-composer';
import { nowTime, type ChatMessage } from '../lib/chat-types';

interface LiveChatConversationProps {
  name: string;
  /** Online presence flag for the header subtitle. */
  active?: boolean;
  avatarUrl?: string;
}

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

// Live-chat conversation drawer. Opens from a Live Chat Logs row.
export const LiveChatConversation = NiceModal.create(
  ({ name, active = true, avatarUrl }: LiveChatConversationProps) => {
    const { visible, resolve, hide, remove } = useModal();

    // TODO(api): seed from `useGetChatMessagesQuery(chatId)` and send through a
    // `useSendChatMessageMutation()` once the chat backend exists. For now the
    // thread starts empty and locally-composed messages are appended.
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const idRef = useRef(0);

    const handleOpenChange = (open: boolean) => {
      if (open) return;
      resolve(undefined);
      hide();
      setTimeout(() => remove(), 300);
    };

    const handleSend = (text: string) => {
      idRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `m_${idRef.current}`,
          kind: 'text',
          direction: 'out',
          text,
          time: nowTime(),
        },
      ]);
    };

    const notWired = () => toast.info('Connect the chat API to enable this.');

    return (
      <Sheet open={visible} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="flex sm:flex w-full flex-col !overflow-hidden p-0 sm:max-w-[440px] !top-6 !bottom-6 !right-6 rounded-2xl custom-card-shadow bg-white dark:bg-card"
          style={{
            height: 'calc(100vh - 3rem)',
            maxHeight: 'calc(100vh - 3rem)',
          }}
        >
          {/* pr-12 keeps the name clear of the Sheet's built-in close button. */}
          <SheetHeader className="shrink-0 border-b border-border py-3 pl-4 pr-12">
            <div className="flex items-center gap-3">
              <div className="relative">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-brown3 text-sm font-semibold text-white">
                    {initials(name)}
                  </div>
                )}
                {active && (
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success ring-2 ring-white dark:ring-card" />
                )}
              </div>

              <div className="flex-1 text-left">
                <SheetTitle className="text-sm font-semibold text-grey-black dark:text-white">
                  {name}
                </SheetTitle>
                {active && (
                  <p className="text-xs font-medium text-success">Active now</p>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* Messages */}
          <div className="flex-1 min-h-0 space-y-2 overflow-y-auto bg-white dark:bg-card px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-grey-black dark:text-white">
                  No messages yet
                </p>
                <p className="mt-1 text-sm text-grey3 dark:text-gray-400">
                  Start the conversation below.
                </p>
              </div>
            ) : (
              messages.map((message) =>
                message.kind === 'voice' ? (
                  <ChatVoiceMessage
                    key={message.id}
                    duration={message.duration}
                    time={message.time}
                    direction={message.direction}
                    onPlay={notWired}
                  />
                ) : (
                  <ChatMessageBubble
                    key={message.id}
                    text={message.text}
                    time={message.time}
                    direction={message.direction}
                  />
                )
              )
            )}
          </div>

          {/* Composer */}
          <div className="shrink-0">
            <ChatComposer
              onSend={handleSend}
              onAttach={notWired}
              onEmoji={notWired}
              onMic={notWired}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);

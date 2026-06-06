'use client';

import { useRef, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { ChatMessageBubble } from '../molecules/chat-message-bubble';
import { ChatVoiceMessage } from '../molecules/chat-voice-message';
import { ChatComposer } from '../molecules/chat-composer';
import { nowTime, type ChatMessage } from '../lib/chat-types';
import { USE_SUPPORT_MOCKS, MOCK_CHAT_THREAD } from '../lib/mock-data';

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
    const modal = useModal();

    // TODO(api): seed from `useGetChatMessagesQuery(chatId)` and send through a
    // `useSendChatMessageMutation()` once the chat backend exists. For now the
    // thread starts empty and locally-composed messages are appended.
    const [messages, setMessages] = useState<ChatMessage[]>(
      USE_SUPPORT_MOCKS ? MOCK_CHAT_THREAD : []
    );
    const idRef = useRef(0);

    if (!modal.visible) return null;

    const handleClose = () => modal.remove();

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

    const notWired = () =>
      toast.info('Connect the chat API to enable this.');

    return (
      <div className="fixed inset-0 z-[100] flex justify-end">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Chat with ${name}`}
          className="relative z-10 flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Back"
              className="flex size-8 items-center justify-center rounded-full text-grey-black hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-5" />
            </button>

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
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success ring-2 ring-white" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-grey-black">{name}</p>
              {active && (
                <p className="text-xs font-medium text-success">Active now</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="flex size-8 items-center justify-center rounded-full text-grey3 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-2 overflow-y-auto bg-white px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-grey-black">
                  No messages yet
                </p>
                <p className="mt-1 text-sm text-grey3">
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
          <ChatComposer
            onSend={handleSend}
            onAttach={notWired}
            onEmoji={notWired}
            onMic={notWired}
          />
        </div>
      </div>
    );
  }
);

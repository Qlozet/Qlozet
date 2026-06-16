// Shared chat message model. Maps cleanly onto a future chat API response
// (see live-chat-conversation.tsx TODO(api)).

export type ChatDirection = 'in' | 'out';

export interface ChatTextMessage {
  id: string;
  kind: 'text';
  direction: ChatDirection;
  text: string;
  /** Display time, e.g. "21:56". */
  time: string;
}

export interface ChatVoiceMessage {
  id: string;
  kind: 'voice';
  direction: ChatDirection;
  /** Clip length, e.g. "1:27". */
  duration: string;
  audioUrl?: string;
  time: string;
}

export type ChatMessage = ChatTextMessage | ChatVoiceMessage;

// Current wall-clock time as "HH:MM" for locally-composed messages.
export const nowTime = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Open the assistant from anywhere with a question already asked.
 *
 * The chat sheet is mounted once, in the dashboard top bar. Anything else
 * that wants to hand it a question (the morning brief's "Ask") dispatches
 * this event instead of threading state through the tree; the top bar
 * listens, opens the sheet, and the sheet sends the question as a fresh
 * thread.
 */
export const ASSISTANT_ASK_EVENT = 'qlozet:assistant-ask';

export interface AssistantAskDetail {
  message: string;
}

export function askAssistant(message: string): void {
  const text = message.trim();
  if (!text || typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<AssistantAskDetail>(ASSISTANT_ASK_EVENT, {
      detail: { message: text },
    })
  );
}

/** Subscribe; returns the unsubscribe. */
export function onAskAssistant(handler: (message: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = (event: Event) => {
    const message = (event as CustomEvent<AssistantAskDetail>).detail?.message;
    if (typeof message === 'string' && message.trim()) handler(message);
  };
  window.addEventListener(ASSISTANT_ASK_EVENT, listener);
  return () => window.removeEventListener(ASSISTANT_ASK_EVENT, listener);
}

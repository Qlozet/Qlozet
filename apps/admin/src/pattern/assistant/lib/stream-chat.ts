import { env } from '@/env';
import { getCookies } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import type { AssistantChart } from '@/redux/services/assistant/assistant.api-slice';

export interface StreamHandlers {
  onDelta: (text: string) => void;
  onChart: (chart: AssistantChart) => void;
  onDone: (info: { conversation_id: string; tools_used: string[] }) => void;
  onError: (message: string) => void;
}

/**
 * Streams POST /assistant/chat/stream via fetch + SSE parsing. RTK Query can't
 * consume a token stream, so this talks to the API directly, reusing the same
 * base URL and bearer token as the RTK base query.
 */
export async function streamChat(
  body: { message: string; conversation_id?: string },
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  const token = getCookies({ key: SESSION_COOKIE_KEY });

  let res: Response;
  try {
    res = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/assistant/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e: any) {
    if (e?.name !== 'AbortError') {
      handlers.onError('Network error. Please try again.');
    }
    return;
  }

  // A non-2xx (e.g. 400 out-of-tokens) comes back as JSON, not a stream.
  if (!res.ok || !res.body) {
    let message = 'The assistant is unavailable right now.';
    try {
      const data = await res.json();
      message = data?.message ?? message;
    } catch {
      /* ignore */
    }
    handlers.onError(message);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const json = line.slice(5).trim();
        if (!json) continue;
        let evt: any;
        try {
          evt = JSON.parse(json);
        } catch {
          continue;
        }
        switch (evt.type) {
          case 'delta':
            handlers.onDelta(evt.text ?? '');
            break;
          case 'chart':
            handlers.onChart(evt.chart);
            break;
          case 'done':
            handlers.onDone({
              conversation_id: evt.conversation_id,
              tools_used: evt.tools_used ?? [],
            });
            break;
          case 'error':
            handlers.onError(evt.message ?? 'Something went wrong.');
            break;
          default:
            break;
        }
      }
    }
  } catch (e: any) {
    if (e?.name !== 'AbortError') {
      handlers.onError('The connection dropped. Please try again.');
    }
  }
}

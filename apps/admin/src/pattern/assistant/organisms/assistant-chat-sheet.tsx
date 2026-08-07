'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  History,
  ArrowLeft,
  Loader2,
  X,
} from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useGetConversationsQuery,
  useLazyGetConversationQuery,
  type AssistantMessage,
  type AssistantChart,
} from '@/redux/services/assistant/assistant.api-slice';
import { AssistantMiniChart } from '../molecules/assistant-mini-chart';
import { streamChat } from '../lib/stream-chat';
import { Markdown } from '@/components/ui/markdown';

// Marketplace-wide prompts — the admin console's framing, not a single
// vendor's. NOTE: /assistant/* is undocumented in Swagger and was built for the
// vendor app, so answers may still be scoped to the signed-in user's own data.
const SUGGESTIONS = [
  'How did the marketplace perform this month?',
  'Which vendors are driving the most revenue?',
  'What are the top selling products right now?',
  'How many orders are still awaiting fulfilment?',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssistantChatSheet = ({ open, onOpenChange }: Props) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const { data: convosRes } = useGetConversationsQuery(
    { size: 20 },
    { skip: !open }
  );
  const [loadConversation, { isFetching: isLoadingThread }] =
    useLazyGetConversationQuery();

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isStreaming]);

  // Abort any in-flight stream when the sheet closes or unmounts.
  useEffect(() => {
    if (!open) abortRef.current?.abort();
  }, [open]);
  useEffect(() => () => abortRef.current?.abort(), []);

  // Patch the trailing assistant message as tokens/charts stream in.
  const patchLastAssistant = (patch: Partial<AssistantMessage>) => {
    setMessages((prev) => {
      const copy = [...prev];
      const i = copy.length - 1;
      if (i >= 0 && copy[i].role === 'assistant') {
        copy[i] = { ...copy[i], ...patch };
      }
      return copy;
    });
  };

  const startNew = () => {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(undefined);
    setShowHistory(false);
  };

  const openThread = async (id: string) => {
    setShowHistory(false);
    const res = await loadConversation(id)
      .unwrap()
      .catch(() => null);
    const convo = res?.data;
    if (convo) {
      setConversationId(convo._id);
      setMessages(convo.messages ?? []);
    }
  };

  const submit = async (text: string) => {
    const q = text.trim();
    if (!q || isStreaming) return;
    setInput('');
    // Add the user turn + an empty assistant turn we'll stream into.
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: q, createdAt: new Date().toISOString() },
      {
        role: 'assistant',
        content: '',
        charts: [],
        createdAt: new Date().toISOString(),
      },
    ]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let acc = '';
    const chartsAcc: AssistantChart[] = [];

    await streamChat(
      { message: q, conversation_id: conversationId },
      {
        onDelta: (t) => {
          acc += t;
          patchLastAssistant({ content: acc });
        },
        onChart: (c) => {
          chartsAcc.push(c);
          patchLastAssistant({ charts: [...chartsAcc] });
        },
        onDone: ({ conversation_id }) => {
          setConversationId(conversation_id);
        },
        onError: (m) => {
          patchLastAssistant({ content: acc || m });
        },
      },
      controller.signal
    );

    setIsStreaming(false);
    abortRef.current = null;
  };

  const convos = convosRes?.data?.items ?? [];
  const isEmpty = messages.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:!top-6 sm:!bottom-6 sm:!right-6 sm:!h-[calc(100vh-3rem)] sm:max-w-md sm:rounded-[15px] !bg-white dark:!bg-card border border-gray-100 dark:border-border [&>button:last-of-type]:hidden"
      >
        {/* Fixed-height flex column: header + history are fixed, messages scroll,
            composer is pinned to the bottom. */}
        <div className="flex h-[80vh] w-full flex-col overflow-hidden sm:h-full">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4">
            <div className="flex items-center gap-2">
              {!isEmpty && (
                <button
                  onClick={startNew}
                  className="cursor-pointer rounded-lg p-1 hover:bg-muted"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <SheetTitle className="text-sm font-semibold text-foreground">
                    Business Assistant
                  </SheetTitle>
                  <SheetDescription className="text-[10px] text-muted-foreground">
                    Insights on your store · beta
                  </SheetDescription>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHistory((s) => !s)}
                className={cn(
                  'cursor-pointer rounded-lg p-2 hover:bg-muted',
                  showHistory && 'bg-muted'
                )}
                aria-label="Chat history"
              >
                <History className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={startNew}
                className="cursor-pointer rounded-lg p-2 hover:bg-muted"
                aria-label="New chat"
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
              {/* SheetContent's own absolutely-positioned close is hidden above
                so it can't overlap these actions — this is its replacement. */}
              <SheetClose
                className="cursor-pointer rounded-lg p-2 hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </SheetClose>
            </div>
          </div>

          {/* History drawer */}
          {showHistory && (
            <div className="shrink-0 border-b border-border bg-muted/30 p-2">
              <p className="px-2 py-1 text-[10px] font-medium uppercase text-muted-foreground">
                Recent chats
              </p>
              <div className="max-h-52 space-y-0.5 overflow-y-auto">
                {convos.length === 0 && (
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    No conversations yet.
                  </p>
                )}
                {convos.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => openThread(c._id)}
                    className="block w-full cursor-pointer truncate rounded-lg px-2 py-2 text-left text-xs text-foreground hover:bg-muted"
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
          >
            {isEmpty && !isLoadingThread && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </span>
                <p className="text-sm font-medium text-foreground">
                  Ask me about your business
                </p>
                <p className="mb-4 mt-1 text-xs text-muted-foreground">
                  Sales, earnings, payouts, top products and more.
                </p>
                <div className="flex w-full flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="cursor-pointer rounded-xl border border-border bg-background px-3 py-2 text-left text-xs text-foreground hover:bg-muted dark:bg-[#4A4949]/40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoadingThread && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground dark:bg-[#4A4949]'
                  )}
                >
                  {m.content ? (
                    m.role === 'assistant' ? (
                      <Markdown content={m.content} />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {m.content}
                      </p>
                    )
                  ) : m.role === 'assistant' &&
                    isStreaming &&
                    i === messages.length - 1 ? (
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analysing…
                    </span>
                  ) : null}
                  {m.charts?.map((chart, ci) => (
                    <AssistantMiniChart key={ci} chart={chart} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-end gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                rows={1}
                placeholder="How can I help you?"
                className="max-h-28 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary dark:bg-[#4A4949]/40"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isStreaming || !input.trim()}
                className="h-9 w-9 shrink-0 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-1.5 px-1 text-center text-[10px] text-muted-foreground">
              Insights only — not financial advice.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

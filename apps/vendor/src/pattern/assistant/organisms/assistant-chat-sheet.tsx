'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Plus, History, ArrowLeft, Loader2 } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useSendChatMutation,
  useGetConversationsQuery,
  useLazyGetConversationQuery,
  type AssistantMessage,
} from '@/redux/services/assistant/assistant.api-slice';
import { AssistantMiniChart } from '../molecules/assistant-mini-chart';

const SUGGESTIONS = [
  'How were my sales this month?',
  'What are my top selling products?',
  'When is my next payout and how much?',
  'Which states buy from me the most?',
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

  const [sendChat, { isLoading: isSending }] = useSendChatMutation();
  const { data: convosRes } = useGetConversationsQuery(
    { size: 20 },
    { skip: !open },
  );
  const [loadConversation, { isFetching: isLoadingThread }] =
    useLazyGetConversationQuery();

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isSending]);

  const startNew = () => {
    setMessages([]);
    setConversationId(undefined);
    setShowHistory(false);
  };

  const openThread = async (id: string) => {
    setShowHistory(false);
    const res = await loadConversation(id).unwrap().catch(() => null);
    const convo = res?.data;
    if (convo) {
      setConversationId(convo._id);
      setMessages(convo.messages ?? []);
    }
  };

  const submit = async (text: string) => {
    const q = text.trim();
    if (!q || isSending) return;
    setInput('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: q, createdAt: new Date().toISOString() },
    ]);
    try {
      const res = await sendChat({
        message: q,
        conversation_id: conversationId,
      }).unwrap();
      const data = res.data;
      setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          charts: data.charts,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            e?.data?.message ??
            'Sorry, something went wrong. Please try again.',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const convos = convosRes?.data?.items ?? [];
  const isEmpty = messages.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-full flex-col overflow-hidden p-0 sm:!top-6 sm:!bottom-6 sm:!right-6 sm:!h-[calc(100vh-3rem)] sm:max-w-md sm:rounded-[15px] !bg-white dark:!bg-card border border-gray-100 dark:border-border'
      >
        {/* Header */}
        <div className='flex shrink-0 items-center justify-between border-b border-border px-4 py-4'>
          <div className='flex items-center gap-2'>
            {!isEmpty && (
              <button
                onClick={startNew}
                className='rounded-lg p-1 hover:bg-muted'
                aria-label='Back'
              >
                <ArrowLeft className='h-4 w-4 text-muted-foreground' />
              </button>
            )}
            <div className='flex items-center gap-2'>
              <span className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10'>
                <Sparkles className='h-4 w-4 text-primary' />
              </span>
              <div>
                <p className='text-sm font-semibold text-foreground'>
                  Business Assistant
                </p>
                <p className='text-[10px] text-muted-foreground'>
                  Insights on your store · beta
                </p>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => setShowHistory((s) => !s)}
              className={cn(
                'rounded-lg p-2 hover:bg-muted',
                showHistory && 'bg-muted',
              )}
              aria-label='Chat history'
            >
              <History className='h-4 w-4 text-muted-foreground' />
            </button>
            <button
              onClick={startNew}
              className='rounded-lg p-2 hover:bg-muted'
              aria-label='New chat'
            >
              <Plus className='h-4 w-4 text-muted-foreground' />
            </button>
          </div>
        </div>

        {/* History drawer */}
        {showHistory && (
          <div className='shrink-0 border-b border-border bg-muted/30 p-2'>
            <p className='px-2 py-1 text-[10px] font-medium uppercase text-muted-foreground'>
              Recent chats
            </p>
            <div className='max-h-52 space-y-0.5 overflow-y-auto'>
              {convos.length === 0 && (
                <p className='px-2 py-2 text-xs text-muted-foreground'>
                  No conversations yet.
                </p>
              )}
              {convos.map((c) => (
                <button
                  key={c._id}
                  onClick={() => openThread(c._id)}
                  className='block w-full truncate rounded-lg px-2 py-2 text-left text-xs text-foreground hover:bg-muted'
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className='flex-1 space-y-4 overflow-y-auto p-4'>
          {isEmpty && !isLoadingThread && (
            <div className='flex h-full flex-col items-center justify-center text-center'>
              <span className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                <Sparkles className='h-6 w-6 text-primary' />
              </span>
              <p className='text-sm font-medium text-foreground'>
                Ask me about your business
              </p>
              <p className='mb-4 mt-1 text-xs text-muted-foreground'>
                Sales, earnings, payouts, top products and more.
              </p>
              <div className='flex w-full flex-col gap-2'>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className='rounded-xl border border-border bg-background px-3 py-2 text-left text-xs text-foreground hover:bg-muted dark:bg-[#4A4949]/40'
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoadingThread && (
            <div className='flex justify-center py-6'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                'flex',
                m.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground dark:bg-[#4A4949]',
                )}
              >
                <p className='whitespace-pre-wrap leading-relaxed'>
                  {m.content}
                </p>
                {m.charts?.map((chart, ci) => (
                  <AssistantMiniChart key={ci} chart={chart} />
                ))}
              </div>
            </div>
          ))}

          {isSending && (
            <div className='flex justify-start'>
              <div className='flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 dark:bg-[#4A4949]'>
                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                <span className='text-xs text-muted-foreground'>
                  Analysing…
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className='shrink-0 border-t border-border p-3'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className='flex items-end gap-2'
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
              placeholder='How can I help you?'
              className='max-h-28 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary dark:bg-[#4A4949]/40'
            />
            <Button
              type='submit'
              size='icon'
              disabled={isSending || !input.trim()}
              className='h-9 w-9 shrink-0 rounded-xl'
            >
              <Send className='h-4 w-4' />
            </Button>
          </form>
          <p className='mt-1.5 px-1 text-center text-[10px] text-muted-foreground'>
            Insights only — not financial advice.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

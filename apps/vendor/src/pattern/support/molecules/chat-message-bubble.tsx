import { cn } from '@/lib/utils';
import type { ChatDirection } from '../lib/chat-types';

interface ChatMessageBubbleProps {
  text: string;
  time: string;
  direction: ChatDirection;
}

// Text chat bubble. Incoming = grey/left, outgoing = brown/right.
export const ChatMessageBubble = ({
  text,
  time,
  direction,
}: ChatMessageBubbleProps) => {
  const isOut = direction === 'out';
  return (
    <div className={cn('flex', isOut ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isOut
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md bg-[#F1F1F1] text-grey-black'
        )}
      >
        <p className='whitespace-pre-wrap break-words'>{text}</p>
        <span
          className={cn(
            'mt-1 block text-right text-[10px]',
            isOut ? 'text-primary-foreground/70' : 'text-grey2'
          )}
        >
          {time}
        </span>
      </div>
    </div>
  );
};

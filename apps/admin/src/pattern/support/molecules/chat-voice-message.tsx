'use client';

import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatDirection } from '../lib/chat-types';

interface ChatVoiceMessageProps {
  duration: string;
  time: string;
  direction: ChatDirection;
  onPlay?: () => void;
}

// Decorative, fixed waveform pattern (a visual element, not data).
const BARS = [
  6, 12, 9, 16, 11, 20, 14, 8, 18, 10, 22, 13, 7, 17, 12, 9, 19, 11, 15, 8, 21,
  10, 14, 6, 16, 12, 9, 18, 11, 7,
];

// Voice-note chat bubble with waveform + play control.
export const ChatVoiceMessage = ({
  duration,
  time,
  direction,
  onPlay,
}: ChatVoiceMessageProps) => {
  const isOut = direction === 'out';
  return (
    <div className={cn('flex', isOut ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex max-w-[80%] items-center gap-3 rounded-2xl px-4 py-3',
          isOut
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md bg-[#F1F1F1] text-grey-black'
        )}
      >
        {/* Waveform */}
        <div className="flex h-7 items-center gap-[2px]">
          {BARS.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}px` }}
              className={cn(
                'w-[2px] rounded-full',
                isOut ? 'bg-primary-foreground/60' : 'bg-grey2'
              )}
            />
          ))}
        </div>

        <span
          className={cn(
            'shrink-0 text-xs',
            isOut ? 'text-primary-foreground/80' : 'text-grey3'
          )}
        >
          {duration}
        </span>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <button
            type="button"
            onClick={onPlay}
            aria-label="Play voice message"
            className={cn(
              'flex size-7 items-center justify-center rounded-full transition-colors cursor-pointer',
              isOut
                ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <Play className="size-3.5 fill-current" />
          </button>
          <span
            className={cn(
              'text-[10px]',
              isOut ? 'text-primary-foreground/70' : 'text-grey2'
            )}
          >
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};

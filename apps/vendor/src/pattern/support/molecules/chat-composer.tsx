'use client';

import { useState } from 'react';
import { Link2, Mic, Send, Smile } from 'lucide-react';

interface ChatComposerProps {
  onSend: (text: string) => void;
  onAttach?: () => void;
  onEmoji?: () => void;
  onMic?: () => void;
}

// Message input row: attach, emoji, text field, mic/send.
export const ChatComposer = ({
  onSend,
  onAttach,
  onEmoji,
  onMic,
}: ChatComposerProps) => {
  const [value, setValue] = useState('');
  const trimmed = value.trim();

  const handleSend = () => {
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div className='flex items-center gap-2 border-t border-border bg-white px-4 py-3'>
      <button
        type='button'
        onClick={onAttach}
        aria-label='Attach file'
        className='flex size-9 shrink-0 items-center justify-center rounded-full text-grey3 hover:bg-gray-100 transition-colors cursor-pointer'
      >
        <Link2 className='size-5' />
      </button>
      <button
        type='button'
        onClick={onEmoji}
        aria-label='Add emoji'
        className='flex size-9 shrink-0 items-center justify-center rounded-full text-grey3 hover:bg-gray-100 transition-colors cursor-pointer'
      >
        <Smile className='size-5' />
      </button>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder='Type a message'
        className='h-10 flex-1 rounded-full bg-[#F1F1F1] px-4 text-sm text-grey-black placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-ring'
      />

      {/* Send when there's text, otherwise the mic affordance. */}
      {trimmed ? (
        <button
          type='button'
          onClick={handleSend}
          aria-label='Send message'
          className='flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer'
        >
          <Send className='size-4' />
        </button>
      ) : (
        <button
          type='button'
          onClick={onMic}
          aria-label='Record voice message'
          className='flex size-9 shrink-0 items-center justify-center rounded-full text-grey3 hover:bg-gray-100 transition-colors cursor-pointer'
        >
          <Mic className='size-5' />
        </button>
      )}
    </div>
  );
};

'use client';

// Internal notes and flags, for whatever they are about.
//
// One list for both kinds: a flag is a note with a reason, so splitting them
// would mean two panels showing the same shape and a reader merging them by eye
// to follow what happened. Flags carry a badge and can be cleared; ordinary
// notes are a permanent record and are deleted rather than resolved.
//
// The subject — a vendor, or one of their products — only changes the wording
// and which query the wrapper runs. Nothing here is visible to the vendor.

import { useState } from 'react';
import { Flag, Loader2, StickyNote, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/orders';
import { readApiError } from '@/redux/services/types';
import type { VendorNote } from '@/redux/services/vendor-details/vendor-details.api-slice';

const authorName = (note: VendorNote) =>
  note.author?.full_name || note.author?.email || 'An admin';

export interface NotesAndFlagsSectionProps {
  notes: VendorNote[];
  isLoading: boolean;
  isAdding: boolean;
  /** Label on the flag button, e.g. "Flag vendor" / "Flag product". */
  flagLabel: string;
  /** Toast shown after a flag is raised. */
  flaggedMessage: string;
  /** Shown when nothing has been recorded yet. */
  emptyMessage: string;
  placeholder?: string;
  onAdd: (body: string, kind: 'note' | 'flag') => Promise<unknown>;
  onResolve: (noteId: string) => Promise<unknown>;
  onDelete: (noteId: string) => Promise<unknown>;
}

export const NotesAndFlagsSection = ({
  notes,
  isLoading,
  isAdding,
  flagLabel,
  flaggedMessage,
  emptyMessage,
  placeholder = "Add a note, or describe the concern you're flagging…",
  onAdd,
  onResolve,
  onDelete,
}: NotesAndFlagsSectionProps) => {
  const [body, setBody] = useState('');

  const submit = async (kind: 'note' | 'flag') => {
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error('Write something first.');
      return;
    }
    try {
      await onAdd(trimmed, kind);
      setBody('');
      toast.success(kind === 'flag' ? flaggedMessage : 'Note added');
    } catch (error) {
      toast.error(readApiError(error));
    }
  };

  const run = async (action: Promise<unknown>, message: string) => {
    try {
      await action;
      toast.success(message);
    } catch (error) {
      toast.error(readApiError(error));
    }
  };

  return (
    <Card className="rounded-[12px] custom-card-shadow">
      <CardHeader className="px-6 pb-4">
        <CardTitle className="text-sm font-medium text-foreground">
          Notes &amp; flags
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Internal only — the vendor never sees these.
        </p>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pb-6 pt-0">
        <div className="space-y-2">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={placeholder}
            aria-label="Note body"
            rows={3}
            maxLength={2000}
            className="resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isAdding || !body.trim()}
              onClick={() => void submit('flag')}
              className="gap-1.5 text-destructive"
            >
              <Flag className="size-3.5" />
              {flagLabel}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isAdding || !body.trim()}
              onClick={() => void submit('note')}
              className="gap-1.5"
            >
              {isAdding ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <StickyNote className="size-3.5" />
              )}
              Add note
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : notes.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => {
              const isOpenFlag = note.kind === 'flag' && !note.resolved;
              return (
                <li
                  key={note._id}
                  className={cn(
                    'rounded-xl border p-3',
                    isOpenFlag
                      ? 'border-destructive/40 bg-destructive/5'
                      : 'border-border'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {note.body}
                    </p>
                    {note.kind === 'flag' && (
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          note.resolved
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-destructive/10 text-destructive'
                        )}
                      >
                        {note.resolved ? 'Resolved' : 'Flagged'}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {authorName(note)} · {timeAgo(note.createdAt)}
                    </p>
                    <div className="flex items-center gap-1">
                      {isOpenFlag && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs"
                          onClick={() =>
                            void run(onResolve(note._id), 'Flag cleared')
                          }
                        >
                          <Check className="size-3" />
                          Clear flag
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Delete note"
                        className="h-7 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          void run(onDelete(note._id), 'Note deleted')
                        }
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

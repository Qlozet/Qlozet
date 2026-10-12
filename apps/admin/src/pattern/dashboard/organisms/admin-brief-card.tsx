'use client';

import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Markdown } from '@/components/ui/markdown';
import { askAssistant } from '@/lib/assistant-bus';
import {
  useGetAdminBriefQuery,
  useMarkAdminBriefReadMutation,
} from '@/redux/services/assistant/assistant.api-slice';

/**
 * The platform's morning brief, top of the dashboard: what happened
 * yesterday and what needs a decision today, written from the same tools
 * the assistant answers with. Each recommendation's "Ask assistant" opens
 * the assistant on that exact question. Marks itself read for this admin
 * once shown; the brief is shared, the read state is not.
 */
export const AdminBriefCard = () => {
  const { data, isLoading } = useGetAdminBriefQuery();
  const [markRead] = useMarkAdminBriefReadMutation();
  const brief = data?.data?.brief ?? null;
  const unread = (data?.data?.unread ?? 0) > 0;

  useEffect(() => {
    if (brief && unread) void markRead(brief._id);
  }, [brief, unread, markRead]);

  if (isLoading || !brief) return null;

  const when = new Date(`${brief.period_key}T00:00:00`).toLocaleDateString(
    undefined,
    { weekday: 'long', day: 'numeric', month: 'short' }
  );

  return (
    <Card className="w-full rounded-[12px] custom-card-shadow">
      <CardContent className="px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[hsla(210,9%,31%,1)] dark:text-white">
              Morning brief
            </p>
            <p className="text-[11px] text-muted-foreground">{when}</p>
          </div>
        </div>

        <div className="mt-3 text-sm leading-relaxed text-foreground">
          <Markdown content={brief.summary} />
        </div>

        {brief.recommendations.length > 0 && (
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {brief.recommendations.map((rec, i) => (
              <li
                key={`${rec.label}-${i}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">
                    {rec.label}
                  </p>
                  {rec.detail && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {rec.detail}
                    </p>
                  )}
                </div>
                {rec.question && (
                  <button
                    type="button"
                    onClick={() => askAssistant(rec.question!)}
                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Sparkles className="size-3.5" />
                    Ask
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

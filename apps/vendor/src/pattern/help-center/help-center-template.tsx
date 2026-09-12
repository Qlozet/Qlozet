'use client';

// Vendor Help Center — published vendor-audience articles from the platform
// knowledge base. Featured articles lead as "Frequently asked"; the rest
// group by category as accordions. Escalation goes to the existing Support
// ticket flow.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ChevronDown,
  HelpCircle,
  Loader2,
  Search,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import { Markdown } from '@/components/ui/markdown';
import {
  useGetVendorHelpArticlesQuery,
  useSendHelpFeedbackMutation,
  type HelpArticle,
} from '@/redux/services/help-center/help-center.api-slice';

const ArticleRow = ({ article }: { article: HelpArticle }) => {
  const [open, setOpen] = useState(false);
  const [voted, setVoted] = useState<null | boolean>(null);
  const [sendFeedback] = useSendHelpFeedbackMutation();

  const vote = (helpful: boolean) => {
    if (voted !== null) return;
    setVoted(helpful);
    sendFeedback({ id: article._id, helpful }).catch(() => {});
  };

  return (
    <div className="border-b border-border/40 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[#F8F9FA] dark:hover:bg-muted/60"
      >
        <span className="text-sm font-medium text-grey-black dark:text-white">
          {article.title}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-grey3 transition-transform dark:text-gray-400',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <Markdown
            content={article.body}
            className="text-sm text-grey3 dark:text-gray-300"
          />
          <div className="mt-4 flex items-center gap-3 text-xs text-grey3 dark:text-gray-400">
            {voted === null ? (
              <>
                <span>Was this helpful?</span>
                <button
                  type="button"
                  onClick={() => vote(true)}
                  className="flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-1 transition-colors hover:text-grey-black dark:hover:text-white"
                >
                  <ThumbsUp className="size-3" /> Yes
                </button>
                <button
                  type="button"
                  onClick={() => vote(false)}
                  className="flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-1 transition-colors hover:text-grey-black dark:hover:text-white"
                >
                  <ThumbsDown className="size-3" /> No
                </button>
              </>
            ) : (
              <span>
                {voted
                  ? 'Thanks for the feedback!'
                  : 'Thanks — we’ll improve this article.'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const HelpCenterTemplate = () => {
  const {
    data: articles,
    isLoading,
    isError,
  } = useGetVendorHelpArticlesQuery();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const list = articles ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
    );
  }, [articles, query]);

  const featured = filtered.filter((a) => a.featured);
  const byCategory = useMemo(() => {
    const map = new Map<string, HelpArticle[]>();
    for (const a of filtered) {
      if (a.featured) continue;
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-grey-black dark:text-white">
          Help Center
        </h1>
        <p className="text-sm text-grey3 dark:text-gray-400">
          Guides on payouts, product approval, bespoke quotes and penalties.
          Can&apos;t find it?{' '}
          <Link
            href={APP_ROUTES.support}
            className="font-medium text-primary underline-offset-2 hover:underline dark:text-white"
          >
            Open a support ticket
          </Link>
          .
        </p>
        <div className="mt-1 flex h-11 items-center gap-2 rounded-full border border-border bg-white px-4 dark:bg-card">
          <Search className="size-4 text-grey3 dark:text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for answers…"
            className="h-full flex-1 bg-transparent text-sm text-grey-black outline-none placeholder:text-gray-400 dark:text-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-grey3 dark:text-gray-400">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading articles…
        </div>
      ) : isError ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-grey3 dark:text-gray-400">
          Could not load the help center.
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
          <HelpCircle className="mb-2 size-7 text-grey2 dark:text-gray-500" />
          <p className="text-sm font-semibold text-grey-black dark:text-white">
            {query
              ? 'No answers match your search'
              : 'Help articles are on the way'}
          </p>
          <p className="mt-1 max-w-xs text-xs text-grey3 dark:text-gray-400">
            {query
              ? 'Try a different word, or open a support ticket.'
              : 'Guides on payouts, quotes and moderation are being written.'}
          </p>
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border bg-white custom-card-shadow dark:bg-card">
              <div className="border-b border-border/60 px-5 py-3">
                <p className="text-sm font-bold text-grey-black dark:text-white">
                  Frequently asked
                </p>
              </div>
              {featured.map((a) => (
                <ArticleRow key={a._id} article={a} />
              ))}
            </div>
          )}

          {byCategory.map(([category, list]) => (
            <div
              key={category}
              className="overflow-hidden rounded-xl border border-border bg-white custom-card-shadow dark:bg-card"
            >
              <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
                <BookOpen className="size-4 text-grey3 dark:text-gray-400" />
                <p className="text-sm font-bold text-grey-black dark:text-white">
                  {category}
                </p>
              </div>
              {list.map((a) => (
                <ArticleRow key={a._id} article={a} />
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { APP_ROUTES } from '@/lib/routes';
import { Markdown } from '@/components/ui/markdown';
import {
  useGetLatestDigestQuery,
  useMarkDigestReadMutation,
} from '@/redux/services/assistant/assistant.api-slice';

// Map a recommendation's action hint to an in-app route so it becomes a task.
const ACTION_ROUTE: Record<string, string> = {
  inventory: APP_ROUTES.products,
  orders: APP_ROUTES.orders,
  earnings: APP_ROUTES.wallet,
  vendors: APP_ROUTES.vendors,
  customers: APP_ROUTES.customers,
};

/**
 * Weekly digest, shown inside the profile drawer where the design has "Task
 * Last Month" — the vendor app made the same swap, since a real AI digest beats
 * a static task list. Marks the digest read once it's been viewed here.
 *
 * Card treatment matches the vendor app's profile sections.
 */
export const WeeklyDigestSection = () => {
  const { data, isLoading } = useGetLatestDigestQuery();
  const [markRead] = useMarkDigestReadMutation();

  const digest = data?.data?.digest ?? null;
  const unread = (data?.data?.unread ?? 0) > 0;

  useEffect(() => {
    if (digest && !digest.read && unread) markRead(digest._id);
  }, [digest, unread, markRead]);

  return (
    <div className="overflow-hidden rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-muted">
      <div className="flex items-center gap-2 border-b border-[#DDE2E5] dark:border-white/10 px-5 py-4">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary/10">
          <Sparkles className="size-3.5 text-primary" />
        </span>
        <span className="text-[15px] font-semibold text-[#1C1C1E] dark:text-white">
          Weekly Digest
        </span>
      </div>

      {isLoading ? (
        <p className="px-5 py-6 text-center text-[13px] text-[#8E8E93] dark:text-gray-400">
          Loading your digest…
        </p>
      ) : !digest ? (
        <p className="px-5 py-6 text-center text-[13px] text-[#8E8E93] dark:text-gray-400">
          Your weekly digest will appear here once there&apos;s marketplace
          activity to summarise.
        </p>
      ) : (
        <div className="flex flex-col">
          {digest.summary && (
            <div className="border-b border-[#DDE2E5] dark:border-white/10 px-5 py-4 text-[13px] leading-relaxed text-[#3A3A3C] dark:text-gray-200">
              <Markdown content={digest.summary} />
            </div>
          )}

          {digest.recommendations?.length > 0 ? (
            digest.recommendations.map((recommendation, index) => {
              const route = ACTION_ROUTE[recommendation.action];
              const isLast = index === digest.recommendations.length - 1;
              const rowClass = `flex items-center justify-between gap-3 px-5 py-3.5 ${
                isLast ? '' : 'border-b border-[#DDE2E5] dark:border-white/10'
              }`;
              const label = (
                <span className="text-[14px] font-medium text-[#1C1C1E] dark:text-white">
                  {recommendation.label}
                </span>
              );

              return route ? (
                <Link
                  key={index}
                  href={route}
                  className={`${rowClass} transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.06]`}
                >
                  {label}
                  <ChevronRight className="size-4 shrink-0 text-[#8E8E93] dark:text-gray-400" />
                </Link>
              ) : (
                <div key={index} className={rowClass}>
                  {label}
                </div>
              );
            })
          ) : (
            <p className="px-5 py-4 text-[13px] text-[#8E8E93] dark:text-gray-400">
              No action items this week.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

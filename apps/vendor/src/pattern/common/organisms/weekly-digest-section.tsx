'use client';

import { FC, useEffect } from 'react';
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
  promotions: APP_ROUTES.productsDiscounts,
  earnings: APP_ROUTES.wallet,
};

/**
 * Weekly business digest, shown inside the profile sheet in place of the old
 * static "Tasks Last Month" box. Renders the AI summary + its recommendations
 * as tappable tasks. Marks the digest read once it's viewed here.
 */
const WeeklyDigestSection: FC = () => {
  const { data, isLoading } = useGetLatestDigestQuery();
  const [markRead] = useMarkDigestReadMutation();

  const digest = data?.data?.digest ?? null;
  const unread = (data?.data?.unread ?? 0) > 0;

  // Viewing the profile sheet counts as reading the digest.
  useEffect(() => {
    if (digest && !digest.read && unread) {
      markRead(digest._id);
    }
  }, [digest, unread, markRead]);

  return (
    <div className='rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] overflow-hidden'>
      <div className='px-5 py-4 border-b border-[#DDE2E5] dark:border-border flex items-center gap-2'>
        <span className='flex h-6 w-6 items-center justify-center rounded-md bg-primary/10'>
          <Sparkles className='h-3.5 w-3.5 text-primary' />
        </span>
        <span className='text-[15px] font-semibold text-[#1C1C1E] dark:text-white'>
          Weekly Digest
        </span>
      </div>

      {isLoading ? (
        <div className='px-5 py-6 text-center text-[13px] text-[#8E8E93] dark:text-gray-400'>
          Loading your digest…
        </div>
      ) : !digest ? (
        <div className='px-5 py-6 text-center text-[13px] text-[#8E8E93] dark:text-gray-400'>
          Your weekly business digest will appear here once you have sales
          activity.
        </div>
      ) : (
        <div className='flex flex-col'>
          {digest.summary && (
            <div className='px-5 py-4 border-b border-[#DDE2E5] dark:border-border text-[13px] leading-relaxed text-[#3A3A3C] dark:text-gray-200'>
              <Markdown content={digest.summary} />
            </div>
          )}

          {digest.recommendations?.length > 0 ? (
            digest.recommendations.map((r, i) => {
              const route = ACTION_ROUTE[r.action];
              const isLast = i === digest.recommendations.length - 1;
              const rowClass = `flex justify-between items-center gap-3 px-5 py-3.5 ${
                isLast ? '' : 'border-b border-[#DDE2E5] dark:border-border'
              }`;
              const label = (
                <span className='text-[14px] font-medium text-[#1C1C1E] dark:text-white'>
                  {r.label}
                </span>
              );
              return route ? (
                <Link key={i} href={route} className={`${rowClass} transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]`}>
                  {label}
                  <ChevronRight className='h-4 w-4 shrink-0 text-[#8E8E93] dark:text-gray-400' />
                </Link>
              ) : (
                <div key={i} className={rowClass}>
                  {label}
                </div>
              );
            })
          ) : (
            <div className='px-5 py-4 text-[13px] text-[#8E8E93] dark:text-gray-400'>
              No action items this week — keep it up!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyDigestSection;

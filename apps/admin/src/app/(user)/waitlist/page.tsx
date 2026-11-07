'use client';

// The pre-launch waitlist: who joined, as a shopper or a store, and whether
// they have since made an account. Totals cover the whole list; the table
// follows the filter. "Download CSV" exports the current filter. Likely bots
// (backend waitlist-bot.ts) are kept out of everything except their own view.

import { useEffect, useState, type ReactNode } from 'react';
import {
  CalendarPlus,
  Bot,
  Download,
  Loader2,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { readApiError } from '@/redux/services/types';
import { useConsoleAccess } from '@/lib/hooks/use-console-access';
import {
  useDeleteWaitlistBotsMutation,
  useGetWaitlistQuery,
  useLazyExportWaitlistQuery,
  type WaitlistParams,
} from '@/redux/services/waitlist/waitlist.api-slice';

const PAGE_SIZE = 25;
type TypeFilter = NonNullable<WaitlistParams['type']>;
const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'customer', label: 'Shoppers' },
  { value: 'vendor', label: 'Stores' },
];

const CardIcon = ({ bg, children }: { bg: string; children: ReactNode }) => (
  <div
    className={cn(
      'flex size-12 items-center justify-center rounded-[10px] text-white',
      bg
    )}
  >
    {children}
  </div>
);

const formatDay = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export default function WaitlistPage() {
  const [type, setType] = useState<TypeFilter>('all');
  const [bots, setBots] = useState(false);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const show = bots ? 'bots' : 'people';
  const { data, isLoading, isFetching, isError, error } = useGetWaitlistQuery({
    type: bots ? 'all' : type,
    show,
    search: debounced || undefined,
    page,
    size: PAGE_SIZE,
  });
  const [exportCsv, { isFetching: isExporting }] = useLazyExportWaitlistQuery();
  const [deleteBots, { isLoading: isDeleting }] =
    useDeleteWaitlistBotsMutation();
  const { can } = useConsoleAccess();
  const canDelete = can('customers', 'delete');

  const rows = data?.data ?? [];
  const totals = data?.totals;
  const matching = data?.total_items ?? 0;
  const from = matching ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = (page - 1) * PAGE_SIZE + rows.length;

  const onDownload = async () => {
    try {
      const csv = await exportCsv({
        type: bots ? 'all' : type,
        show,
        search: debounced || undefined,
      }).unwrap();
      const url = URL.createObjectURL(
        new Blob([csv], { type: 'text/csv;charset=utf-8' })
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = `qlozet-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(readApiError(e, 'Could not download the waitlist.'));
    }
  };

  const onDeleteBots = async () => {
    const n = totals?.likely_bots ?? 0;
    if (
      !window.confirm(
        `Delete all ${n.toLocaleString()} likely bots from the waitlist? This cannot be undone.`
      )
    )
      return;
    try {
      const res = await deleteBots().unwrap();
      toast.success(`Deleted ${res.deleted.toLocaleString()} bots.`);
      setBots(false);
      setPage(1);
    } catch (e) {
      toast.error(readApiError(e, 'Could not delete the bots.'));
    }
  };

  const fmt = (n?: number) =>
    typeof n === 'number' ? n.toLocaleString() : '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        {/* The top bar titles the page from its route. */}
        <p className="text-sm text-grey3 dark:text-gray-400">
          People who joined before launch. &ldquo;Signed up&rdquo; means they
          have since made an account with the same email, so the rest are the
          ones to reach out to.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="On the waitlist"
          value={fmt(totals?.total)}
          icon={
            <CardIcon bg="bg-[#57CAEB]">
              <Users className="size-6" />
            </CardIcon>
          }
        />
        <MetricCard
          title="Shoppers"
          value={fmt(totals?.customers)}
          icon={
            <CardIcon bg="bg-[#5DDAB4]">
              <ShoppingBag className="size-6" />
            </CardIcon>
          }
        />
        <MetricCard
          title="Stores"
          value={fmt(totals?.vendors)}
          icon={
            <CardIcon bg="bg-[#FF8F6B]">
              <Store className="size-6" />
            </CardIcon>
          }
        />
        <MetricCard
          title="Joined this week"
          value={fmt(totals?.this_week)}
          subLabel="last 7 days"
          icon={
            <CardIcon bg="bg-[#9A55FF]">
              <CalendarPlus className="size-6" />
            </CardIcon>
          }
        />
      </div>

      <section className="rounded-xl border bg-white p-4 custom-card-shadow dark:border-white/10 dark:bg-card lg:p-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Who joined"
          >
            {TYPE_TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={!bots && type === t.value}
                onClick={() => {
                  setType(t.value);
                  setBots(false);
                  setPage(1);
                }}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  !bots && type === t.value
                    ? 'border-primary bg-primary text-white'
                    : 'border-border text-grey3 hover:border-primary dark:text-gray-300'
                )}
              >
                {t.label}
              </button>
            ))}
            {!!totals?.likely_bots && (
              <button
                type="button"
                role="tab"
                aria-selected={bots}
                onClick={() => {
                  setBots(true);
                  setPage(1);
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  bots
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-amber-300 text-amber-700 hover:border-amber-600 dark:border-amber-700 dark:text-amber-400'
                )}
              >
                <Bot className="size-3.5" />
                Likely bots · {fmt(totals.likely_bots)}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey3" />
              <Input
                id="waitlist-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or business"
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onDownload}
              disabled={isExporting || !matching}
            >
              {isExporting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download />
              )}
              Download CSV
            </Button>
          </div>
        </div>

        {bots && (
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-200 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Random-letter names or emails stuffed with dots. They are left out
              of the totals and the CSV. Don&rsquo;t email them: the messages
              reach strangers and hurt Qlozet&rsquo;s email delivery.
            </p>
            {canDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDeleteBots}
                disabled={isDeleting || !totals?.likely_bots}
                className="shrink-0"
              >
                {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                Delete all bots
              </Button>
            )}
          </div>
        )}

        {isError ? (
          <p className="py-10 text-center text-sm text-destructive">
            {readApiError(error, 'Could not load the waitlist.')}
          </p>
        ) : isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        ) : !rows.length ? (
          <p className="py-10 text-center text-sm text-grey3">
            {bots
              ? 'No likely bots.'
              : debounced || type !== 'all'
                ? 'Nobody matches this filter.'
                : 'Nobody has joined the waitlist yet.'}
          </p>
        ) : (
          <div className={cn('overflow-x-auto', isFetching && 'opacity-60')}>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-grey3 dark:border-white/10">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">Phone</th>
                  <th className="py-2 pr-3 font-medium">Joined as</th>
                  <th className="py-2 pr-3 font-medium">Business</th>
                  <th className="py-2 pr-3 font-medium">Joined</th>
                  <th className="py-2 font-medium">Signed up</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={`${r.type}-${r.email}`}
                    className="border-b last:border-0 dark:border-white/10"
                  >
                    <td className="py-3 pr-3 font-medium text-grey-black dark:text-white">
                      {r.fullName}
                    </td>
                    <td className="py-3 pr-3">
                      <a
                        href={`mailto:${r.email}`}
                        className="text-primary hover:underline"
                      >
                        {r.email}
                      </a>
                    </td>
                    <td className="py-3 pr-3 tabular-nums">
                      {r.phoneNumber || '—'}
                    </td>
                    <td className="py-3 pr-3">
                      {r.type === 'vendor' ? 'Store' : 'Shopper'}
                    </td>
                    <td className="py-3 pr-3">
                      {r.businessName ? (
                        <>
                          {r.businessName}
                          {r.businessType && (
                            <span className="block text-xs text-grey3">
                              {r.businessType}
                            </span>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      {formatDay(r.createdAt)}
                    </td>
                    <td className="py-3">
                      {r.signed_up ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Signed up
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-grey3 dark:bg-white/10 dark:text-gray-300">
                          Not yet
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {matching > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-grey3">
            <span className="tabular-nums">
              {from}–{to} of {matching.toLocaleString()}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!data?.has_next_page || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

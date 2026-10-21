'use client';

// Body Measurement card — order drawer and item modal.
// Reads GET /orders/:reference/measurements: the ORDER-TIME snapshot when the
// order carries one (set name shown, e.g. "For Tolu"), or the customer's live
// active set for legacy orders. The snapshot is what the garment must be sewn
// to — the customer may have switched or edited their profile since ordering.
// Shows how and when the numbers were taken, lets the tailor print them, and
// lets them ask the customer before cutting (the answer corrects the copy).

import { useMemo, useState } from 'react';
import { Lock, MessageCircleQuestion, Printer, Ruler } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  FIT_PREFERENCE_LABEL,
  MEASUREMENT_DEFINITIONS,
  MEASUREMENT_METHOD,
  measurementLabel,
} from '@/lib/measurement-labels';
import { printMeasurementSheet } from '@/lib/print-measurements';
import {
  useAskMeasurementQuestionMutation,
  useGetOrderMeasurementsQuery,
  type MeasurementQuestion,
} from '@/redux/services/orders/orders.api-slice';
import { readApiError } from '@/redux/services/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Unit = 'cm' | 'in';

const convert = (value: number, from: 'cm' | 'inch', to: Unit): number => {
  const toUnit = to === 'in' ? 'inch' : 'cm';
  if (from === toUnit) return value;
  return toUnit === 'inch' ? value / 2.54 : value * 2.54;
};

const formatValue = (n: number): string =>
  Number.isInteger(n) ? `${n}` : n.toFixed(1);

const shortDate = (iso?: string | null): string | null =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

const prettyBodyType = (t?: string | null): string | null =>
  t && t !== 'unclassified'
    ? t.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
    : null;

const recordedRows = (m: Record<string, number> | undefined) =>
  Object.entries(m ?? {})
    .filter(([, v]) => typeof v === 'number' && !Number.isNaN(v) && v > 0)
    .map(([key, v]) => ({ key, label: measurementLabel(key), value: v }));

/** Per-measurement provenance saved with the snapshot (schema v2 sets). */
export type TailoringMeta = Record<
  string,
  { tier?: string; mae_cm?: number | null; method?: string }
>;

interface Provenance {
  tailoring_meta?: TailoringMeta | null;
  method?: string | null;
  measured_at?: string | null;
  updated_by_customer_at?: string | null;
  body_type?: string | null;
  fit_preferences?: string[];
}

const verifyKeysOf = (meta?: TailoringMeta | null): string[] =>
  Object.entries(meta ?? {})
    .filter(([, m]) => m?.tier === 'rough')
    .map(([k]) => k);

const MeasurementGrid = ({
  measurements,
  fromUnit,
  unit,
  meta,
}: {
  measurements: Record<string, number> | undefined;
  fromUnit: 'cm' | 'inch';
  unit: Unit;
  /** When present, rough values get a "Verify" badge — measure the customer. */
  meta?: TailoringMeta | null;
}) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
    {recordedRows(measurements).map((row) => {
      const m = meta?.[row.key];
      const rough = m?.tier === 'rough';
      const estimated = m?.tier === 'estimated';
      const corrected =
        m?.method === 'customer_correction' || m?.method === 'customer_edit';
      const hint = [
        MEASUREMENT_DEFINITIONS[row.key],
        rough
          ? 'Rough estimate — verify with the customer before cutting.'
          : estimated
            ? 'Derived from other measurements, not measured directly.'
            : corrected
              ? 'Entered by the customer.'
              : undefined,
        typeof m?.mae_cm === 'number'
          ? `Typical error: ±${m.mae_cm} cm.`
          : undefined,
      ]
        .filter(Boolean)
        .join(' ');
      return (
        <div
          key={row.key}
          className="flex items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] dark:border-border bg-white dark:bg-[#404040] px-3.5 py-2.5"
          title={hint || undefined}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm text-gray-600 dark:text-gray-300">
              {row.label}
            </span>
            {rough && (
              <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Verify
              </span>
            )}
          </span>
          <span className="shrink-0 text-sm font-semibold text-grey-black dark:text-white">
            {formatValue(convert(row.value, fromUnit, unit))}
            <span className="ml-0.5 text-xs font-normal text-grey3">
              {unit}
            </span>
          </span>
        </div>
      );
    })}
  </div>
);

/** How and when the numbers were taken, and anything the customer changed. */
const ProvenanceLine = ({ p }: { p: Provenance }) => {
  const method = p.method ? MEASUREMENT_METHOD[p.method] : null;
  const measured = shortDate(p.measured_at);
  const corrected = shortDate(p.updated_by_customer_at);
  const bodyType = prettyBodyType(p.body_type);
  const fits = (p.fit_preferences ?? []).map(FIT_PREFERENCE_LABEL);
  if (!method && !measured && !corrected && !bodyType && !fits.length)
    return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {method && (
        <span
          title={method.hint}
          className={cn(
            'rounded-md px-2 py-0.5 font-medium',
            method.tone === 'good' &&
              'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
            method.tone === 'warn' &&
              'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
            method.tone === 'neutral' &&
              'bg-gray-100 text-gray-700 dark:bg-[#404040] dark:text-gray-200'
          )}
        >
          {method.label}
        </span>
      )}
      {measured && (
        <span className="text-grey3 dark:text-gray-400">Taken {measured}</span>
      )}
      {corrected && (
        <span className="rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          Corrected by the customer {corrected}
        </span>
      )}
      {bodyType && (
        <span className="text-grey3 dark:text-gray-400">
          · {bodyType} build
        </span>
      )}
      {fits.length > 0 && (
        <span className="text-grey3 dark:text-gray-400">
          · Likes a {fits.join(', ').toLowerCase()} fit
        </span>
      )}
    </div>
  );
};

/** The tailor's question and the customer's answer, newest first. */
const QuestionThread = ({
  questions,
}: {
  questions: MeasurementQuestion[];
}) => {
  if (!questions.length) return null;
  return (
    <div className="space-y-2">
      {[...questions].reverse().map((q) => (
        <div
          key={q._id}
          className={cn(
            'rounded-xl border px-3 py-2.5 text-xs',
            q.status === 'open'
              ? 'border-amber-200 bg-amber-50/70 dark:border-amber-800/50 dark:bg-amber-950/20'
              : 'border-border bg-white dark:bg-[#404040]'
          )}
        >
          <p className="font-medium text-grey-black dark:text-white">
            {q.status === 'open'
              ? 'Waiting for the customer'
              : `Answered ${shortDate(q.answered_at) ?? ''}`}
          </p>
          <p className="mt-1 text-grey3 dark:text-gray-300">
            You asked: “{q.message}”
          </p>
          {q.status === 'answered' && (
            <div className="mt-1 space-y-0.5 text-grey-black dark:text-white">
              {q.changes.length > 0 ? (
                <p>
                  Changed:{' '}
                  {q.changes
                    .map(
                      (c) =>
                        `${measurementLabel(c.body_part)} ${c.from ?? '—'} → ${c.to}`
                    )
                    .join(', ')}
                </p>
              ) : (
                <p>No numbers changed.</p>
              )}
              {q.answer_message && <p>“{q.answer_message}”</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const AskDialog = ({
  open,
  onOpenChange,
  reference,
  itemId,
  keys,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: string;
  itemId: string | null;
  keys: string[];
}) => {
  const [picked, setPicked] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [ask, { isLoading }] = useAskMeasurementQuestionMutation();

  const toggle = (k: string) =>
    setPicked((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );

  const send = async () => {
    if (message.trim().length < 10) {
      toast.error('Say what you need to check (at least 10 characters).');
      return;
    }
    try {
      await ask({
        reference,
        item_id: itemId,
        body_parts: picked,
        message: message.trim(),
      }).unwrap();
      toast.success('Question sent. We’ll tell you when the customer answers.');
      setPicked([]);
      setMessage('');
      onOpenChange(false);
    } catch (err) {
      toast.error(readApiError(err, 'Could not send the question.'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ask about these measurements</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The customer gets a notification and an email, and can correct the
            numbers for this order. Made-to-order pieces can’t be returned, so
            check before you cut.
          </p>
          <div>
            <p className="mb-2 text-sm font-medium">
              Which measurements? (optional)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {keys.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggle(k)}
                  aria-pressed={picked.includes(k)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs transition-colors',
                    picked.includes(k)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-grey-black hover:border-primary/50 dark:text-white'
                  )}
                >
                  {measurementLabel(k)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="measurement-question"
              className="mb-2 block text-sm font-medium"
            >
              Your question
            </label>
            <Textarea
              id="measurement-question"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={600}
              rows={4}
              placeholder="e.g. Your waist is 20 cm smaller than your hips, which is unusual. Could you measure it again around the navel?"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="button" onClick={send} disabled={isLoading}>
              {isLoading ? 'Sending…' : 'Send question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/** Print, and ask the customer (when this is a locked order copy). */
const MeasurementActions = ({
  reference,
  itemId,
  setName,
  productName,
  unit,
  measurements,
  provenance,
  questions,
  canAsk,
}: {
  reference: string;
  itemId: string | null;
  setName?: string | null;
  productName?: string | null;
  unit: 'cm' | 'inch';
  measurements: Record<string, number>;
  provenance: Provenance;
  questions: MeasurementQuestion[];
  canAsk: boolean;
}) => {
  const [asking, setAsking] = useState(false);
  const waiting = questions.some((q) => q.status === 'open');
  const keys = recordedRows(measurements).map((r) => r.key);

  const print = () => {
    const ok = printMeasurementSheet({
      orderReference: reference,
      setName,
      productName,
      unit,
      measurements,
      method: provenance.method,
      measuredAt: provenance.measured_at,
      correctedAt: provenance.updated_by_customer_at,
      bodyType: prettyBodyType(provenance.body_type),
      fitPreferences: (provenance.fit_preferences ?? []).map(
        FIT_PREFERENCE_LABEL
      ),
      verifyKeys: verifyKeysOf(provenance.tailoring_meta),
    });
    if (!ok) toast.error('Allow pop-ups for this site to print the sheet.');
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={print}
          className="gap-1.5"
        >
          <Printer className="size-3.5" />
          Print
        </Button>
        {canAsk && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAsking(true)}
            disabled={waiting}
            title={
              waiting
                ? 'You have a question waiting for the customer.'
                : undefined
            }
            className="gap-1.5"
          >
            <MessageCircleQuestion className="size-3.5" />
            {waiting
              ? 'Waiting for the customer'
              : 'Ask about these measurements'}
          </Button>
        )}
      </div>
      <QuestionThread questions={questions} />
      {canAsk && (
        <AskDialog
          open={asking}
          onOpenChange={setAsking}
          reference={reference}
          itemId={itemId}
          keys={keys}
        />
      )}
    </>
  );
};

const UnitSwitch = ({
  unit,
  onChange,
  small,
}: {
  unit: Unit;
  onChange: (u: Unit) => void;
  small?: boolean;
}) => (
  <div
    className={cn(
      'inline-flex items-center rounded-full bg-white dark:bg-[#404040] text-xs font-semibold',
      small ? 'p-0.5' : 'p-1'
    )}
  >
    {(['cm', 'in'] as const).map((u) => (
      <button
        key={u}
        type="button"
        onClick={() => onChange(u)}
        className={cn(
          'cursor-pointer rounded-full uppercase transition-colors',
          small ? 'px-2.5 py-0.5' : 'px-3 py-1',
          unit === u
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500'
        )}
      >
        {u}
      </button>
    ))}
  </div>
);

const LockedBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
    <Lock className="size-3" /> Locked at order time
  </span>
);

/**
 * Per-item measurements block — for the item DETAIL modal. Renders straight
 * from the order item's embedded `body_profile` snapshot: who the garment is
 * sewn to, how the numbers were taken, the grid with a cm/in toggle, and
 * (given the order reference) Print and Ask.
 */
export const ItemBodyMeasurements = ({
  profile,
  reference,
  itemId,
  productName,
  quote,
}: {
  profile: Provenance & {
    set_name?: string | null;
    unit?: string;
    measurements?: Record<string, number>;
  };
  reference?: string;
  itemId?: string | null;
  productName?: string | null;
  /** A quote request: the customer's current set, locked only when they accept. */
  quote?: boolean;
}) => {
  const [unit, setUnit] = useState<Unit>('cm');
  const { data } = useGetOrderMeasurementsQuery(reference ?? '', {
    skip: !reference,
  });
  // The fetched copy is fresher (it carries the customer's corrections).
  const fresh = (data?.items ?? []).find((i) => itemId && i.item_id === itemId);
  const shown = fresh ?? profile;
  const rows = recordedRows(shown?.measurements);
  if (rows.length === 0) return null;
  const questions = (data?.questions ?? []).filter(
    (q) => itemId && q.item_id === itemId
  );

  return (
    <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-950/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <Ruler className="size-3.5" />
            {quote ? 'Measurements' : 'Sewn to'}
            {shown.set_name
              ? `: ${shown.set_name}`
              : quote
                ? ''
                : ' these measurements'}
          </h4>
          {quote ? (
            <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              Locked when the customer accepts
            </span>
          ) : (
            <LockedBadge />
          )}
        </div>
        <UnitSwitch unit={unit} onChange={setUnit} small />
      </div>
      <ProvenanceLine p={shown} />
      <MeasurementGrid
        measurements={shown.measurements}
        fromUnit={(shown.unit as 'cm' | 'inch') ?? 'cm'}
        unit={unit}
        meta={shown.tailoring_meta}
      />
      {reference && (
        <MeasurementActions
          reference={reference}
          itemId={itemId ?? null}
          setName={shown.set_name}
          productName={productName}
          unit={(shown.unit as 'cm' | 'inch') ?? 'cm'}
          measurements={shown.measurements ?? {}}
          provenance={shown}
          questions={questions}
          canAsk={Boolean(itemId)}
        />
      )}
    </div>
  );
};

export const OrderMeasurementsCard = ({ reference }: { reference: string }) => {
  const { data, isLoading } = useGetOrderMeasurementsQuery(reference, {
    skip: !reference,
  });
  const [unit, setUnit] = useState<Unit>('cm');

  // Per-garment profiles when the order carries items for different bodies
  // (asoebi/family orders). Falls back to the single order-level profile.
  const itemProfiles = useMemo(
    () =>
      (data?.items ?? []).filter(
        (i) => recordedRows(i.measurements).length > 0
      ),
    [data]
  );
  const distinctSets = new Set(itemProfiles.map((i) => i.set_name ?? ''));
  const perGarment = itemProfiles.length > 0 && distinctSets.size > 1;

  // Only the measurements that are actually recorded (present + non-zero).
  const rows = useMemo(() => recordedRows(data?.measurements), [data]);

  if (isLoading) {
    return (
      <section className="space-y-3 rounded-xl border bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-[#404040]" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-xl bg-gray-200 dark:bg-[#404040]"
            />
          ))}
        </div>
      </section>
    );
  }

  // No measurements recorded — the section has no place in the drawer.
  if (!data || (rows.length === 0 && itemProfiles.length === 0)) return null;
  const questions = data.questions ?? [];
  // One body for the whole order: ask about the (first) line's copy, which
  // the server keeps in step with the order's own.
  const soleItemId = itemProfiles[0]?.item_id ?? null;

  return (
    <section className="space-y-4 rounded-xl border bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-grey-black dark:text-white">
          <Ruler className="size-4 text-primary" />
          Body Measurement
        </h3>
        <UnitSwitch unit={unit} onChange={setUnit} />
      </div>

      {perGarment ? (
        /* Different bodies in one order — one block per garment. */
        <div className="space-y-5">
          {itemProfiles.map((item, idx) => (
            <div key={item.item_id ?? idx} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-grey-black dark:text-white">
                  {item.set_name || 'Measurements'}
                </span>
                {item.product_name && (
                  <span className="text-xs text-grey3 dark:text-gray-400">
                    · {item.product_name}
                  </span>
                )}
                <LockedBadge />
              </div>
              <ProvenanceLine p={item} />
              <MeasurementGrid
                measurements={item.measurements}
                fromUnit={item.unit ?? 'cm'}
                unit={unit}
                meta={item.tailoring_meta}
              />
              <MeasurementActions
                reference={reference}
                itemId={item.item_id ?? null}
                setName={item.set_name}
                productName={item.product_name}
                unit={item.unit ?? 'cm'}
                measurements={item.measurements}
                provenance={item}
                questions={questions.filter((q) => q.item_id === item.item_id)}
                canAsk={Boolean(item.item_id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Whose measurements + whether they're frozen to this order. */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-grey-black dark:text-white">
              {data.name || 'Measurements'}
            </span>
            {data.snapshot ? (
              <LockedBadge />
            ) : (
              <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                Live profile — may change
              </span>
            )}
          </div>
          <ProvenanceLine p={data} />

          <MeasurementGrid
            measurements={data.measurements}
            fromUnit={data.unit ?? 'cm'}
            unit={unit}
            meta={data.tailoring_meta}
          />
          <MeasurementActions
            reference={reference}
            itemId={soleItemId}
            setName={data.name}
            unit={data.unit ?? 'cm'}
            measurements={data.measurements}
            provenance={data}
            questions={questions.filter(
              (q) => !q.item_id || q.item_id === soleItemId
            )}
            canAsk={Boolean(data.snapshot)}
          />
        </>
      )}
    </section>
  );
};

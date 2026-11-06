'use client';

// Measurement accuracy: what the measurement system has collected so far.
// Corrections (each time a number we had was replaced by a better one) show
// how far off each body part runs; fit feedback shows where delivered
// made-to-fit pieces were off. Read-only. Nothing is corrected automatically
// yet; a part becomes "Ready" once it has enough corrections of estimates.

import { Ruler, Shirt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { prettify } from '@/pattern/customers/details/molecules/measurement-panel';
import {
  DEFAULT_MIN_SAMPLES,
  FIT_OUTCOMES,
  FIT_OUTCOME_LABELS,
  biasWord,
  fitIssueSentence,
  formatBias,
  formatError,
  garmentWord,
  readiness,
  sourceLabel,
  sumCounts,
  type AccuracyStats,
  type MeasurementAccuracy,
} from '@/lib/measurement-accuracy';
import { useGetMeasurementAccuracyQuery } from '@/redux/services/dashboard/dashboard.api-slice';

const CARD = 'w-full rounded-[12px] custom-card-shadow';

const SectionTitle = ({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
}) => (
  <div className="mb-4">
    <h2 className="flex items-center gap-2 text-base font-semibold text-[hsla(210,9%,31%,1)] dark:text-white">
      {icon}
      {title}
    </h2>
    {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
  </div>
);

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="rounded-xl border px-4 py-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
      {value}
    </p>
  </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
    {children}
  </p>
);

/** "+1.2 cm · runs small" */
const Bias = ({ stats }: { stats: AccuracyStats | null }) => {
  if (!stats) return <span className="text-muted-foreground">—</span>;
  const word = biasWord(stats.bias_cm);
  return (
    <span className="whitespace-nowrap tabular-nums">
      {formatBias(stats.bias_cm)}
      {word && (
        <span
          className={cn(
            'ml-1.5 text-xs',
            word === 'about right'
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-amber-700 dark:text-amber-400'
          )}
        >
          {word}
        </span>
      )}
    </span>
  );
};

const Readiness = ({
  part,
  min,
}: {
  part: MeasurementAccuracy['corrections']['parts'][number];
  min: number;
}) => {
  const r = readiness(part, min);
  return (
    <div className="min-w-[110px]">
      <span
        className={cn(
          'text-xs font-medium',
          r.ready
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-muted-foreground'
        )}
      >
        {r.label}
      </span>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full',
            r.ready ? 'bg-emerald-500' : 'bg-primary/60'
          )}
          style={{ width: `${r.percent}%` }}
        />
      </div>
    </div>
  );
};

const Corrections = ({ data }: { data: MeasurementAccuracy }) => {
  const c = data.corrections;
  const min = data.min_samples_to_calibrate || DEFAULT_MIN_SAMPLES;
  const sources = Object.entries(c.by_source ?? {});
  return (
    <Card className={CARD}>
      <CardContent className="px-6 py-5">
        <SectionTitle
          icon={<Ruler className="size-4 text-primary" />}
          title="Corrections collected"
          hint="Each time a number we had was replaced: a customer answering a tailor’s question with a different number, or typing over an estimated value in their profile."
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total corrections" value={c.total ?? 0} />
          {sources.length > 0 ? (
            sources.map(([source, n]) => (
              <Stat key={source} label={sourceLabel(source)} value={n} />
            ))
          ) : (
            <>
              <Stat label={sourceLabel('tailor_question')} value={0} />
              <Stat label={sourceLabel('profile_edit')} value={0} />
            </>
          )}
          <Stat label="Left out as slips" value={c.left_out_as_slips ?? 0} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          A change of more than 35% is treated as a slip (a typo, the wrong
          unit) and left out of the averages below.
        </p>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">
            By body part
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Average off is the corrected number minus ours: positive means our
            number ran small. Typical error is the average size of a change
            either way. A part is ready to calibrate once {min} estimated values
            have been corrected.
          </p>
          {c.parts?.length ? (
            <div className="mt-3 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead rowSpan={2}>Body part</TableHead>
                    <TableHead colSpan={4} className="text-center">
                      Estimated values
                    </TableHead>
                    <TableHead colSpan={3} className="text-center">
                      Measured values
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-right">Corrected</TableHead>
                    <TableHead>Average off</TableHead>
                    <TableHead>Typical error</TableHead>
                    <TableHead>Calibration</TableHead>
                    <TableHead className="text-right">Corrected</TableHead>
                    <TableHead>Average off</TableHead>
                    <TableHead>Typical error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.parts.map((p) => (
                    <TableRow key={p.part}>
                      <TableCell className="font-medium">
                        {prettify(p.part)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {p.estimated?.count ?? 0}
                      </TableCell>
                      <TableCell>
                        <Bias stats={p.estimated} />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatError(p.estimated?.mae_cm)}
                      </TableCell>
                      <TableCell>
                        <Readiness part={p} min={min} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {p.measured?.count ?? 0}
                      </TableCell>
                      <TableCell>
                        <Bias stats={p.measured} />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatError(p.measured?.mae_cm)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="mt-3">
              <Empty>
                No corrections yet. They arrive as customers answer tailors’
                questions and edit estimated measurements.
              </Empty>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Fit = ({ data }: { data: MeasurementAccuracy }) => {
  const outcomes = data.fit?.outcomes ?? {};
  const total = sumCounts(outcomes);
  const issues = (data.fit?.issues ?? []).slice(0, 12);
  return (
    <Card className={CARD}>
      <CardContent className="px-6 py-5">
        <SectionTitle
          icon={<Shirt className="size-4 text-primary" />}
          title="How pieces fit"
          hint="From customers’ fit feedback on delivered made-to-fit pieces (bespoke and custom). This measures the tailor’s cut, not the customer’s body."
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Feedback received" value={total} />
          {FIT_OUTCOMES.map((o) => {
            const n = outcomes[o] ?? 0;
            return (
              <Stat
                key={o}
                label={FIT_OUTCOME_LABELS[o]}
                value={total ? `${n} (${Math.round((n / total) * 100)}%)` : n}
              />
            );
          })}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">
            Top fit issues
          </h3>
          {issues.length ? (
            <div className="mt-3 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead>Garment</TableHead>
                    <TableHead className="text-right">Times</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((i) => (
                    <TableRow key={`${i.area}-${i.problem}-${i.garment ?? ''}`}>
                      <TableCell className="font-medium">
                        {fitIssueSentence(i)}
                      </TableCell>
                      <TableCell>{garmentWord(i.garment)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {i.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="mt-3">
              <Empty>
                No fit issues reported yet. Customers can say where a piece was
                off once their order is delivered.
              </Empty>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const MeasurementAccuracyView = () => {
  const { data, isLoading, isError } = useGetMeasurementAccuracyQuery();
  // The service's { data } envelope may or may not be stripped.
  const raw = data?.data as unknown as
    | (MeasurementAccuracy & { data?: MeasurementAccuracy })
    | undefined;
  const accuracy: MeasurementAccuracy | undefined = raw?.corrections
    ? raw
    : raw?.data;

  return (
    <div className="w-full min-h-screen h-fit space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[hsla(210,9%,31%,1)] dark:text-white">
          Measurement accuracy
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          What we are learning about our measurements. Nothing is corrected
          automatically yet: this page shows what is being collected and when a
          body part has enough data to start correcting new estimates.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-[12px]" />
          <Skeleton className="h-48 w-full rounded-[12px]" />
        </div>
      ) : isError || !accuracy ? (
        <Empty>Could not load measurement accuracy. Try again shortly.</Empty>
      ) : (
        <>
          <Corrections data={accuracy} />
          <Fit data={accuracy} />
        </>
      )}
    </div>
  );
};

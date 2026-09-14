'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useGetCustomerDemographicsQuery,
  type DemographicsDistributionItem,
} from '@/redux/services/customers/customers.api-slice';
import { ChartSkeleton } from '@/pattern/dashboard/molecules/chart-skeleton';
import { ChartEmptyState } from '@/pattern/dashboard/molecules/chart-empty-state';

// ─────────────────────────────────────────────────────────────────────
// Customer insights — wired to GET /business/customers/demographics.
// Renders EVERYTHING the endpoint sends: top locations (count + share on
// the bar), gender split and wears-preference donuts, and the age × gender
// chart — which only appears once customers have provided a date of birth
// (until then the donuts carry the slot instead of a permanent empty state).
// ─────────────────────────────────────────────────────────────────────

// Segment palette: the same theme-aware --chart-N ramp the dashboard's
// donut charts use (brown scale in light mode, grayscale in dark).
const SEGMENT_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const prettyLabel = (label: string) =>
  (label ?? 'unspecified').toString().replace(/[_-]/g, ' ');

// ── Shared tooltip: name, count and share ──
const InsightTooltip = ({ active, payload, total }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const name =
    entry?.payload?.label ?? entry?.payload?.location ?? entry?.name ?? '';
  const value = Number(entry?.value) || 0;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="bg-white dark:bg-muted font-poppins p-2 border border-gray-200 dark:border-border rounded-xl shadow-lg">
      <p className="text-sm font-medium capitalize text-gray-900 dark:text-white">
        {prettyLabel(String(name))}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {value.toLocaleString()} customer{value === 1 ? '' : 's'} · {pct}%
      </p>
    </div>
  );
};

// ── Locations — horizontal bars, count · share printed on each bar ──

const MAX_LOCATION_ROWS = 8;

export const CustomerDemographicsChart = ({
  className,
}: {
  className?: string;
}) => {
  const { data, isLoading } = useGetCustomerDemographicsQuery();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  const topLocations = data?.topLocations ?? [];
  const totalCustomers = data?.totalCustomers ?? 0;
  const hasData =
    topLocations.length > 0 &&
    topLocations.some((loc) => loc.customerCount > 0);

  const head = topLocations.slice(0, MAX_LOCATION_ROWS);
  const tail = topLocations.slice(MAX_LOCATION_ROWS);
  const chartData = head.map((loc) => ({
    location: (loc.location ?? 'Unknown').toString().toUpperCase(),
    customerCount: loc.customerCount,
  }));
  if (tail.length > 0) {
    chartData.push({
      location: 'OTHERS',
      customerCount: tail.reduce((sum, l) => sum + (l.customerCount ?? 0), 0),
    });
  }
  const counted = chartData.reduce((s, d) => s + d.customerCount, 0);
  const shareBase = counted > 0 ? counted : 1;

  return (
    <Card
      className={`w-full rounded-[12px] custom-card-shadow ${className ?? ''}`}
    >
      <CardHeader className="px-6 pb-4">
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
          Customer Locations
        </CardTitle>
        {hasData && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Based on {totalCustomers.toLocaleString()} customer
            {totalCustomers === 1 ? '' : 's'}
          </p>
        )}
      </CardHeader>
      <CardContent className="w-full font-poppins pl-3 pr-8 pt-0 pb-6">
        <ChartEmptyState
          isEmpty={!hasData}
          variant="bar"
          description="Location insights will appear here as customers place orders"
        >
          <ResponsiveContainer
            width="100%"
            height={Math.max(180, chartData.length * 34 + 20)}
          >
            <BarChart
              data={chartData}
              layout="vertical"
              barGap={2}
              margin={{ left: 0, right: 72, top: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="location"
                type="category"
                width={92}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: 'var(--foreground)',
                  fontSize: 10,
                  fontWeight: 500,
                }}
              />
              <Tooltip
                content={<InsightTooltip total={shareBase} />}
                cursor={false}
              />
              <Bar
                dataKey="customerCount"
                fill="var(--chart-primary)"
                maxBarSize={22}
                radius={[0, 2.26, 2.26, 0]}
              >
                {/* Count · share at the bar's end — no hover needed */}
                <LabelList
                  dataKey="customerCount"
                  position="right"
                  formatter={(value: React.ReactNode) => {
                    const n = Number(value) || 0;
                    return `${n} · ${Math.round((n / shareBase) * 100)}%`;
                  }}
                  style={{
                    fill: 'var(--foreground)',
                    fontSize: 10,
                    fontWeight: 500,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartEmptyState>
      </CardContent>
    </Card>
  );
};

// ── Donut card — gender split and wears preference share this shape ──

const DistributionDonut = ({
  title,
  emptyDescription,
  items,
  className,
}: {
  title: string;
  emptyDescription: string;
  items: DemographicsDistributionItem[];
  className?: string;
}) => {
  const clean = (items ?? []).filter((i) => (i?.value ?? 0) > 0);
  const total = clean.reduce((sum, i) => sum + i.value, 0);
  const hasData = total > 0;

  return (
    <Card
      className={`w-full rounded-[12px] custom-card-shadow ${className ?? ''}`}
    >
      <CardHeader className="px-6 pb-2">
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full font-poppins px-6 pt-0 pb-6">
        <ChartEmptyState
          isEmpty={!hasData}
          variant="pie"
          description={emptyDescription}
        >
          <div className="flex items-center gap-4">
            <div className="relative h-[150px] w-[150px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<InsightTooltip total={total} />} />
                  <Pie
                    data={clean.map((i) => ({
                      label: i.label,
                      value: i.value,
                    }))}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={46}
                    outerRadius={70}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {clean.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={SEGMENT_COLORS[idx % SEGMENT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center total */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold text-foreground">
                  {total.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  customers
                </span>
              </div>
            </div>
            {/* Legend with values + shares */}
            <ul className="flex min-w-0 flex-1 flex-col gap-2">
              {clean.map((item, idx) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      background: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate capitalize text-foreground">
                    {prettyLabel(item.label)}
                  </span>
                  <span className="shrink-0 tabular-nums text-gray-400 dark:text-gray-500">
                    {item.value} · {Math.round((item.value / total) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ChartEmptyState>
      </CardContent>
    </Card>
  );
};

// ── Age × gender — renders ONLY once real age data exists ──

const MALE_COLOR = 'var(--chart-1)';
const FEMALE_COLOR = 'var(--chart-3)';

export const CustomerAgeGenderChart = ({
  className,
}: {
  className?: string;
}) => {
  const { data, isLoading } = useGetCustomerDemographicsQuery();

  if (isLoading) return null; // the section skeleton covers loading

  const ageGenderData = data?.ageGenderDistribution ?? [];
  const hasData =
    ageGenderData.length > 0 &&
    ageGenderData.some((d) => d.male > 0 || d.female > 0);

  // No DOBs yet → the donuts carry the demographics story; showing a
  // permanently-empty chart would just be an apology taking up space.
  if (!hasData) return null;

  const total = ageGenderData.reduce((s, d) => s + d.male + d.female, 0);

  return (
    <Card
      className={`w-full rounded-[12px] custom-card-shadow ${className ?? ''}`}
    >
      <CardHeader className="px-6 pb-4">
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
          Age &amp; Gender
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full font-poppins pl-3 pr-8 pt-0 pb-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={ageGenderData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="age"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'var(--foreground)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fontSize: 10, fill: 'var(--foreground)' }}
            />
            <Tooltip
              content={<InsightTooltip total={total} />}
              cursor={false}
            />
            <Bar
              dataKey="male"
              stackId="gender"
              fill={MALE_COLOR}
              maxBarSize={28}
            />
            <Bar
              dataKey="female"
              stackId="gender"
              fill={FEMALE_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
        <ul className="mt-3 flex items-center justify-center gap-6 text-xs">
          <li className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: MALE_COLOR }}
            />
            <span className="text-foreground">Male</span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: FEMALE_COLOR }}
            />
            <span className="text-foreground">Female</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

// ── The section the page composes: everything the endpoint sends ──

export const CustomerInsightsSection = ({
  className,
}: {
  className?: string;
}) => {
  const { data, isLoading } = useGetCustomerDemographicsQuery();

  if (isLoading) {
    return (
      <div className={`flex flex-col gap-6 ${className ?? ''}`}>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 ${className ?? ''}`}>
      <CustomerDemographicsChart />
      <DistributionDonut
        title="Gender Split"
        emptyDescription="Appears as customers add their profile details"
        items={data?.genderDistribution ?? []}
      />
      <DistributionDonut
        title="What They Shop"
        emptyDescription="Appears as customers set their wears preference"
        items={data?.wearsDistribution ?? []}
      />
      <CustomerAgeGenderChart />
    </div>
  );
};

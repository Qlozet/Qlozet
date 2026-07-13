'use client';

import { JSX } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCustomerDemographicsQuery } from '@/redux/services/customers/customers.api-slice';
import { ChartSkeleton } from '@/pattern/dashboard/molecules/chart-skeleton';
import { ChartEmptyState } from '@/pattern/dashboard/molecules/chart-empty-state';
import { CustomChartTooltip } from '@/pattern/dashboard/molecules/custom-chart-tooltip';
import ChartLegendIcon from '@/pattern/dashboard/atoms/chart-legend-icon';

// ─────────────────────────────────────────────────────────────────────
// Demographics chart – wired to GET /business/customers/demographics.
//
// The original age × gender bar chart is preserved below (commented out)
// for when `dob` and `gender` are collected during customer onboarding.
// ─────────────────────────────────────────────────────────────────────

// Placeholder data rendered as a ghost behind the empty-state overlay
const PLACEHOLDER_DATA = [
  { location: 'LAGOS', customerCount: 18 },
  { location: 'ABUJA', customerCount: 12 },
  { location: 'RIVERS', customerCount: 8 },
  { location: 'KANO', customerCount: 5 },
  { location: 'OYO', customerCount: 4 },
];

const renderLegend = (props: any): JSX.Element => {
  const payload = props?.payload ?? [];

  return (
    <ul className='w-full h-fit flex items-center gap-8 p-0 pl-2.5 pb-[1px] pt-[20px] m-0 text-left text-xs capitalize'>
      {payload?.map((entry: any, index: number) => {
        const { color } = entry;
        return (
          <li key={`item-${index}`} className='flex items-center gap-x-2'>
            <span>
              <ChartLegendIcon color={color} />
            </span>
            <span className='text-black dark:text-foreground'>
              {entry.value === 'customerCount' ? 'Customers' : entry.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

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
  const hasData = topLocations.length > 0 && topLocations.some((loc) => loc.customerCount > 0);

  const chartData = hasData
    ? topLocations.map((loc) => ({
        location: loc.location?.toUpperCase() ?? 'UNKNOWN',
        customerCount: loc.customerCount,
      }))
    : PLACEHOLDER_DATA;

  return (
    <Card className={`w-full rounded-[12px] custom-card-shadow ${className ?? ''}`}>
      <CardHeader className='px-6 pb-4'>
        <CardTitle className='text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground'>
          Customer Locations
        </CardTitle>
      </CardHeader>
      <CardContent className='w-full font-poppins pl-3 pr-8 pt-0 pb-6'>
        <ChartEmptyState
          isEmpty={!hasData}
          variant='bar'
          description='Location insights will appear here as customers place orders'
        >
          <ResponsiveContainer width='100%' height={250}>
            <BarChart
              data={chartData}
              layout='vertical'
              barGap={2}
              margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <XAxis type='number' hide />
              <YAxis
                dataKey='location'
                type='category'
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--foreground)', fontSize: 10, fontWeight: 500 }}
                padding={{ top: 0, bottom: 0 }}
              />
              <Tooltip content={<CustomChartTooltip />} cursor={false} />
              <Legend
                align='left'
                iconType='circle'
                iconSize={9}
                content={renderLegend}
              />
              <Bar
                dataKey='customerCount'
                fill='var(--chart-primary)'
                maxBarSize={24}
                radius={[0, 2.26, 2.26, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartEmptyState>
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  Age × Gender Demographics Bar Chart
//  Wired to GET /business/customers/demographics → ageGenderDistribution.
//  Shows ChartEmptyState with ghost chart when no dob/gender data exists.
// ═══════════════════════════════════════════════════════════════════════

const MALE_COLOR = 'var(--chart-primary)';
const FEMALE_COLOR = 'var(--chart-secondary)';

const AGE_GENDER_PLACEHOLDER = [
  { age: '0 - 5', male: 25, female: 55 },
  { age: '6 - 12', male: 25, female: 55 },
  { age: '13 - 18', male: 25, female: 55 },
  { age: '19 - 23', male: 25, female: 55 },
  { age: '24 - 28', male: 25, female: 55 },
  { age: '29 - 33', male: 25, female: 55 },
  { age: '34 - 39', male: 25, female: 55 },
  { age: '40 - 45', male: 25, female: 55 },
  { age: '46 - 50', male: 25, female: 55 },
  { age: '51 - 55', male: 25, female: 55 },
  { age: '56 - 60', male: 25, female: 55 },
  { age: '60 - 70+', male: 0, female: 55 },
];

const renderAgeGenderLegend = (props: any): JSX.Element => {
  const payload = props?.payload ?? [];

  return (
    <ul className='w-full h-fit flex items-center justify-center gap-8 p-0 pt-[20px] pb-[1px] m-0 text-center text-xs capitalize'>
      {payload?.map((entry: any, index: number) => {
        const { color } = entry;
        return (
          <li key={`item-${index}`} className='flex items-center gap-x-2'>
            <span>
              <ChartLegendIcon color={color ?? '#000'} />
            </span>
            <span className='text-black dark:text-foreground'>
              {entry.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export const CustomerAgeGenderChart = ({
  className,
}: {
  className?: string;
}) => {
  const { data, isLoading } = useGetCustomerDemographicsQuery();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  const ageGenderData = data?.ageGenderDistribution ?? [];
  const hasData =
    ageGenderData.length > 0 &&
    ageGenderData.some((d) => d.male > 0 || d.female > 0);

  const chartData = hasData ? ageGenderData : AGE_GENDER_PLACEHOLDER;

  return (
    <Card
      className={`w-full rounded-[12px] custom-card-shadow ${className ?? ''}`}
    >
      <CardHeader className='px-6 pb-4'>
        <CardTitle className='text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground'>
          Demographics
        </CardTitle>
      </CardHeader>
      <CardContent className='w-full font-poppins pl-3 pr-8 pt-0 pb-6'>
        <ChartEmptyState
          isEmpty={!hasData}
          variant='bar'
          description='Age &amp; gender data will appear when customers provide their date of birth'
        >
          <ResponsiveContainer width='100%' height={250}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              barCategoryGap='25%'
            >
              <CartesianGrid vertical={false} stroke='#F0F0F0' />
              <XAxis
                dataKey='age'
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor='end'
                height={50}
                tick={{ fontSize: 10, fill: 'var(--foreground)' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fontSize: 10, fill: 'var(--foreground)' }}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `${value / 1000}K` : `${value}`
                }
              />
              <Tooltip content={<CustomChartTooltip />} cursor={false} />
              <Bar
                dataKey='male'
                stackId='gender'
                fill={MALE_COLOR}
                radius={[0, 0, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey='female'
                stackId='gender'
                fill={FEMALE_COLOR}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Legend
                align='center'
                iconType='circle'
                iconSize={9}
                content={renderAgeGenderLegend}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartEmptyState>
      </CardContent>
    </Card>
  );
};

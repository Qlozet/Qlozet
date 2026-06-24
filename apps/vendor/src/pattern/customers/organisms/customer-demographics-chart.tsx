'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Age × gender distribution. The /business/customers endpoint exposes no
// demographic data, so this renders representative sample figures (charts are
// the agreed no-stubbed-data exception). Swap `DEMOGRAPHICS` for a real query
// when a demographics endpoint exists.
interface DemographicDatum {
  age: string;
  male: number;
  female: number;
}

const DEMOGRAPHICS: DemographicDatum[] = [
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

const MALE_COLOR = '#3E2118';
const FEMALE_COLOR = '#D8CBC4';

const renderLegend = () => (
  <ul className='flex items-center justify-center gap-x-8 pt-4 text-sm'>
    <li className='flex items-center gap-x-2'>
      <span
        className='inline-block size-2.5 rounded-full'
        style={{ backgroundColor: MALE_COLOR }}
      />
      <span className='text-[hsla(210,9%,31%,1)]'>Male</span>
    </li>
    <li className='flex items-center gap-x-2'>
      <span
        className='inline-block size-2.5 rounded-full'
        style={{ backgroundColor: FEMALE_COLOR }}
      />
      <span className='text-[hsla(210,9%,31%,1)]'>Female</span>
    </li>
  </ul>
);

export const CustomerDemographicsChart = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <Card
      className={`w-full rounded-[12px] custom-card-shadow ${className ?? ''}`}
    >
      <CardHeader className='px-6 pb-4'>
        <CardTitle className='text-lg font-semibold text-[hsla(210,9%,31%,1)]'>
          Demographics
        </CardTitle>
      </CardHeader>
      <CardContent className='w-full px-3 pt-0 pb-6'>
        <ResponsiveContainer width='100%' height={320}>
          <BarChart
            data={DEMOGRAPHICS}
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
              tick={{ fontSize: 11, fill: '#98A2B3' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fontSize: 11, fill: '#98A2B3' }}
              tickFormatter={(value: number) =>
                value >= 1000 ? `${value / 1000}K` : `${value}`
              }
            />
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
            <Legend content={renderLegend} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

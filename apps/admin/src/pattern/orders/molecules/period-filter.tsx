'use client';

import { Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ORDER_PERIOD_OPTIONS, type OrderPeriod } from '@/lib/orders';

interface PeriodFilterProps {
  value: OrderPeriod;
  onChange: (value: OrderPeriod) => void;
}

// Time-range selector shown above the order metrics. Narrows both the metric
// cards and the table to orders created within the selected period.
export const PeriodFilter = ({ value, onChange }: PeriodFilterProps) => (
  <Select value={value} onValueChange={(next) => onChange(next as OrderPeriod)}>
    <SelectTrigger
      aria-label="Filter orders by period"
      className="h-10 w-[150px] gap-2 rounded-lg bg-white text-sm text-gray-600"
    >
      <Clock className="size-4 shrink-0" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {ORDER_PERIOD_OPTIONS.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

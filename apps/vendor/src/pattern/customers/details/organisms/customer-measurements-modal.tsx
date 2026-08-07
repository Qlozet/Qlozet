'use client';

// Body Measurement Modal - Organism
// Opened from the "Measurement" button in the customer detail modal. Shows only
// the measurements the customer actually recorded (no fabricated/blank fields),
// in a clean two-column grid, with a cm/in toggle.
//
// The backend stores measurements as a flat { key: number } map, so we render
// whatever keys are present — mapping known keys to friendly labels and
// prettifying the rest — and skip anything missing or zero.

import { useMemo, useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { Ruler } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type {
  VendorCustomer,
  CustomerMeasurement,
} from '@/redux/services/customers/customers.api-slice';

type Unit = 'cm' | 'in';

// Friendly labels for known measurement keys; anything else is prettified.
const LABELS: Record<string, string> = {
  neck: 'Neck',
  neck_circumference: 'Neck',
  shoulder: 'Shoulder Width',
  shoulder_breadth: 'Shoulder Width',
  chest: 'Chest / Bust',
  bust: 'Bust',
  waist: 'Waist',
  hip: 'Hip',
  hips: 'Hip',
  arm_length: 'Arm Length',
  sleeve_length: 'Sleeve Length',
  bicep: 'Bicep',
  forearm: 'Forearm',
  wrist: 'Wrist',
  thigh: 'Thigh',
  calf: 'Calf',
  ankle: 'Ankle',
  knee: 'Knee',
  leg_length: 'Leg Length',
  inseam: 'Inseam',
  outseam: 'Outseam',
  shoulder_to_crotch: 'Torso Length',
  height: 'Height',
  back_length: 'Back Length',
  front_length: 'Front Length',
};

const prettify = (key: string): string =>
  LABELS[key] ??
  key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const convert = (value: number, from: 'cm' | 'inch', to: Unit): number => {
  const toUnit = to === 'in' ? 'inch' : 'cm';
  if (from === toUnit) return value;
  return toUnit === 'inch' ? value / 2.54 : value * 2.54;
};

const formatValue = (n: number): string =>
  Number.isInteger(n) ? `${n}` : n.toFixed(1);

const formatDate = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
};

const UnitToggle = ({
  unit,
  onChange,
}: {
  unit: Unit;
  onChange: (u: Unit) => void;
}) => (
  <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 p-1 text-xs font-semibold">
    {(['cm', 'in'] as const).map((u) => (
      <button
        key={u}
        type="button"
        onClick={() => onChange(u)}
        className={cn(
          'cursor-pointer rounded-full px-3 py-1 uppercase transition-colors',
          unit === u
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500'
        )}
      >
        {u}
      </button>
    ))}
  </div>
);

interface CustomerMeasurementsModalProps {
  customer?: VendorCustomer;
  measurementSet?: CustomerMeasurement;
}

export const CustomerMeasurementsModal = create<CustomerMeasurementsModalProps>(
  ({ measurementSet }) => {
    const { visible, resolve, remove } = useModal();
    const [unit, setUnit] = useState<Unit>('cm');

    const handleClose = () => {
      resolve({ resolved: true });
      remove();
    };

    // Only the measurements that are actually recorded (present + non-zero).
    const rows = useMemo(() => {
      const m = measurementSet?.measurements ?? {};
      return Object.entries(m)
        .filter(([, v]) => typeof v === 'number' && !Number.isNaN(v) && v > 0)
        .map(([key, v]) => ({ key, label: prettify(key), value: v }));
    }, [measurementSet]);

    const setDate = formatDate(measurementSet?.createdAt);

    return (
      <Dialog open={visible} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg p-0 gap-0 bg-white dark:bg-card">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-[#0C0C0D] dark:text-white">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Ruler className="size-4 text-primary" />
              </span>
              Body Measurement
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            {/* Set meta + unit toggle */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                {measurementSet?.name && (
                  <p className="truncate text-sm font-medium text-[#333] dark:text-white">
                    {measurementSet.name}
                  </p>
                )}
                {setDate && (
                  <p className="text-xs text-grey3 dark:text-gray-400">
                    Updated {setDate}
                  </p>
                )}
              </div>
              {rows.length > 0 && <UnitToggle unit={unit} onChange={setUnit} />}
            </div>

            {rows.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#EEF0F2] dark:border-border bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] px-3.5 py-3"
                  >
                    <span className="truncate text-sm text-gray-600 dark:text-gray-300">
                      {row.label}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-[#0C0C0D] dark:text-white">
                      {formatValue(
                        convert(row.value, measurementSet?.unit ?? 'cm', unit)
                      )}
                      <span className="ml-0.5 text-xs font-normal text-grey3">
                        {unit}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] dark:border-border px-6 py-12 text-center">
                <Ruler className="size-7 text-gray-300" />
                <p className="text-sm font-medium text-[#333] dark:text-white">
                  No measurements yet
                </p>
                <p className="text-xs text-grey3 dark:text-gray-400">
                  This customer hasn&apos;t recorded any body measurements.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

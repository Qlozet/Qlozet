'use client';

// Body Measurement Modal - Organism
// Opened from the clipboard icon in the customer detail header. Shows the
// customer's body measurements (CM/IN), an expandable full list, and a body
// type summary.
//
// NOTE: the backend exposes measurements only for the logged-in user
// (`/measurements/users/...`) — there is no endpoint to read a specific
// customer's measurements as a vendor, and MeasurementValues carries only a
// subset of the fields in the design. So values render as honest dashes until
// such an endpoint exists; pass `measurementSet` to populate them. Charts/figure
// aside, we never fabricate the numeric values (no-stubbed-data).

import React, { useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MeasurementValues } from '@/redux/services/measurements/measurements.api-slice';
import type {
  VendorCustomer,
  CustomerMeasurement,
} from '@/redux/services/customers/customers.api-slice';

type Unit = 'cm' | 'in';

interface FieldDef {
  label: string;
  /** Maps to a MeasurementValues key when the backend supplies it. */
  key?: keyof MeasurementValues;
}

// Column layouts mirror the design. Only fields the backend actually exposes
// are mapped to a key; the rest stay dashes rather than inventing values.
const PRIMARY_LEFT: FieldDef[] = [
  { label: 'Neck Circum:' },
  { label: 'Should Width', key: 'shoulder_breadth' },
  { label: 'Chest/Bust Circ.', key: 'chest' },
  { label: 'Waist Circ.', key: 'waist' },
  { label: 'Hip Circ.', key: 'hip' },
  { label: 'Arm Length', key: 'arm_length' },
];

const PRIMARY_RIGHT: FieldDef[] = [
  { label: 'Sleeve length:' },
  { label: 'Thigh Circum.', key: 'thigh' },
  { label: 'Inseam Length' },
  { label: 'Outseam Length' },
  { label: 'Leg length', key: 'leg_length' },
  { label: 'Crotch Depth' },
];

const MORE_LEFT: FieldDef[] = [
  { label: 'Upper Arm Circum' },
  { label: 'Bicep Circum.', key: 'bicep' },
  { label: 'Elbow Circum.' },
  { label: 'Forearm Circum', key: 'forearm' },
  { label: 'Back Length' },
  { label: 'Front Length' },
];

const MORE_RIGHT: FieldDef[] = [
  { label: 'Wrist Circum.', key: 'wrist' },
  { label: 'Knee Circum.' },
  { label: 'Calf Circum', key: 'calf' },
  { label: 'Ankle Circum.', key: 'ankle' },
  { label: 'Hip to knee' },
  { label: 'Knee to ankle' },
];

const convert = (value: number, from: 'cm' | 'inch', to: Unit): number => {
  const toUnit = to === 'in' ? 'inch' : 'cm';
  if (from === toUnit) return value;
  return toUnit === 'inch' ? value / 2.54 : value * 2.54;
};

const formatValue = (n: number): string =>
  Number.isInteger(n) ? `${n}` : n.toFixed(1);

interface MeasurementColumnProps {
  fields: FieldDef[];
  set?: CustomerMeasurement;
  unit: Unit;
}

const MeasurementColumn = ({ fields, set, unit }: MeasurementColumnProps) => {
  const display = (field: FieldDef): string => {
    if (!field.key || !set) return '—';
    const raw = set.measurements?.[field.key];
    if (typeof raw !== 'number' || Number.isNaN(raw)) return '—';
    return formatValue(convert(raw, set.unit, unit));
  };

  return (
    <div className='flex-1 space-y-4 rounded-xl bg-[#FAFAFA] p-4'>
      {fields.map((field) => (
        <div key={field.label} className='flex items-center justify-between gap-2'>
          <span className='text-sm text-gray-600'>{field.label}</span>
          <span className='text-sm font-medium text-gray-900'>
            {display(field)}
          </span>
        </div>
      ))}
    </div>
  );
};

const UnitToggle = ({
  unit,
  onChange,
}: {
  unit: Unit;
  onChange: (u: Unit) => void;
}) => (
  <div className='inline-flex items-center rounded-full bg-gray-100 p-1 text-xs font-semibold'>
    {(['cm', 'in'] as const).map((u) => (
      <button
        key={u}
        type='button'
        onClick={() => onChange(u)}
        className={cn(
          'rounded-full px-3 py-1 uppercase transition-colors',
          unit === u ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
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
    const [expanded, setExpanded] = useState(false);

    const handleClose = () => {
      resolve({ resolved: true });
      remove();
    };

    return (
      <Dialog open={visible} onOpenChange={handleClose}>
        <DialogContent className='max-w-md max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-[hsla(210,9%,31%,1)]'>
              Body Measurement
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-6'>
            <UnitToggle unit={unit} onChange={setUnit} />

            {!measurementSet && (
              <p className='text-sm text-muted-foreground'>
                No measurements recorded for this customer yet.
              </p>
            )}

            {/* Measurement grid */}
            <div className='space-y-4'>
              <div className='flex gap-4'>
                <MeasurementColumn
                  fields={PRIMARY_LEFT}
                  set={measurementSet}
                  unit={unit}
                />
                <MeasurementColumn
                  fields={PRIMARY_RIGHT}
                  set={measurementSet}
                  unit={unit}
                />
              </div>

              {expanded && (
                <div className='flex gap-4'>
                  <MeasurementColumn
                    fields={MORE_LEFT}
                    set={measurementSet}
                    unit={unit}
                  />
                  <MeasurementColumn
                    fields={MORE_RIGHT}
                    set={measurementSet}
                    unit={unit}
                  />
                </div>
              )}

              <Button
                type='button'
                variant='outline'
                onClick={() => setExpanded((prev) => !prev)}
                className='h-11 w-full rounded-lg text-sm font-medium text-gray-700'
              >
                {expanded ? 'View Less' : 'View More'}
              </Button>
            </div>

            {/* Body type */}
            <div className='space-y-4 border-t pt-6'>
              <h3 className='text-2xl font-bold text-[hsla(210,9%,31%,1)]'>
                Body Type
              </h3>
              {/* Inverted-triangle outline is decorative geometry, not data. */}
              <div className='flex items-center gap-6'>
                <svg
                  width='96'
                  height='110'
                  viewBox='0 0 96 110'
                  fill='none'
                  className='shrink-0'
                  aria-hidden='true'
                >
                  <path
                    d='M4 6 L92 6 L48 104 Z'
                    stroke='#C9C9C9'
                    strokeWidth='2'
                    strokeLinejoin='round'
                  />
                </svg>
                <p className='text-sm text-muted-foreground'>
                  Body type analysis isn&apos;t available for this customer yet.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

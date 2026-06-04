'use client';

import { Pencil } from 'lucide-react';

export interface BankDetailRow {
  label: string;
  value: string;
}

interface BankDetailsCardProps {
  rows: BankDetailRow[];
  onEdit?: () => void;
}

export const BankDetailsCard = ({ rows, onEdit }: BankDetailsCardProps) => {
  return (
    <div className="flex h-full flex-col rounded-xl bg-white p-5 custom-card-shadow">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[hsla(210,9%,31%,1)]">
          Bank Details
        </h3>
        <button
          type="button"
          aria-label="Edit bank details"
          onClick={onEdit}
          className="flex size-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
        >
          <Pencil className="size-4" />
        </button>
      </div>

      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 py-3.5"
          >
            <span className="text-sm text-gray-500">{row.label}:</span>
            <span className="text-sm font-semibold text-[hsla(210,9%,31%,1)] text-right">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

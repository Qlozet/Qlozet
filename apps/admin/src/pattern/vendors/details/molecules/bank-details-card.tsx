'use client';

export interface BankDetailRow {
  label: string;
  value: string;
}

interface BankDetailsCardProps {
  rows: BankDetailRow[];
}

export const BankDetailsCard = ({ rows }: BankDetailsCardProps) => {
  return (
    <div className="flex h-full flex-col rounded-xl bg-white p-5 custom-card-shadow dark:bg-card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[hsla(210,9%,31%,1)] dark:text-white">
          Bank Details
        </h3>
        {/* Read-only here by choice, not by limitation: PATCH
            /admin/businesses/:id does accept the payout fields, and the Edit
            vendor drawer is where they are corrected. */}
      </div>

      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 py-3.5"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {row.label}:
            </span>
            <span className="text-sm font-semibold text-[hsla(210,9%,31%,1)] dark:text-white text-right">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

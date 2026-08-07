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
    <div className="flex h-full flex-col rounded-xl bg-white p-5 custom-card-shadow">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[hsla(210,9%,31%,1)]">
          Bank Details
        </h3>
        {/* TODO(api): no admin endpoint writes a vendor's payout account, so
            this stays read-only rather than offering an edit that can't save. */}
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

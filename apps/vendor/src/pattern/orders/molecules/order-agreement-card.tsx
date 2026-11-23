'use client';

import { ChevronDown, FileText } from 'lucide-react';

/**
 * The bespoke order agreement as frozen on the order when the customer paid
 * the deposit (backend bespoke/order-agreement.ts). The customer and the
 * Qlozet team see the same record, so this is what a dispute is judged on.
 */
export interface OrderAgreementRecord {
  version: string;
  design: {
    name: string;
    image: string | null;
    back_image: string | null;
    note: string;
  };
  fabrics: {
    role: string;
    name: string;
    source: string;
    yards: number | null;
    supplier_name: string | null;
    charged: 'in_quote' | 'on_top';
    amount: number;
  }[];
  price: {
    line_items: { label: string; amount: number }[];
    quote_total: number;
    fabric_on_top: number;
    delivery_to_customer: number;
    fabric_delivery: number;
    total: number;
    pay_now: number;
    remaining_after_photos: number;
  };
  timing: { making_days: number };
  delivery_area: string | null;
  terms: { key: string; text: string }[];
  tailor_agreed_at: string | null;
  customer_agreed_at: string | null;
}

const naira = (n: number) => `₦${Math.round(n || 0).toLocaleString('en-NG')}`;
const day = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

const Row = ({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div className="flex justify-between gap-3 text-xs">
    <span className="text-grey2 dark:text-gray-400">{label}</span>
    <span
      className={
        strong
          ? 'text-right font-bold text-[#0C0C0D] dark:text-white'
          : 'text-right font-medium text-[#0C0C0D] dark:text-white'
      }
    >
      {value}
    </span>
  </div>
);

export function OrderAgreementCard({
  agreement,
}: {
  agreement: OrderAgreementRecord;
}) {
  const a = agreement;
  return (
    <details className="group overflow-hidden rounded-[20px] border bg-[hsla(0,0%,96%,1)] dark:border-border dark:bg-[#4A4949]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#0C0C0D] dark:text-white">
        <FileText className="size-4 shrink-0" />
        <span className="flex-1">Order agreement</span>
        <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-3 border-t border-[#DDE2E5] px-5 py-4 dark:border-border">
        <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
          What you and the customer agreed when they paid the deposit. The
          Qlozet team uses this record if there is ever a dispute.
        </p>
        <div className="space-y-1.5">
          {a.price.line_items.map((li) => (
            <Row key={li.label} label={li.label} value={naira(li.amount)} />
          ))}
          <Row label="Your quote" value={naira(a.price.quote_total)} strong />
          {a.price.fabric_on_top > 0 && (
            <Row
              label="Fabric from another shop (paid to that shop)"
              value={naira(a.price.fabric_on_top)}
            />
          )}
          <Row label="Paid with the deposit" value={naira(a.price.pay_now)} />
          {a.price.remaining_after_photos > 0 && (
            <Row
              label="Due after your photos"
              value={naira(a.price.remaining_after_photos)}
            />
          )}
          <Row
            label="Ship within"
            value={`${a.timing.making_days} days of payment`}
          />
          {a.delivery_area && (
            <Row label="Delivering to" value={a.delivery_area} />
          )}
        </div>
        {a.fabrics.length > 0 && (
          <div className="space-y-1.5">
            {a.fabrics.map((f) => (
              <Row
                key={`${f.role}-${f.name}`}
                label={`${f.name}${f.yards ? ` · ${f.yards} yd` : ''}`}
                value={
                  f.source === 'other_vendor'
                    ? `From ${f.supplier_name ?? 'another shop'}`
                    : f.source === 'tailor_sourced'
                      ? 'You buy it'
                      : 'Your stock'
                }
              />
            ))}
          </div>
        )}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-grey2 dark:text-gray-400">
            Terms the customer agreed to
          </p>
          <ul className="list-disc space-y-1.5 pl-4">
            {a.terms.map((t) => (
              <li
                key={t.key}
                className="text-xs leading-relaxed text-grey2 dark:text-gray-300"
              >
                {t.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] text-grey2 dark:text-gray-400">
          {a.tailor_agreed_at
            ? `You agreed when you sent the quote (${day(a.tailor_agreed_at)}). `
            : ''}
          {a.customer_agreed_at
            ? `The customer agreed on ${day(a.customer_agreed_at)}.`
            : 'The customer paid from an older app that did not show the agreement.'}
        </p>
      </div>
    </details>
  );
}

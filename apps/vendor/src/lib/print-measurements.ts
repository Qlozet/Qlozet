// A one-page measurement sheet for the workroom: who it's for, the order,
// how the numbers were taken, and every value in cm and inches with where
// the tape goes. Opens the browser's print dialog in a new window.

import {
  MEASUREMENT_DEFINITIONS,
  MEASUREMENT_METHOD,
  measurementLabel,
} from './measurement-labels';

export interface PrintableMeasurements {
  orderReference: string;
  setName?: string | null;
  productName?: string | null;
  unit: 'cm' | 'inch';
  measurements: Record<string, number>;
  method?: string | null;
  measuredAt?: string | null;
  correctedAt?: string | null;
  bodyType?: string | null;
  fitPreferences?: string[];
  verifyKeys?: string[];
}

const esc = (t: string) =>
  t.replace(
    /[&<>"']/g,
    (ch) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        ch
      ] as string
  );

const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1));

const date = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

export function printMeasurementSheet(p: PrintableMeasurements): boolean {
  const win = window.open('', '_blank', 'width=820,height=1000');
  if (!win) return false;

  const toCm = (v: number) => (p.unit === 'inch' ? v * 2.54 : v);
  const verify = new Set(p.verifyKeys ?? []);
  const rows = Object.entries(p.measurements)
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .map(([key, v]) => {
      const cm = toCm(v);
      return `<tr>
        <td><b>${esc(measurementLabel(key))}</b>${verify.has(key) ? ' <span class="verify">Verify</span>' : ''}
          ${MEASUREMENT_DEFINITIONS[key] ? `<div class="hint">${esc(MEASUREMENT_DEFINITIONS[key])}</div>` : ''}</td>
        <td class="num">${fmt(cm)} cm</td>
        <td class="num">${fmt(cm / 2.54)} in</td>
      </tr>`;
    })
    .join('');

  const method = p.method ? MEASUREMENT_METHOD[p.method]?.label : null;
  const facts = [
    p.setName ? `Sewn to: <b>${esc(p.setName)}</b>` : null,
    p.productName ? `Piece: ${esc(p.productName)}` : null,
    method ? `How taken: ${esc(method)}` : null,
    date(p.measuredAt) ? `Measurements dated ${date(p.measuredAt)}` : null,
    date(p.correctedAt)
      ? `Corrected by the customer for this order on ${date(p.correctedAt)}`
      : null,
    p.bodyType ? `Body type: ${esc(p.bodyType)}` : null,
    p.fitPreferences?.length
      ? `Fit preference: ${esc(p.fitPreferences.join(', '))}`
      : null,
  ]
    .filter(Boolean)
    .map((f) => `<li>${f}</li>`)
    .join('');

  win.document.write(`<!doctype html><html><head><meta charset="utf-8">
<title>Measurements · ${esc(p.orderReference)}</title>
<style>
  body { font: 13px/1.45 -apple-system, Segoe UI, Roboto, sans-serif; color: #111; margin: 28px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .sub { color: #555; margin: 0 0 14px; }
  ul { padding-left: 18px; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 7px 8px; border-bottom: 1px solid #ddd; vertical-align: top; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #555; }
  .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .hint { color: #666; font-size: 11px; margin-top: 2px; }
  .verify { font-size: 10px; font-weight: 700; color: #92400e; background: #fef3c7; border-radius: 6px; padding: 1px 5px; }
  .foot { margin-top: 16px; color: #666; font-size: 11px; }
  @media print { body { margin: 12mm; } }
</style></head><body>
<h1>Measurements for order ${esc(p.orderReference)}</h1>
<p class="sub">Body measurements, locked when the customer ordered. Add your own ease.</p>
<ul>${facts}</ul>
<table><thead><tr><th>Measurement</th><th class="num">cm</th><th class="num">in</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="foot">Printed from Qlozet. Personal data: use only to make this order.</p>
<script>window.onload = function () { window.print(); };</script>
</body></html>`);
  win.document.close();
  return true;
}

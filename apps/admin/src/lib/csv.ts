// Minimal client-side CSV export.
//
// Kept dependency-free: the admin app doesn't bundle a spreadsheet library, and
// a CSV opens directly in Excel/Sheets.

const escapeCell = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value);
  // Quote when the cell contains a delimiter, quote or newline.
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (headers: string[], rows: unknown[][]): string =>
  [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');

/** Trigger a browser download for the given CSV content. */
export const downloadCsv = (filename: string, csv: string): void => {
  // A BOM keeps Excel from mangling non-ASCII characters.
  const blob = new Blob([`﻿${csv}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

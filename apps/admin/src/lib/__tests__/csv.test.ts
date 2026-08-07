import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { downloadCsv, toCsv } from '../csv';

describe('toCsv', () => {
  it('writes the header row followed by the data rows, CRLF-separated', () => {
    expect(toCsv(['Order', 'Total'], [['QLZ-1', 1000], ['QLZ-2', 2000]])).toBe(
      'Order,Total\r\nQLZ-1,1000\r\nQLZ-2,2000'
    );
  });

  it('quotes cells containing a comma', () => {
    expect(toCsv(['Name'], [['Obi, Ada']])).toBe('Name\r\n"Obi, Ada"');
  });

  it('doubles embedded quotes', () => {
    expect(toCsv(['Note'], [['He said "hi"']])).toBe('Note\r\n"He said ""hi"""');
  });

  it('quotes cells containing newlines', () => {
    expect(toCsv(['Note'], [['line1\nline2']])).toBe('Note\r\n"line1\nline2"');
  });

  it('renders null and undefined as empty cells, not the literal words', () => {
    expect(toCsv(['A', 'B'], [[null, undefined]])).toBe('A,B\r\n,');
  });

  it('keeps a zero rather than blanking it', () => {
    expect(toCsv(['Total'], [[0]])).toBe('Total\r\n0');
  });

  it('emits just the header when there are no rows', () => {
    expect(toCsv(['A', 'B'], [])).toBe('A,B');
  });
});

describe('downloadCsv', () => {
  let click: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    click = vi.fn();
    // jsdom implements neither object URLs nor navigation.
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(click);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clicks a download link with the given filename and cleans up after itself', () => {
    downloadCsv('orders.csv', 'A,B\r\n1,2');

    expect(click).toHaveBeenCalledOnce();
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    // The temporary anchor must not be left behind in the document.
    expect(document.querySelectorAll('a[download]')).toHaveLength(0);
  });

  it('prefixes a BOM so Excel reads non-ASCII correctly', async () => {
    downloadCsv('orders.csv', 'Naira,₦1,000');
    const blob = (URL.createObjectURL as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as Blob;
    expect(blob.type).toContain('text/csv');
    // Asserted on the raw bytes: reading the blob back as text would decode
    // away the very BOM this is checking for, and it's the EF BB BF prefix
    // that Excel keys off.
    const bytes = await new Promise<Uint8Array>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.readAsArrayBuffer(blob);
    });
    expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xef, 0xbb, 0xbf]);
  });
});

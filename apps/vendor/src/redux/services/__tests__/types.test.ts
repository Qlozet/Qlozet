import { describe, expect, it } from 'vitest';
import { readApiError, readPageCount, readTotalItems } from '../types';

// The backend sends snake_case pagination keys. Reading the camelCase ones the
// shared type used to assume made every table fall back to `data.length`,
// which silently pinned them to a single page.
describe('readTotalItems', () => {
  it('reads the total the backend actually sends', () => {
    expect(readTotalItems({ data: [1, 2, 3], total_items: 13 })).toBe(13);
  });

  it('accepts the legacy aliases', () => {
    expect(readTotalItems({ data: [], totalCount: 7 })).toBe(7);
    expect(readTotalItems({ data: [], total: 5 })).toBe(5);
  });

  it('falls back to the page length, then zero', () => {
    expect(readTotalItems({ data: [1, 2] })).toBe(2);
    expect(readTotalItems(undefined)).toBe(0);
  });
});

describe('readPageCount', () => {
  it('prefers the server page count', () => {
    expect(
      readPageCount({ data: [], total_items: 13, total_pages: 5 }, 3)
    ).toBe(5);
  });

  it('derives one from the total when the server omits it', () => {
    expect(readPageCount({ data: [], total_items: 13 }, 8)).toBe(2);
  });

  it('never collapses a full result set to a single page', () => {
    // The old code did exactly this: 13 items, 8 per page, but the total was
    // unreadable so it derived ceil(8/8) = 1 and hid page 2.
    expect(readPageCount({ data: new Array(8), total_items: 13 }, 8)).toBe(2);
  });

  it('returns one page when there is nothing to show', () => {
    expect(readPageCount({ data: [], total_items: 0, total_pages: 0 }, 8)).toBe(
      1
    );
    expect(readPageCount(undefined, 8)).toBe(1);
  });

  it('tolerates a zero page size', () => {
    expect(readPageCount({ data: [], total_items: 3 }, 0)).toBe(3);
  });
});

describe('readApiError', () => {
  it('surfaces the server’s own message', () => {
    // An endpoint that refuses usefully — "this warehouse still holds stock" —
    // is worth showing verbatim.
    expect(
      readApiError({ data: { message: 'This warehouse still holds stock.' } })
    ).toBe('This warehouse still holds stock.');
  });

  it('joins a validation-pipe message array', () => {
    // Nest returns an array when class-validator rejects a body.
    expect(
      readApiError({ data: { message: ['status must be one of', 'active'] } })
    ).toBe('status must be one of, active');
  });

  it('accepts a bare string body', () => {
    expect(readApiError({ data: 'Forbidden' })).toBe('Forbidden');
  });

  it('falls back when there is no message to show', () => {
    expect(readApiError(undefined)).toBe(
      'Something went wrong. Please try again.'
    );
    expect(readApiError({})).toBe('Something went wrong. Please try again.');
    expect(readApiError({ data: { message: '   ' } })).toBe(
      'Something went wrong. Please try again.'
    );
  });

  it('takes a caller-supplied fallback', () => {
    expect(readApiError(null, "Couldn't delete.")).toBe("Couldn't delete.");
  });
});

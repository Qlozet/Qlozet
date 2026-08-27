'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface VendorSearchInputProps {
  /** The committed term currently applied to the query. */
  value: string;
  onChange: (value: string) => void;
  /** How long to wait after typing stops before searching. */
  delay?: number;
}

/**
 * Search box for the vendors table.
 *
 * Debounced: the term goes to the server, and firing a request per keystroke
 * would both hammer the endpoint and let a slow early response overwrite a
 * later one. Local state keeps the field responsive while the committed value
 * lags behind it.
 */
export const VendorSearchInput = ({
  value,
  onChange,
  delay = 350,
}: VendorSearchInputProps) => {
  const [draft, setDraft] = useState(value);

  // Follow the committed value when it changes from outside (a cleared filter,
  // a restored URL), without fighting the user mid-type.
  useEffect(() => {
    setDraft((current) => (current === value ? current : value));
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onChange(draft), delay);
    return () => clearTimeout(timer);
  }, [draft, value, delay, onChange]);

  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search vendors"
        aria-label="Search vendors"
        className="h-10 pl-9 pr-9"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft('');
            onChange('');
          }}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
};

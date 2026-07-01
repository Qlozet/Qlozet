'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SystemTagItem, ProductTag } from '@/redux/services/taxonomy/taxonomy.api-slice';

interface TagComboInputProps {
  /** Currently selected tags */
  value: ProductTag[];
  /** Called when tags change */
  onChange: (tags: ProductTag[]) => void;
  /** System tags from the API */
  systemTags?: SystemTagItem[];
  /** Loading state for system tags */
  isLoading?: boolean;
  /** Placeholder text */
  placeholder?: string;
  className?: string;
}

/**
 * Combo input for tags: dropdown of system tags + free-form custom tag entry.
 * System tags get type: 'system', custom tags get type: 'custom'.
 */
export const TagComboInput = ({
  value,
  onChange,
  systemTags = [],
  isLoading = false,
  placeholder = 'Add tags...',
  className,
}: TagComboInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedSlugs = new Set(value.map((t) => t.slug));

  const handleAddSystemTag = (tag: SystemTagItem) => {
    if (selectedSlugs.has(tag.slug)) {
      // Remove if already selected
      onChange(value.filter((t) => t.slug !== tag.slug));
    } else {
      onChange([
        ...value,
        { name: tag.name, slug: tag.slug, type: 'system' },
      ]);
    }
  };

  const handleAddCustomTag = () => {
    const name = customInput.trim();
    if (!name) return;

    const slug = name.toLowerCase().replace(/\s+/g, '-');

    // Don't add duplicates
    if (selectedSlugs.has(slug)) {
      setCustomInput('');
      return;
    }

    // Check if it matches a system tag
    const systemMatch = systemTags.find(
      (t) => t.slug === slug || t.name.toLowerCase() === name.toLowerCase()
    );

    if (systemMatch) {
      onChange([
        ...value,
        { name: systemMatch.name, slug: systemMatch.slug, type: 'system' },
      ]);
    } else {
      onChange([...value, { name, slug, type: 'custom' }]);
    }

    setCustomInput('');
  };

  const handleRemoveTag = (slug: string) => {
    onChange(value.filter((t) => t.slug !== slug));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  // Filter out already-selected system tags from the dropdown
  const availableSystemTags = systemTags.filter((t) => !selectedSlugs.has(t.slug));

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Selected tags + input area */}
      <div
        className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-border-input bg-accent px-3 py-2 text-sm cursor-text"
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
      >
        {value.map((tag) => (
          <span
            key={tag.slug}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
              tag.type === 'system'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted text-muted-foreground border border-border'
            )}
          >
            {tag.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag.slug);
              }}
              className="hover:text-destructive transition-colors"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] bg-transparent outline-none placeholder:text-muted-foreground text-sm"
        />

        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading tags...
            </div>
          ) : (
            <>
              {/* Custom tag entry hint */}
              {customInput.trim() && (
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-accent border-b border-border"
                >
                  <Plus className="size-3.5" />
                  Add &quot;{customInput.trim()}&quot; as custom tag
                </button>
              )}

              {/* System tags */}
              {availableSystemTags.length > 0 && (
                <div className="p-2">
                  <div className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">
                    System Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSystemTags
                      .filter((t) =>
                        !customInput.trim() ||
                        t.name.toLowerCase().includes(customInput.toLowerCase())
                      )
                      .map((tag) => (
                        <button
                          key={tag._id}
                          type="button"
                          onClick={() => handleAddSystemTag(tag)}
                          className="inline-flex items-center rounded-md border border-border-input bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          {tag.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {availableSystemTags.length === 0 && !customInput.trim() && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {systemTags.length === 0
                    ? 'No system tags available. Type to add custom tags.'
                    : 'All system tags selected. Type to add custom tags.'}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

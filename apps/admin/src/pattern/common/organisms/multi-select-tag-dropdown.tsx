'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TagOption {
  value: string;
  label: string;
}

export interface TagGroup {
  label: string;
  tags: TagOption[];
}

interface MultiSelectTagsProps {
  placeholder?: string;
  groups: TagGroup[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

// Chip-style multi-select used by Product Organization (Tag / Category /
// Sub-category / Product type) and the variant size picker. Ported from vendor.
export const MultiSelectTagsDropdown = ({
  placeholder = 'Select...',
  groups,
  value,
  onChange,
  className,
}: MultiSelectTagsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tagValue: string) =>
    onChange(
      value.includes(tagValue)
        ? value.filter((v) => v !== tagValue)
        : [...value, tagValue]
    );

  const selectedLabels = groups
    .flatMap((g) => g.tags)
    .filter((t) => value.includes(t.value))
    .map((t) => t.label);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground hover:bg-accent/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span
          className={cn('truncate', selectedLabels.length === 0 && 'text-muted-foreground')}
        >
          {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-card p-4 shadow-lg">
          <div className="space-y-4">
            {groups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => {
                    const isSelected = value.includes(tag.value);
                    return (
                      <button
                        key={tag.value}
                        type="button"
                        onClick={() => toggleTag(tag.value)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'border border-input bg-card text-foreground hover:bg-accent'
                        )}
                      >
                        {tag.label}
                        {isSelected && <X className="size-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

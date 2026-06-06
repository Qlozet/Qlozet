'use client';

import { cn } from '@/lib/utils';

export type SupportTab = 'tickets' | 'live-chat';

const TABS: { label: string; value: SupportTab }[] = [
  { label: 'Tickets', value: 'tickets' },
  { label: 'Live Chat Logs', value: 'live-chat' },
];

interface SupportTabsProps {
  value: SupportTab;
  onChange: (value: SupportTab) => void;
}

// Segmented switch between the Tickets and Live Chat Logs views.
export const SupportTabs = ({ value, onChange }: SupportTabsProps) => {
  return (
    <div className="inline-flex rounded-xl bg-[#F8F9FA] p-1">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'rounded-lg px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-grey3 hover:text-grey-black'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

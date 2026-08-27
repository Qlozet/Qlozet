'use client';

// Settings Navigation - Molecule
// Section tabs for the settings screen, styled like the notification inbox's
// category tabs so the console keeps one tab treatment.

import React from 'react';
import {
  Banknote,
  Percent,
  Package,
  Boxes,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SETTINGS_TABS } from '../lib/settings-tabs';

const TAB_ICONS: Record<string, LucideIcon> = {
  Payouts: Banknote,
  'Commission & fees': Percent,
  Orders: Package,
  Inventory: Boxes,
  'AI & tokens': Sparkles,
};

interface SettingsNavigationProps {
  activeTab: string;
  /** Unsaved change count per tab slug, so a tab left mid-edit says so. */
  changesByTab?: Record<string, number>;
  onSelect: (label: string) => void;
  className?: string;
}

export const SettingsNavigation = ({
  activeTab,
  changesByTab,
  onSelect,
  className,
}: SettingsNavigationProps) => {
  return (
    <div className={cn('border-b border-border', className)}>
      {/* -mb-px sits on the scroller, not the tabs: it pulls the whole row 1px
          down so the active tab's border covers the container's rule. On the
          tabs it would overhang the scroller and be clipped by
          overflow-y-hidden (needed because a lone overflow-x computes
          overflow-y to auto, which would show a vertical scrollbar). */}
      <div
        role="tablist"
        aria-label="Settings sections"
        className="-mb-px flex gap-6 overflow-x-auto overflow-y-hidden scrollbar-none"
      >
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.label;
          const Icon = TAB_ICONS[tab.label] ?? Banknote;
          const pending = changesByTab?.[tab.slug] ?? 0;
          return (
            <button
              key={tab.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(tab.label)}
              className={cn(
                'flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-1 pb-1.5 text-sm transition-colors',
                isActive
                  ? 'border-primary dark:border-white font-semibold text-primary dark:text-white'
                  : 'border-transparent text-grey3 dark:text-gray-400 hover:text-grey-black dark:hover:text-white'
              )}
            >
              <Icon className="size-3.5" />
              {tab.label}
              {/* Each tab saves on its own, so an edit left behind on another
                  tab would otherwise be invisible from here. */}
              {pending > 0 && (
                <>
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 rounded-full bg-error"
                  />
                  <span className="sr-only">
                    {pending} unsaved change{pending === 1 ? '' : 's'}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

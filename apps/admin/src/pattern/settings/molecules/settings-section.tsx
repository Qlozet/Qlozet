'use client';

// Settings Section - Molecule
// A card of related setting rows, styled like the vendor console's order
// settings cards: a tinted icon header over a divided list of rows.

import React from 'react';
import {
  Banknote,
  Boxes,
  Clock,
  CreditCard,
  Landmark,
  Lock,
  Package,
  Percent,
  ReceiptText,
  Scissors,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { SettingsField } from './settings-field';
import type { SettingsSectionSpec } from '../lib/settings-tabs';
import type {
  DraftValue,
  SettingsDraft,
  SettingsErrors,
} from '../lib/settings-form';

// Icons keyed by section id, so the catalogue itself stays JSX-free.
const SECTION_ICONS: Record<string, LucideIcon> = {
  'payout-schedule': Banknote,
  'custom-order-milestones': Scissors,
  'platform-commission': Percent,
  'fees-and-tax': ReceiptText,
  'international-payments': CreditCard,
  'reporting-currency': Landmark,
  'order-lifecycle': Package,
  'late-penalties': Clock,
  'availability-thresholds': Boxes,
  'token-cost-per-action': Sparkles,
  'ai-access': Lock,
};

interface SettingsSectionProps {
  section: SettingsSectionSpec;
  draft: SettingsDraft;
  errors: SettingsErrors;
  disabled?: boolean;
  onChange: (key: string, value: DraftValue) => void;
}

export const SettingsSection = ({
  section,
  draft,
  errors,
  disabled,
  onChange,
}: SettingsSectionProps) => {
  const Icon = SECTION_ICONS[section.id] ?? Banknote;

  return (
    <section className="rounded-xl bg-white p-5 custom-card-shadow dark:border dark:border-white/10 dark:bg-card lg:p-6">
      {/* Card Header */}
      <div className="mb-5 flex items-start gap-2.5 border-b border-border/60 pb-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-grey-black dark:text-white">
            {section.title}
          </h3>
          <p className="mt-0.5 text-xs text-grey3 dark:text-gray-400">
            {section.description}
          </p>
        </div>
      </div>

      {/* Setting rows */}
      <div className="divide-y divide-border/40">
        {section.fields.map((field) => (
          <SettingsField
            key={field.key}
            spec={field}
            value={draft[field.key] ?? ''}
            error={errors[field.key]}
            disabled={disabled}
            // The field still saves while inactive — the backend keeps both
            // commission values — it just reads as the one not in play.
            isActive={
              !field.activeWhen ||
              String(draft[field.activeWhen.key]) === field.activeWhen.equals
            }
            onChange={(value) => onChange(field.key, value)}
          />
        ))}
      </div>
    </section>
  );
};

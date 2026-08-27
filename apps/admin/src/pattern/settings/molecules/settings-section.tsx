'use client';

// Settings Section - Molecule
// A titled card of related fields, rendered straight from the catalogue.

import React from 'react';
import { SettingsField } from './settings-field';
import type { SettingsSectionSpec } from '../lib/settings-tabs';
import type {
  DraftValue,
  SettingsDraft,
  SettingsErrors,
} from '../lib/settings-form';

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
  return (
    <section className="rounded-2xl border border-border bg-white dark:bg-card p-5">
      <header className="space-y-1">
        <h2 className="text-base font-bold text-grey-black dark:text-white">
          {section.title}
        </h2>
        <p className="text-sm text-grey3 dark:text-gray-400">
          {section.description}
        </p>
      </header>

      <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
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

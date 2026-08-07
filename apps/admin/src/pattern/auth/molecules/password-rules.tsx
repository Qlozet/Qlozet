'use client';

import { cn } from '@/lib/utils';

export interface PasswordRule {
  label: string;
  met: boolean;
}

/**
 * Builds the rule list shown under the new-password fields. Exported so the
 * submitting form can gate on the same checks the user sees — the two must not
 * drift apart.
 */
export const buildPasswordRules = (
  password: string,
  confirmPassword: string
): PasswordRule[] => [
  {
    label: 'Password must contain at least 8 characters',
    met: password.length >= 8,
  },
  {
    label: 'Password must contain a symbol or character',
    met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  },
  { label: 'Password must contain a number', met: /\d/.test(password) },
  {
    label: 'Password must match',
    met: password.length > 0 && password === confirmPassword,
  },
];

export const allRulesMet = (rules: PasswordRule[]): boolean =>
  rules.every((rule) => rule.met);

export const PasswordRules = ({ rules }: { rules: PasswordRule[] }) => (
  <ul className="space-y-3">
    {rules.map((rule) => (
      <li key={rule.label} className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            'size-4 shrink-0 rounded-full transition-colors',
            rule.met ? 'bg-primary' : 'bg-[#E5E5E5]'
          )}
        />
        <span
          className={cn(
            'text-sm transition-colors',
            rule.met ? 'text-grey-black' : 'text-grey3'
          )}
        >
          {rule.label}
        </span>
        <span className="sr-only">{rule.met ? '(met)' : '(not met)'}</span>
      </li>
    ))}
  </ul>
);

// The platform settings catalogue.
//
// Every field here exists on the backend's PlatformSettings schema, and the
// help text is drawn from what the API actually does with the value — these
// numbers drive payouts, order expiry and AI billing, so an administrator
// editing one deserves to know what it moves.
//
// `label` is what the nav and SettingsContent switch on; `slug` is what appears
// in the URL as `?tab=...`, so the active section survives a reload, can be
// linked to directly, and works with the browser's back button.

import type { PlatformSettings } from '@/redux/services/settings/settings.api-slice';

/**
 * The USD token price is nested (`token_price.usd.amount`) while every other
 * field is top level, so it carries a path rather than a key.
 */
export const TOKEN_PRICE_USD_KEY = 'token_price.usd.amount';

export type SettingsFieldKey =
  | Exclude<
      keyof PlatformSettings,
      '_id' | 'createdAt' | 'updatedAt' | 'token_price'
    >
  | typeof TOKEN_PRICE_USD_KEY;

export type SettingsFieldKind = 'number' | 'select' | 'switch';

/** Drives the input's adornment and its validation ceiling. */
export type SettingsUnit =
  | 'percent'
  | 'naira'
  | 'usd'
  | 'days'
  | 'hours'
  | 'units'
  | 'yards'
  | 'tokens';

export interface SettingsFieldOption {
  value: string;
  label: string;
}

export interface SettingsFieldSpec {
  key: SettingsFieldKey;
  label: string;
  help: string;
  kind: SettingsFieldKind;
  unit?: SettingsUnit;
  min?: number;
  max?: number;
  step?: number;
  /** Rejects a fractional value — days, hours and unit counts are whole. */
  integer?: boolean;
  options?: SettingsFieldOption[];
  /**
   * The field only bites while a sibling holds this value. It stays editable
   * and still saves; it just reads as inactive, because a commission type of
   * 'percent' does not stop the flat amount from being stored.
   */
  activeWhen?: { key: SettingsFieldKey; equals: string };
}

export interface SettingsSectionSpec {
  id: string;
  title: string;
  description: string;
  fields: SettingsFieldSpec[];
}

export interface SettingsTab {
  label: string;
  slug: string;
  description: string;
  sections: SettingsSectionSpec[];
}

const PERCENT = {
  kind: 'number',
  unit: 'percent',
  min: 0,
  max: 100,
  step: 0.25,
} as const;
const NAIRA = { kind: 'number', unit: 'naira', min: 0, step: 100 } as const;
const TOKENS = {
  kind: 'number',
  unit: 'tokens',
  min: 0,
  step: 1,
  integer: true,
} as const;

export const SETTINGS_TABS: SettingsTab[] = [
  {
    label: 'Payouts',
    slug: 'payouts',
    description:
      'When a vendor gets paid, how much has to have accrued first, and how a custom order is split between confirmation and delivery.',
    sections: [
      {
        id: 'payout-schedule',
        title: 'Payout schedule',
        description:
          'Earnings become eligible on delivery plus the delay below, and are paid out on the cycle.',
        fields: [
          {
            key: 'payout_cycle',
            label: 'Payout cycle',
            help: 'How often eligible earnings are swept into a payout.',
            kind: 'select',
            options: [
              { value: 'weekly', label: 'Weekly' },
              { value: 'bi-weekly', label: 'Bi-weekly' },
              { value: 'monthly', label: 'Monthly' },
            ],
          },
          {
            key: 'minimum_payout',
            label: 'Minimum payout',
            help: 'A balance under this is carried to the next cycle rather than paid.',
            ...NAIRA,
          },
          {
            key: 'payout_delay_days',
            label: 'Payout delay',
            help: 'Days after an order completes before its earnings become eligible.',
            kind: 'number',
            unit: 'days',
            min: 0,
            max: 90,
            step: 1,
            integer: true,
          },
          {
            key: 'auto_release_days',
            label: 'Auto-release after dispatch',
            help: 'Safety net: earnings release this many days after dispatch if the delivery webhook never fires.',
            kind: 'number',
            unit: 'days',
            min: 1,
            max: 90,
            step: 1,
            integer: true,
          },
        ],
      },
      {
        id: 'custom-order-milestones',
        title: 'Custom order milestones',
        description:
          'Tailored work pays in two parts — a share on vendor confirmation, the rest on delivery plus the payout delay.',
        fields: [
          {
            key: 'tailored_order_upfront_percent',
            label: 'Upfront on confirmation',
            help: 'Share of a tailored order released when the vendor confirms it. The remainder follows on delivery.',
            ...PERCENT,
          },
          {
            key: 'reservation_fee_percent',
            label: 'Reservation fee',
            help: 'Share of the order total a customer pays to reserve a slot.',
            ...PERCENT,
          },
        ],
      },
    ],
  },
  {
    label: 'Commission & fees',
    slug: 'commission',
    description:
      "What the platform keeps from each order. These feed the earnings breakdown on every vendor's wallet.",
    sections: [
      {
        id: 'platform-commission',
        title: 'Platform commission',
        description:
          'Taken off the item price before the vendor’s earnings are computed.',
        fields: [
          {
            key: 'platform_commission_type',
            label: 'Commission type',
            help: 'Charge a percentage of the item price, or a flat amount per item.',
            kind: 'select',
            options: [
              { value: 'percent', label: 'Percentage of price' },
              { value: 'fixed', label: 'Flat amount' },
            ],
          },
          {
            key: 'platform_commission_percent',
            label: 'Commission rate',
            help: 'Applied when the commission type is a percentage.',
            ...PERCENT,
            activeWhen: { key: 'platform_commission_type', equals: 'percent' },
          },
          {
            key: 'platform_commission_flat',
            label: 'Flat commission',
            help: 'Applied when the commission type is a flat amount.',
            ...NAIRA,
            activeWhen: { key: 'platform_commission_type', equals: 'fixed' },
          },
        ],
      },
      {
        id: 'fees-and-tax',
        title: 'Handling fees & tax',
        description:
          'Deducted alongside commission. The percentage and flat handling fees both apply — set one to zero to use only the other.',
        fields: [
          {
            key: 'payment_handling_fee_percent',
            label: 'Handling fee rate',
            help: 'Percentage of the order total kept to cover payment gateway charges.',
            ...PERCENT,
          },
          {
            key: 'payment_handling_fee_flat',
            label: 'Flat handling fee',
            help: 'Fixed charge added to the handling fee on every order.',
            ...NAIRA,
          },
          {
            key: 'tax_percent',
            label: 'Tax',
            help: 'Percentage of the order total withheld as tax.',
            ...PERCENT,
          },
        ],
      },
    ],
  },
  {
    label: 'Orders',
    slug: 'orders',
    description:
      'How long an order waits on a vendor, how long a customer can return, and what a late delivery costs.',
    sections: [
      {
        id: 'order-lifecycle',
        title: 'Order lifecycle',
        description:
          'An order a vendor never answers is rejected automatically; a delivered order can be returned inside the window.',
        fields: [
          {
            key: 'auto_reject_hours',
            label: 'Auto-reject after',
            help: 'Hours a new order waits for the vendor before it is rejected on their behalf.',
            kind: 'number',
            unit: 'hours',
            min: 1,
            max: 720,
            step: 1,
            integer: true,
          },
          {
            key: 'return_window_days',
            label: 'Return window',
            help: 'Days after delivery in which a customer can still open a return.',
            kind: 'number',
            unit: 'days',
            min: 0,
            max: 90,
            step: 1,
            integer: true,
          },
        ],
      },
      {
        id: 'late-penalties',
        title: 'Late delivery penalties',
        description:
          'A vendor past their promised date loses a share of the order’s earnings, accruing daily up to a cap.',
        fields: [
          {
            key: 'late_penalty_percent_per_day',
            label: 'Penalty per day late',
            help: 'Deducted from the vendor’s earnings for each day past the promised date.',
            ...PERCENT,
          },
          {
            key: 'late_penalty_max_percent',
            label: 'Maximum penalty',
            help: 'The ceiling the daily penalty accrues to, however late the delivery runs.',
            ...PERCENT,
          },
        ],
      },
    ],
  },
  {
    label: 'Inventory',
    slug: 'inventory',
    description:
      'The thresholds behind the “low stock” flag vendors see on their catalogue.',
    sections: [
      {
        id: 'availability-thresholds',
        title: 'Availability thresholds',
        description:
          'A variant at or under the unit threshold, or a fabric under the yard threshold, is flagged low stock.',
        fields: [
          {
            key: 'low_stock_threshold',
            label: 'Low stock threshold',
            help: 'A variant with this many units left or fewer is flagged low stock.',
            kind: 'number',
            unit: 'units',
            min: 0,
            step: 1,
            integer: true,
          },
          {
            key: 'low_fabric_yards',
            label: 'Low fabric threshold',
            help: 'Yards of fabric left before the flag. Leave at 0 to fall back to twice the fabric’s own minimum cut.',
            kind: 'number',
            unit: 'yards',
            min: 0,
            step: 0.5,
          },
        ],
      },
    ],
  },
  {
    label: 'AI & tokens',
    slug: 'ai-and-tokens',
    description:
      'What a token costs to buy, and how many each AI action spends.',
    sections: [
      {
        id: 'token-cost-per-action',
        title: 'Token cost per action',
        description:
          'Debited from the customer’s balance each time the action runs. Zero makes the action free.',
        fields: [
          {
            key: 'image_measurement_token_price',
            label: 'Image measurement',
            help: 'Taking measurements from a photo.',
            ...TOKENS,
          },
          {
            key: 'video_measurement_token_price',
            label: 'Video measurement',
            help: 'Taking measurements from a video.',
            ...TOKENS,
          },
          {
            key: 'outfit_generation_token_price',
            label: 'Outfit generation',
            help: 'Generating an outfit from a prompt.',
            ...TOKENS,
          },
          {
            key: 'edit_garment_token_price',
            label: 'Edit garment',
            help: 'Editing a generated garment.',
            ...TOKENS,
          },
          {
            key: 'run_prediction_token_price',
            label: 'Run prediction',
            help: 'Running a fit or style prediction.',
            ...TOKENS,
          },
          {
            key: 'analyze_reference_token_price',
            label: 'Analyze reference',
            help: 'Analyzing a reference image a customer uploads.',
            ...TOKENS,
          },
          {
            key: 'ai_ask_token_price',
            label: 'Ask AI',
            help: 'A single question to the assistant.',
            ...TOKENS,
          },
        ],
      },
      {
        id: 'ai-access',
        title: 'Access',
        description: 'Who can reach the assistant.',
        fields: [
          {
            key: 'ai_ask_requires_auth',
            label: 'Require sign-in to ask AI',
            help: 'On, only signed-in customers can ask. Off, the assistant answers anonymous visitors too.',
            kind: 'switch',
          },
        ],
      },
    ],
  },
];

export const SETTINGS_TAB_PARAM = 'tab';

/**
 * The AI tab is the one tab with a field outside its sections — the token price
 * pair — so both the content and the tab's field list have to know it by name.
 */
export const AI_TOKENS_TAB_SLUG = 'ai-and-tokens';

export const DEFAULT_SETTINGS_TAB = SETTINGS_TABS[0];

// Unknown or missing slugs fall back to the first tab rather than rendering an
// empty page.
export const tabFromSlug = (slug?: string | null): SettingsTab =>
  SETTINGS_TABS.find((tab) => tab.slug === slug?.toLowerCase()) ??
  DEFAULT_SETTINGS_TAB;

export const slugForTab = (label: string): string =>
  SETTINGS_TABS.find((tab) => tab.label === label)?.slug ??
  DEFAULT_SETTINGS_TAB.slug;

/**
 * The USD token price sits outside the section catalogue because it is half of
 * a pair: an administrator sets USD, and the backend derives NGN from it. The
 * AI & tokens tab renders the pair as its own card. It is still a field like
 * any other for drafting, validation and diffing.
 */
export const TOKEN_PRICE_USD_FIELD: SettingsFieldSpec = {
  key: TOKEN_PRICE_USD_KEY,
  label: 'Token price',
  help: 'What one token costs in USD. The naira price is converted from this.',
  kind: 'number',
  unit: 'usd',
  min: 0,
  step: 0.01,
};

/** Every field in the catalogue, flattened — used for drafts and validation. */
export const ALL_SETTINGS_FIELDS: SettingsFieldSpec[] = [
  ...SETTINGS_TABS.flatMap((tab) =>
    tab.sections.flatMap((section) => section.fields)
  ),
  TOKEN_PRICE_USD_FIELD,
];

/**
 * The fields a tab is responsible for.
 *
 * Each tab saves its own fields, so this is what scopes the diff, the
 * validation and the payload for one Save. Every field belongs to exactly one
 * tab, which is what lets the per-tab counts be summed into a total.
 */
export const fieldKeysForTab = (tab: SettingsTab): SettingsFieldKey[] => {
  const keys = tab.sections.flatMap((section) =>
    section.fields.map((field) => field.key)
  );
  return tab.slug === AI_TOKENS_TAB_SLUG
    ? [...keys, TOKEN_PRICE_USD_KEY]
    : keys;
};

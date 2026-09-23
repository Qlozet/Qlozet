'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/routes';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Wallet, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useGetBusinessProfileQuery,
  useUpdateBusinessSettingsMutation,
} from '@/redux/services/settings/settings.api-slice';
import type { OrderSettingsData } from '@/lib/validations/settings';
import Loader from '@/components/Loader';
import { readApiError } from '@/redux/services/types';

// ─── Types ───────────────────────────────────────────────────────────
interface ToggleSettingItem {
  type: 'toggle';
  id: string;
  label: string;
  description: string;
  value: boolean;
}

interface InputSettingItem {
  type: 'input';
  id: string;
  label: string;
  description: string;
  value: string;
  inputType?: 'number' | 'text';
  placeholder?: string;
}

interface LinkSettingItem {
  type: 'link';
  id: string;
  label: string;
  description: string;
  /** Where the row navigates to. */
  href: string;
}

type SettingItem = ToggleSettingItem | InputSettingItem | LinkSettingItem;

interface SettingsSection {
  title: string;
  icon: React.ReactNode;
  items: SettingItem[];
}

// Starting point for the controls *only once real settings have loaded* — the
// API may omit individual fields. These are never shown as saved values when
// the settings request fails; see the unavailable notice below.
const BLANK_SETTINGS: OrderSettingsData = {
  orderConfirmation: false,
  maxOpenOrders: 0,
};

// ─── Setting Row Component ──────────────────────────────────────────
const SettingRow = ({
  item,
  disabled = false,
  onToggle,
  onInputChange,
}: {
  item: SettingItem;
  /** True when the backing endpoint is unavailable — link rows stay usable. */
  disabled?: boolean;
  onToggle?: (id: string, value: boolean) => void;
  onInputChange?: (id: string, value: string) => void;
}) => {
  // Link rows never depend on the settings endpoint, so they stay live.
  const rowDisabled = disabled && item.type !== 'link';

  // Sits on the row element itself, whichever tag that ends up being — on an
  // inner wrapper, `first:`/`last:` would match every row and zero the padding.
  const rowClass = cn(
    'flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0',
    rowDisabled && 'opacity-60'
  );

  const content = (
    <>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{item.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.description}
        </p>
      </div>

      <div className="shrink-0">
        {item.type === 'toggle' && (
          <Switch
            checked={item.value}
            disabled={rowDisabled}
            onCheckedChange={(checked) => onToggle?.(item.id, checked)}
          />
        )}

        {item.type === 'input' && (
          <Input
            type={item.inputType || 'text'}
            value={item.value}
            disabled={rowDisabled}
            onChange={(e) => onInputChange?.(item.id, e.target.value)}
            placeholder={item.placeholder}
            className="w-[80px] h-9 text-center text-sm bg-gray-50 dark:bg-muted border-gray-200 dark:border-white/10 dark:text-gray-200"
          />
        )}

        {item.type === 'link' && (
          <ChevronRight className="size-5 text-muted-foreground" />
        )}
      </div>
    </>
  );

  // Link rows navigate to the page that actually owns the setting.
  return item.type === 'link' ? (
    <Link
      href={item.href}
      className={cn(
        rowClass,
        'cursor-pointer transition-opacity hover:opacity-80'
      )}
    >
      {content}
    </Link>
  ) : (
    <div className={rowClass}>{content}</div>
  );
};

// ─── Settings Card Component ────────────────────────────────────────
const SettingsCard = ({
  section,
  disabled = false,
  onToggle,
  onInputChange,
}: {
  section: SettingsSection;
  disabled?: boolean;
  onToggle: (id: string, value: boolean) => void;
  onInputChange: (id: string, value: string) => void;
}) => {
  return (
    <div className="bg-white dark:bg-card dark:border dark:border-white/10 rounded-xl p-5 lg:p-6 custom-card-shadow">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-border/60">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
          {section.icon}
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          {section.title}
        </h3>
      </div>

      {/* Settings Items */}
      <div className="divide-y divide-border/40">
        {section.items.map((item) => (
          <SettingRow
            key={item.id}
            item={item}
            disabled={disabled}
            onToggle={onToggle}
            onInputChange={onInputChange}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main Order Settings Component ──────────────────────────────────
export const OrderSettingsContent = () => {
  // Order settings are flat fields on the business profile, saved through the
  // same PATCH /business/profile as the external-fabric policy below.
  const {
    data: businessProfile,
    isLoading: isLoadingSettings,
    isError: settingsUnavailable,
  } = useGetBusinessProfileQuery();
  const [updateBusinessSettings, { isLoading: isSaving }] =
    useUpdateBusinessSettingsMutation();

  // ─── Local State (seeded from API) ──────────────────────────────
  const [settings, setSettings] = useState<OrderSettingsData>(BLANK_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [acceptsExternalFabric, setAcceptsExternalFabric] = useState(true);
  const isSavingFabric = isSaving;

  // Sync external fabric toggle from business profile
  useEffect(() => {
    if (businessProfile?.accepts_external_fabric !== undefined) {
      setAcceptsExternalFabric(businessProfile.accepts_external_fabric);
    }
  }, [businessProfile]);

  // Seed the form from the profile. Fields the backend hasn't set yet fall back
  // to BLANK_SETTINGS rather than an invented default.
  useEffect(() => {
    if (!businessProfile) return;
    setSettings({
      orderConfirmation:
        businessProfile.order_confirmation ?? BLANK_SETTINGS.orderConfirmation,
      maxOpenOrders:
        businessProfile.max_open_orders ?? BLANK_SETTINGS.maxOpenOrders,
    });
    setHasChanges(false);
  }, [businessProfile]);

  // ─── Handlers ───────────────────────────────────────────────────
  const handleToggle = (id: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
    setHasChanges(true);
  };

  const handleInputChange = (id: string, value: string) => {
    const parsedValue = id === 'maxOpenOrders' ? Number(value) || 0 : value;
    setSettings((prev) => ({ ...prev, [id]: parsedValue }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Map the form's camelCase state onto the backend's flat snake_case
      // fields (UpdateBusinessProfileDto).
      await updateBusinessSettings({
        order_confirmation: settings.orderConfirmation,
        max_open_orders: Number(settings.maxOpenOrders) || 0,
      }).unwrap();
      toast.success('Order settings saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(readApiError(error, 'Failed to save settings'));
    }
  };

  const handleExternalFabricToggle = async (value: boolean) => {
    setAcceptsExternalFabric(value);
    try {
      await updateBusinessSettings({ accepts_external_fabric: value }).unwrap();
      toast.success(
        value
          ? 'External fabric acceptance enabled'
          : 'External fabric acceptance disabled'
      );
    } catch (error: any) {
      setAcceptsExternalFabric(!value); // revert on error
      toast.error(readApiError(error, 'Failed to update setting'));
    }
  };

  // ─── Loading State ──────────────────────────────────────────────
  if (isLoadingSettings) {
    return <Loader />;
  }

  // ─── Section Definitions ────────────────────────────────────────
  const sections: SettingsSection[] = [
    {
      title: 'Order Processing',
      icon: <Package className="size-4" />,
      items: [
        {
          type: 'toggle',
          id: 'orderConfirmation',
          label: 'Auto-confirm Orders',
          description:
            'Skip the confirm step for fabric, accessories and ready-to-wear. Tailored orders always wait for you.',
          value: settings.orderConfirmation,
        },
        {
          type: 'input',
          id: 'maxOpenOrders',
          label: 'Order Capacity',
          description:
            'How many orders you can have in progress at once. Customers see “fully booked” until you finish one. 0 means no limit.',
          value: String(settings.maxOpenOrders ?? ''),
          inputType: 'number',
          placeholder: '0',
        },
      ],
    },
    {
      title: 'Pricing & Sizing',
      icon: <Wallet className="size-4" />,
      items: [
        {
          type: 'link',
          id: 'pricingRules',
          label: 'Pricing Rules',
          description: 'Configure discounts & promotions',
          href: APP_ROUTES.productsDiscounts,
        },
        {
          type: 'link',
          id: 'measurementSettings',
          label: 'Measurement Settings',
          description: 'Manage measuring size guides',
          href: APP_ROUTES.productsSizeGuides,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sections.map((section) => (
          <SettingsCard
            key={section.title}
            section={section}
            disabled={settingsUnavailable}
            onToggle={handleToggle}
            onInputChange={handleInputChange}
          />
        ))}
      </div>

      {/* External Fabric Policy — dedicated card, saved via business profile API */}
      <div className="bg-white dark:bg-card dark:border dark:border-white/10 rounded-xl p-5 lg:p-6 custom-card-shadow">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-border/60">
          <div className="flex items-center justify-center size-8 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Package className="size-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            External Fabric Policy
          </h3>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Accept fabric from other vendors
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {acceptsExternalFabric
                ? 'Customers can apply fabric from other Qlozet vendors to your clothing products. The fabric vendor ships directly to you before you start working.'
                : 'Customers can only use your own fabrics for your clothing products.'}
            </p>
          </div>
          <Switch
            checked={acceptsExternalFabric}
            onCheckedChange={handleExternalFabricToggle}
            disabled={isSavingFabric}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges || settingsUnavailable}
          className="min-w-[160px] bg-[#3d2817] hover:bg-[#2e1e10] text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black"
        >
          {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default OrderSettingsContent;

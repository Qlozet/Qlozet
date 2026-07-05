'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package,
  RotateCcw,
  Wallet,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useGetOrderSettingsQuery,
  useUpdateOrderSettingsMutation,
} from '@/redux/services/settings/settings.api-slice';
import type { OrderSettingsData } from '@/lib/validations/settings';
import Loader from '@/components/Loader';

// ─── Types ───────────────────────────────────────────────────────────
interface ToggleSettingItem {
  type: 'toggle';
  id: string;
  label: string;
  description: string;
  value: boolean;
}

interface SelectSettingItem {
  type: 'select';
  id: string;
  label: string;
  description: string;
  value: string;
  options: { label: string; value: string }[];
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
}

type SettingItem =
  | ToggleSettingItem
  | SelectSettingItem
  | InputSettingItem
  | LinkSettingItem;

interface SettingsSection {
  title: string;
  icon: React.ReactNode;
  items: SettingItem[];
}

// ─── Default settings (fallback if API hasn't returned yet) ─────────
const DEFAULT_SETTINGS: OrderSettingsData = {
  orderConfirmation: true,
  orderNotifications: true,
  orderTracking: false,
  dailyOrderLimit: 50,
  automaticRefunds: false,
  returnWindow: 14,
  customOrderOptions: true,
  foreignFabricAcceptance: false,
  defaultCurrency: 'NGN',
};

// ─── Setting Row Component ──────────────────────────────────────────
const SettingRow = ({
  item,
  onToggle,
  onSelectChange,
  onInputChange,
}: {
  item: SettingItem;
  onToggle?: (id: string, value: boolean) => void;
  onSelectChange?: (id: string, value: string) => void;
  onInputChange?: (id: string, value: string) => void;
}) => {
  return (
    <div className='flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0'>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-foreground'>{item.label}</p>
        <p className='text-xs text-muted-foreground mt-0.5'>
          {item.description}
        </p>
      </div>

      <div className='shrink-0'>
        {item.type === 'toggle' && (
          <Switch
            checked={item.value}
            onCheckedChange={(checked) => onToggle?.(item.id, checked)}
          />
        )}

        {item.type === 'select' && (
          <Select
            value={item.value}
            onValueChange={(val) => onSelectChange?.(item.id, val)}
          >
            <SelectTrigger className='w-[130px] h-9 text-xs'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {item.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {item.type === 'input' && (
          <Input
            type={item.inputType || 'text'}
            value={item.value}
            onChange={(e) => onInputChange?.(item.id, e.target.value)}
            placeholder={item.placeholder}
            className='w-[80px] h-9 text-center text-sm'
          />
        )}

        {item.type === 'link' && (
          <ChevronRight className='size-5 text-muted-foreground' />
        )}
      </div>
    </div>
  );
};

// ─── Settings Card Component ────────────────────────────────────────
const SettingsCard = ({
  section,
  onToggle,
  onSelectChange,
  onInputChange,
}: {
  section: SettingsSection;
  onToggle: (id: string, value: boolean) => void;
  onSelectChange: (id: string, value: string) => void;
  onInputChange: (id: string, value: string) => void;
}) => {
  return (
    <div className='bg-white rounded-xl p-5 lg:p-6 custom-card-shadow'>
      {/* Card Header */}
      <div className='flex items-center gap-2.5 mb-5 pb-4 border-b border-border/60'>
        <div className='flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary'>
          {section.icon}
        </div>
        <h3 className='text-sm font-semibold text-foreground'>
          {section.title}
        </h3>
      </div>

      {/* Settings Items */}
      <div className='divide-y divide-border/40'>
        {section.items.map((item) => (
          <SettingRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            onSelectChange={onSelectChange}
            onInputChange={onInputChange}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main Order Settings Component ──────────────────────────────────
export const OrderSettingsContent = () => {
  // ─── API Integration ────────────────────────────────────────────
  const { data: apiData, isLoading: isLoadingSettings } = useGetOrderSettingsQuery();
  const [updateOrderSettings, { isLoading: isSaving }] = useUpdateOrderSettingsMutation();

  // ─── Local State (seeded from API) ──────────────────────────────
  const [settings, setSettings] = useState<OrderSettingsData>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // Seed local state when API data arrives
  useEffect(() => {
    if (apiData?.data) {
      setSettings(apiData.data);
    }
  }, [apiData]);

  // ─── Handlers ───────────────────────────────────────────────────
  const handleToggle = (id: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
    setHasChanges(true);
  };

  const handleSelectChange = (id: string, value: string) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
    setHasChanges(true);
  };

  const handleInputChange = (id: string, value: string) => {
    // For numeric fields, parse to number
    const numericFields = ['dailyOrderLimit', 'returnWindow'];
    const parsedValue = numericFields.includes(id) ? Number(value) || 0 : value;
    setSettings((prev) => ({ ...prev, [id]: parsedValue }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateOrderSettings(settings).unwrap();
      toast.success('Order settings saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save settings');
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
      icon: <Package className='size-4' />,
      items: [
        {
          type: 'toggle',
          id: 'orderConfirmation',
          label: 'Order Confirmation',
          description: 'Automatically confirm incoming orders',
          value: settings.orderConfirmation,
        },
        {
          type: 'toggle',
          id: 'orderNotifications',
          label: 'Order Notifications',
          description: 'Notify on order status changes',
          value: settings.orderNotifications,
        },
        {
          type: 'toggle',
          id: 'orderTracking',
          label: 'Order Tracking',
          description: 'Enable customer order tracking',
          value: settings.orderTracking,
        },
        {
          type: 'input',
          id: 'dailyOrderLimit',
          label: 'Daily Order Limit',
          description: 'Maximum orders accepted per day',
          value: String(settings.dailyOrderLimit ?? ''),
          inputType: 'number',
          placeholder: '50',
        },
      ],
    },
    {
      title: 'Returns & Customization',
      icon: <RotateCcw className='size-4' />,
      items: [
        {
          type: 'toggle',
          id: 'automaticRefunds',
          label: 'Automatic Refunds',
          description: 'Process refunds automatically on returns',
          value: settings.automaticRefunds,
        },
        {
          type: 'select',
          id: 'returnWindow',
          label: 'Return Window',
          description: 'Days customers can return items',
          value: String(settings.returnWindow),
          options: [
            { label: '7 days', value: '7' },
            { label: '14 days', value: '14' },
            { label: '30 days', value: '30' },
            { label: '60 days', value: '60' },
            { label: 'No returns', value: '0' },
          ],
        },
        {
          type: 'toggle',
          id: 'customOrderOptions',
          label: 'Custom Order Options',
          description: 'Allow add-ons & customization on orders',
          value: settings.customOrderOptions,
        },
        {
          type: 'toggle',
          id: 'foreignFabricAcceptance',
          label: 'Foreign Fabric Acceptance',
          description: 'Accept fabrics from other vendors',
          value: settings.foreignFabricAcceptance,
        },
      ],
    },
    {
      title: 'Payment & Currency',
      icon: <Wallet className='size-4' />,
      items: [
        {
          type: 'select',
          id: 'defaultCurrency',
          label: 'Default Currency',
          description: 'Platform display currency',
          value: settings.defaultCurrency,
          options: [
            { label: 'NGN ₦', value: 'NGN' },
            { label: 'USD $', value: 'USD' },
            { label: 'GBP £', value: 'GBP' },
            { label: 'EUR €', value: 'EUR' },
          ],
        },
        {
          type: 'link',
          id: 'pricingRules',
          label: 'Pricing Rules',
          description: 'Configure discounts & promotions',
        },
        {
          type: 'link',
          id: 'measurementSettings',
          label: 'Measurement Settings',
          description: 'Manage measuring size guides',
        },
      ],
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
        {sections.map((section) => (
          <SettingsCard
            key={section.title}
            section={section}
            onToggle={handleToggle}
            onSelectChange={handleSelectChange}
            onInputChange={handleInputChange}
          />
        ))}
      </div>

      {/* Save Button */}
      <div className='pt-2'>
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className='min-w-[160px]'
        >
          {isSaving && <Loader2 className='mr-2 size-4 animate-spin' />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default OrderSettingsContent;

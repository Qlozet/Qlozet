'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  closeStorePicker,
  openStorePicker,
  selectActiveBusiness,
  selectBusinesses,
  selectStorePickerOpen,
  selectStorePickerReason,
} from '@/redux/slices/auth-slice';
import { signOut } from '@/redux/api/base-api';
import { useSwitchStore } from '@/lib/hooks/use-switch-store';
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated';
import { APP_ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { BusinessPicker } from '@/pattern/auth/organisms/business-picker';

/**
 * Compact "which store am I in" button for the app shell. Only shown to
 * people who belong to more than one store; it opens the store picker.
 */
export const StoreSwitcherButton = ({
  className,
  onOpen,
}: {
  className?: string;
  /** Runs before the picker opens, e.g. to close a sheet it sits in. */
  onOpen?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const hasHydrated = useHasHydrated();
  const businesses = useAppSelector(selectBusinesses);
  const activeBusiness = useAppSelector(selectActiveBusiness);

  // The list is persisted, so it only exists after rehydration.
  if (!hasHydrated || (businesses?.length ?? 0) < 2) return null;

  return (
    <button
      type="button"
      onClick={() => {
        onOpen?.();
        dispatch(openStorePicker());
      }}
      aria-label="Switch store"
      className={cn(
        'flex max-w-[220px] items-center gap-2 rounded-[12px] border border-border bg-[#F8F9FA] dark:bg-muted px-3 py-2 text-sm text-dark dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors cursor-pointer',
        className
      )}
    >
      <Store className="size-4 shrink-0" />
      <span className="truncate">
        {activeBusiness?.business_name || 'Choose store'}
      </span>
      <ChevronsUpDown className="size-4 shrink-0 text-gray-500" />
    </button>
  );
};

/**
 * The store picker itself, mounted once in the app shell. Opened by the
 * switcher button, or by the base query when the person lost access to the
 * store they had open (then it can't be dismissed, only switched or signed
 * out of).
 */
export const StorePickerHost = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const hasHydrated = useHasHydrated();
  const businesses = useAppSelector(selectBusinesses);
  const activeBusiness = useAppSelector(selectActiveBusiness);
  const open = useAppSelector(selectStorePickerOpen);
  const reason = useAppSelector(selectStorePickerReason);
  const { switchStore, switchingId } = useSwitchStore();

  if (!hasHydrated || !open) return null;

  const forced = !!reason;

  const handleSelect = async (businessId: string) => {
    if (!forced && businessId === activeBusiness?._id) {
      dispatch(closeStorePicker());
      return;
    }
    const switched = await switchStore(businessId);
    if (!switched) return;
    toast.success(`Now working in ${switched.business_name}`);
    router.push(APP_ROUTES.dashboard);
  };

  return (
    <BusinessPicker
      businesses={businesses ?? []}
      onSelect={handleSelect}
      isLoading={!!switchingId}
      loadingId={switchingId}
      activeId={forced ? null : activeBusiness?._id}
      message={
        reason ? `${reason} Choose another store to keep working in:` : null
      }
      onClose={forced ? undefined : () => dispatch(closeStorePicker())}
      onSignOut={forced ? () => signOut(dispatch) : undefined}
    />
  );
};

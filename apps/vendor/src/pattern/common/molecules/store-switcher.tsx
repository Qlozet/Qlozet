'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, Loader2, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  addBusiness,
  closeStorePicker,
  openStorePicker,
  selectActiveBusiness,
  selectBusinesses,
  selectStorePickerOpen,
  selectStorePickerReason,
} from '@/redux/slices/auth-slice';
import { signOut } from '@/redux/api/base-api';
import { useSwitchStore } from '@/lib/hooks/use-switch-store';
import { useNewStoreMutation } from '@/redux/services/auth/auth.api-slice';
import { readApiError } from '@/redux/services/types';
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated';
import { APP_ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { BusinessPicker } from '@/pattern/auth/organisms/business-picker';

/**
 * Compact "which store am I in" button for the app shell; it opens the store
 * picker, where people switch stores or open a store of their own.
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
  if (!hasHydrated || !activeBusiness) return null;
  const several = (businesses?.length ?? 0) > 1;

  return (
    <button
      type="button"
      onClick={() => {
        onOpen?.();
        dispatch(openStorePicker());
      }}
      aria-label={several ? 'Switch store' : 'Your stores'}
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
  const [creating, setCreating] = React.useState(false);

  if (!hasHydrated || !open) return null;

  const forced = !!reason;

  if (creating) {
    return (
      <NewStoreDialog
        onBack={() => setCreating(false)}
        onCreated={async (business) => {
          dispatch(
            addBusiness({
              _id: business._id,
              business_name: business.business_name,
              role: 'owner',
              role_id: '',
              is_owner: true,
            })
          );
          // The server already made it the active store; switching fetches
          // fresh tokens and clears the old store's cached data.
          const switched = await switchStore(business._id);
          setCreating(false);
          if (!switched) return;
          toast.success(`${business.business_name} is ready.`);
          router.push(APP_ROUTES.dashboard);
        }}
      />
    );
  }

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
      onCreate={() => setCreating(true)}
    />
  );
};

/** Name a new store; the person owns it and keeps their other stores. */
const NewStoreDialog = ({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: (business: {
    _id: string;
    business_name: string;
  }) => Promise<void>;
}) => {
  const [newStore, { isLoading }] = useNewStoreMutation();
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [finishing, setFinishing] = React.useState(false);
  const busy = isLoading || finishing;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const business_name = name.trim();
    if (business_name.length < 2) {
      setError('Enter your store name (at least 2 characters).');
      return;
    }
    setError(null);
    try {
      const res = await newStore({ business_name }).unwrap();
      setFinishing(true);
      await onCreated(res.data.business);
    } catch (err: unknown) {
      setError(readApiError(err, "Couldn't open the store. Please try again."));
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-store-title"
        onSubmit={submit}
        className="bg-white dark:bg-card rounded-xl p-6 w-full max-w-md shadow-2xl"
      >
        <h2
          id="new-store-title"
          className="text-lg font-semibold text-gray-900 dark:text-foreground font-poppins"
        >
          Open a new store
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">
          You&apos;ll own it, on this same login. Your place in your other
          stores doesn&apos;t change, and each store keeps its own money, orders
          and team.
        </p>
        <label
          htmlFor="new-store-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Store name
        </label>
        <input
          id="new-store-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          maxLength={80}
          placeholder="e.g. Ada Couture"
          className="w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-muted px-3 py-2.5 text-sm text-gray-900 dark:text-foreground outline-none focus:border-primary"
        />
        {error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-foreground cursor-pointer disabled:opacity-60"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground cursor-pointer disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Open store
          </button>
        </div>
      </form>
    </div>
  );
};

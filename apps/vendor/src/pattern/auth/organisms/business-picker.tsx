'use client';

import React from 'react';
import { Loader2, Plus } from 'lucide-react';
import type { LoginResponseBusiness } from '@/redux/services/auth/auth.api-slice';

interface BusinessPickerProps {
  businesses: LoginResponseBusiness[];
  onSelect: (businessId: string) => void;
  isLoading?: boolean;
  loadingId?: string | null;
  /** The store open right now, marked "Current" in the list. */
  activeId?: string | null;
  /** Shown above the list instead of the default prompt (e.g. lost access). */
  message?: string | null;
  /** Makes the picker dismissible (switching by choice). */
  onClose?: () => void;
  /** Offers a way out when there's nothing to go back to (lost access). */
  onSignOut?: () => void;
  /** Shows "Open a new store" under the list. */
  onCreate?: () => void;
}

export const BusinessPicker: React.FC<BusinessPickerProps> = ({
  businesses,
  onSelect,
  isLoading = false,
  loadingId = null,
  activeId = null,
  message = null,
  onClose,
  onSignOut,
  onCreate,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onClose && !isLoading ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-picker-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-card rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <h2
          id="business-picker-title"
          className="text-lg font-semibold text-gray-900 dark:text-foreground font-poppins"
        >
          {businesses.length > 1 ? 'Select Business' : 'Your stores'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
          {message ||
            (businesses.length > 1
              ? 'You belong to multiple businesses. Choose which one to work in:'
              : 'Open a store of your own on this same login.')}
        </p>

        <div className="space-y-3">
          {businesses.map((biz) => (
            <button
              key={biz._id}
              onClick={() => onSelect(biz._id)}
              disabled={isLoading}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {/* Business avatar / logo initial */}
              <div className="size-10 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white font-semibold shrink-0">
                {biz.business_logo_url ? (
                  <img
                    src={biz.business_logo_url}
                    alt={biz.business_name}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  (biz.business_name?.charAt(0)?.toUpperCase() ?? '?')
                )}
              </div>

              {/* Business info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-foreground truncate">
                  {biz.business_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {biz.role?.replace(/_/g, ' ')}
                </p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 shrink-0">
                {activeId === biz._id && (
                  <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
                    Current
                  </span>
                )}
                {biz.is_owner && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                    Owner
                  </span>
                )}
                {loadingId === biz._id && (
                  <Loader2 className="size-4 animate-spin text-primary dark:text-white" />
                )}
              </div>
            </button>
          ))}
        </div>

        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            disabled={isLoading}
            className="mt-3 w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-300 dark:border-white/20 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-60"
          >
            <Plus className="size-4" />
            Open a new store
          </button>
        )}

        {(onClose || onSignOut) && (
          <div className="flex items-center justify-end gap-3 mt-6">
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                disabled={isLoading}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-destructive cursor-pointer disabled:opacity-60"
              >
                Sign out
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-foreground cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

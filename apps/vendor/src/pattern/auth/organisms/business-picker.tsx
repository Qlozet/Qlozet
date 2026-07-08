'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import type { LoginResponseBusiness } from '@/redux/services/auth/auth.api-slice';

interface BusinessPickerProps {
  businesses: LoginResponseBusiness[];
  onSelect: (businessId: string) => void;
  isLoading?: boolean;
  loadingId?: string | null;
}

export const BusinessPicker: React.FC<BusinessPickerProps> = ({
  businesses,
  onSelect,
  isLoading = false,
  loadingId = null,
}) => {
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
      <div className='bg-white dark:bg-card rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200'>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-foreground font-poppins'>
          Select Business
        </h2>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6'>
          You belong to multiple businesses. Choose which one to work in:
        </p>

        <div className='space-y-3'>
          {businesses.map((biz) => (
            <button
              key={biz._id}
              onClick={() => onSelect(biz._id)}
              disabled={isLoading}
              className='w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left cursor-pointer disabled:opacity-60 disabled:cursor-wait'
            >
              {/* Business avatar / logo initial */}
              <div className='size-10 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white font-semibold shrink-0'>
                {biz.business_logo_url ? (
                  <img
                    src={biz.business_logo_url}
                    alt={biz.business_name}
                    className='size-10 rounded-full object-cover'
                  />
                ) : (
                  biz.business_name?.charAt(0)?.toUpperCase() ?? '?'
                )}
              </div>

              {/* Business info */}
              <div className='flex-1 min-w-0'>
                <p className='font-medium text-gray-900 dark:text-foreground truncate'>
                  {biz.business_name}
                </p>
                <p className='text-sm text-gray-500 dark:text-gray-400 capitalize'>
                  {biz.role?.replace(/_/g, ' ')}
                </p>
              </div>

              {/* Badges */}
              <div className='flex items-center gap-2 shrink-0'>
                {biz.is_owner && (
                  <span className='text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium'>
                    Owner
                  </span>
                )}
                {loadingId === biz._id && (
                  <Loader2 className='size-4 animate-spin text-primary dark:text-white' />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

'use client';

import { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Calendar, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Product } from '@/redux/services/products/products.api-slice';
import { useScheduleAdminProductActivationMutation } from '@/redux/services/products/admin-products.api-slice';
import { readApiError } from '@/redux/services/types';
import { getProductName } from '@/lib/products';

interface ScheduleProductActivationModalProps {
  product?: Product;
}

/**
 * Schedules a product to go live on its own, via
 * PATCH /admin/products/{id}/schedule-activation. A cron on the API flips the
 * status to active when the date passes.
 *
 * The dialog used to toast "scheduled" without calling anything, so nothing was
 * ever actually scheduled.
 */
export const ScheduleProductActivationModal =
  NiceModal.create<ScheduleProductActivationModalProps>(({ product }) => {
    const modal = useModal();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [schedule, { isLoading }] =
      useScheduleAdminProductActivationMutation();

    if (!modal.visible) return null;

    const handleClose = () => {
      if (!isLoading) modal.remove();
    };

    // The API rejects a past date, so catch it here rather than round-tripping.
    const chosen = date && time ? new Date(`${date}T${time}`) : undefined;
    const isPast = Boolean(chosen && chosen.getTime() <= Date.now());
    const isValid = Boolean(
      chosen && !Number.isNaN(chosen.getTime()) && !isPast
    );

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (!product?._id) {
        toast.error('This product is missing an id — reload and try again.');
        return;
      }
      if (!chosen || !isValid) {
        toast.error(
          isPast
            ? 'Pick a date and time in the future.'
            : 'Please select a date and time.'
        );
        return;
      }

      try {
        await schedule({
          id: product._id,
          activation_date: chosen.toISOString(),
        }).unwrap();
        toast.success(
          `${getProductName(product)} will go live on ${chosen.toLocaleString()}`
        );
        modal.remove();
      } catch (error) {
        toast.error(readApiError(error, 'Could not schedule this product.'));
      }
    };

    // Today, as YYYY-MM-DD, so the picker can't offer a past day.
    const today = new Date().toISOString().slice(0, 10);

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Dialog */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-activation-title"
          className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl"
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-muted/80"
          >
            <X className="size-4" />
          </button>

          <h2
            id="schedule-activation-title"
            className="text-lg font-semibold text-foreground"
          >
            Schedule product activation
          </h2>

          {product && (
            <p className="mt-1 text-sm text-grey3 dark:text-gray-400">
              {getProductName(product)}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="schedule-date"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Date
              </label>
              <div className="relative">
                <Input
                  id="schedule-date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11 pr-10"
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="schedule-time"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Time
              </label>
              <div className="relative">
                <Input
                  id="schedule-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-11 pr-10"
                />
                <Clock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {isPast && (
              <p className="text-xs text-error">
                That time has already passed — pick a future date and time.
              </p>
            )}

            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="h-11 w-full text-sm"
            >
              {isLoading ? 'Scheduling…' : 'Schedule activation'}
            </Button>
          </form>
        </div>
      </div>
    );
  });

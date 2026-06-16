'use client';

import { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Calendar, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Product } from '@/redux/services/products/products.api-slice';
import { getProductName } from '@/lib/products';

interface ScheduleProductActivationModalProps {
  product?: Product;
  onSchedule?: (args: { product?: Product; date: string; time: string }) => void;
}

export const ScheduleProductActivationModal =
  NiceModal.create<ScheduleProductActivationModalProps>(
    ({ product, onSchedule }) => {
      const modal = useModal();
      const [date, setDate] = useState('');
      const [time, setTime] = useState('');

      if (!modal.visible) return null;

      const handleClose = () => modal.remove();
      const isValid = Boolean(date && time);

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) {
          toast.error('Please select a date and time.');
          return;
        }
        onSchedule?.({ product, date, time });
        toast.success(
          product
            ? `${getProductName(product)} scheduled for activation`
            : 'Product scheduled for activation'
        );
        handleClose();
      };

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
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition"
            >
              <X className="size-4" />
            </button>

            <h2
              id="schedule-activation-title"
              className="text-lg font-semibold text-foreground"
            >
              Schedule product activation
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Time</label>
                <div className="relative">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <Clock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={!isValid}
                className="h-11 w-full text-sm"
              >
                Schedule activation
              </Button>
            </form>
          </div>
        </div>
      );
    }
  );

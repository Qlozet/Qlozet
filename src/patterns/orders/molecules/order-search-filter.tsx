// Order Search Filter - Molecule
// Search and filter controls for order list

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderFilterSchema, OrderFilterData } from '@/lib/validations/order';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Search, Filter, X, CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OrderSearchFilterProps {
  onFilter: (filters: OrderFilterData) => void;
  onReset: () => void;
  isLoading?: boolean;
  initialFilters?: Partial<OrderFilterData>;
}

export const OrderSearchFilter: React.FC<OrderSearchFilterProps> = ({
  onFilter,
  onReset,
  isLoading = false,
  initialFilters = {},
}) => {
  const form = useForm<OrderFilterData>({
    resolver: zodResolver(orderFilterSchema),
    defaultValues: {
      search: '',
      status: 'all',
      paymentStatus: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
      ...initialFilters,
    },
  });

  const handleSubmit = (data: OrderFilterData) => {
    onFilter(data);
  };

  const handleReset = () => {
    form.reset({
      search: '',
      status: 'all',
      paymentStatus: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    });
    onReset();
  };

  const hasActiveFilters =
    form.watch('search') ||
    form.watch('status') !== 'all' ||
    form.watch('paymentStatus') !== 'all' ||
    form.watch('dateRange');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Search Field */}
          <FormField
            control={form.control}
            name='search'
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormControl>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                    <Input
                      {...field}
                      placeholder='Search by order number, customer, or product...'
                      className='pl-10'
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Status Filter */}
          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem className='w-full sm:w-48'>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Order Status' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='confirmed'>Confirmed</SelectItem>
                    <SelectItem value='processing'>Processing</SelectItem>
                    <SelectItem value='shipped'>Shipped</SelectItem>
                    <SelectItem value='delivered'>Delivered</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                    <SelectItem value='return'>Return</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Payment Status Filter */}
          <FormField
            control={form.control}
            name='paymentStatus'
            render={({ field }) => (
              <FormItem className='w-full sm:w-48'>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Payment Status' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='all'>All Payments</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='paid'>Paid</SelectItem>
                    <SelectItem value='failed'>Failed</SelectItem>
                    <SelectItem value='refunded'>Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Date Range Filter */}
          <FormField
            control={form.control}
            name='dateRange'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full sm:w-64 pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          `${format(new Date(field.value.startDate), 'MMM d')} - ${format(new Date(field.value.endDate), 'MMM d, yyyy')}`
                        ) : (
                          <span>Pick a date range</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='range'
                      selected={
                        field.value
                          ? {
                              from: new Date(field.value.startDate),
                              to: new Date(field.value.endDate),
                            }
                          : undefined
                      }
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          field.onChange({
                            startDate: range.from.toISOString(),
                            endDate: range.to.toISOString(),
                          });
                        } else {
                          field.onChange(undefined);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          {/* Sort By */}
          <FormField
            control={form.control}
            name='sortBy'
            render={({ field }) => (
              <FormItem className='w-full sm:w-48'>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Sort by' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='orderNumber'>Order Number</SelectItem>
                    <SelectItem value='customerName'>Customer</SelectItem>
                    <SelectItem value='total'>Amount</SelectItem>
                    <SelectItem value='createdAt'>Date Created</SelectItem>
                    <SelectItem value='status'>Status</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Sort Order */}
          <FormField
            control={form.control}
            name='sortOrder'
            render={({ field }) => (
              <FormItem className='w-full sm:w-32'>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='asc'>A-Z</SelectItem>
                    <SelectItem value='desc'>Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2'>
          <Button
            type='submit'
            disabled={isLoading}
            className='flex items-center gap-2'
          >
            <Filter className='h-4 w-4' />
            Filter
          </Button>

          {hasActiveFilters && (
            <Button
              type='button'
              variant='outline'
              onClick={handleReset}
              disabled={isLoading}
              className='flex items-center gap-2'
            >
              <X className='h-4 w-4' />
              Reset
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

// Customer Search Filter - Molecule
// Search and filter controls for customer list

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  customerFilterSchema,
  CustomerFilterData,
} from '@/lib/validations/customer';
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
import { Search, Filter, X } from 'lucide-react';

interface CustomerSearchFilterProps {
  onFilter: (filters: CustomerFilterData) => void;
  onReset: () => void;
  isLoading?: boolean;
  initialFilters?: Partial<CustomerFilterData>;
}

export const CustomerSearchFilter: React.FC<CustomerSearchFilterProps> = ({
  onFilter,
  onReset,
  isLoading = false,
  initialFilters = {},
}) => {
  const form = useForm<CustomerFilterData>({
    resolver: zodResolver(customerFilterSchema),
    defaultValues: {
      search: '',
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
      ...initialFilters,
    },
  });

  const handleSubmit = (data: CustomerFilterData) => {
    onFilter(data);
  };

  const handleReset = () => {
    form.reset({
      search: '',
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    });
    onReset();
  };

  const hasActiveFilters =
    form.watch('search') || form.watch('status') !== 'all';

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
                      placeholder='Search customers by name or email...'
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
                      <SelectValue placeholder='Status' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value='name'>Name</SelectItem>
                    <SelectItem value='email'>Email</SelectItem>
                    <SelectItem value='createdAt'>Date Created</SelectItem>
                    <SelectItem value='totalSpent'>Total Spent</SelectItem>
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

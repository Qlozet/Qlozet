// Product Search Filter - Molecule
// Search and filter controls for product list

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Search, Filter, X } from 'lucide-react';

// Product filter schema
const productFilterSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(['all', 'draft', 'active', 'inactive', 'out_of_stock'])
    .default('all'),
  category: z.string().optional(),
  tag: z.enum(['all', 'male', 'female', 'unisex']).default('all'),
  sortBy: z
    .enum(['name', 'price', 'stock', 'createdAt', 'category'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type ProductFilterData = z.infer<typeof productFilterSchema>;

interface ProductSearchFilterProps {
  onFilter: (filters: ProductFilterData) => void;
  onReset: () => void;
  isLoading?: boolean;
  initialFilters?: Partial<ProductFilterData>;
  categories?: { _id: string; name: string }[];
}

export const ProductSearchFilter: React.FC<ProductSearchFilterProps> = ({
  onFilter,
  onReset,
  isLoading = false,
  initialFilters = {},
  categories = [],
}) => {
  const form = useForm<ProductFilterData>({
    resolver: zodResolver(productFilterSchema),
    defaultValues: {
      search: '',
      status: 'all',
      category: '',
      tag: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
      ...initialFilters,
    },
  });

  const handleSubmit = (data: ProductFilterData) => {
    onFilter(data);
  };

  const handleReset = () => {
    form.reset({
      search: '',
      status: 'all',
      category: '',
      tag: 'all',
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
    form.watch('category') ||
    form.watch('tag') !== 'all';

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
                      placeholder='Search products by name, category, or tag...'
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
                    <SelectItem value='draft'>Draft</SelectItem>
                    <SelectItem value='out_of_stock'>Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Category Filter */}
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem className='w-full sm:w-48'>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Category' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value=''>All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Tag Filter */}
          <FormField
            control={form.control}
            name='tag'
            render={({ field }) => (
              <FormItem className='w-full sm:w-32'>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Tag' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='all'>All Tags</SelectItem>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                    <SelectItem value='unisex'>Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col sm:flex-row gap-4'>
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
                    <SelectItem value='price'>Price</SelectItem>
                    <SelectItem value='stock'>Stock</SelectItem>
                    <SelectItem value='createdAt'>Date Created</SelectItem>
                    <SelectItem value='category'>Category</SelectItem>
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
        </div>
      </form>
    </Form>
  );
};

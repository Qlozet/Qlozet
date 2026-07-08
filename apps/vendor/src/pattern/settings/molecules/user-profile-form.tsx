// User Profile Form - Molecule
// Form for user profile with personal information
// fullName and email are read-only (backend doesn't allow updating them via profile endpoint)

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const userProfileSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional().or(z.literal('')),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  country: z.string().optional(),
  address: z.string().optional(),
});

type UserProfileData = z.infer<typeof userProfileSchema>;

interface UserProfileFormProps {
  initialData?: Partial<UserProfileData>;
  onSubmit: (data: UserProfileData) => void;
  isLoading?: boolean;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<UserProfileData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      username: initialData?.username || '',
      phoneNumber: initialData?.phoneNumber || '',
      country: initialData?.country || '',
      address: initialData?.address || '',
    },
  });

  // Reset form when API data loads
  useEffect(() => {
    if (initialData) {
      form.reset({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        username: initialData.username || '',
        phoneNumber: initialData.phoneNumber || '',
        country: initialData.country || '',
        address: initialData.address || '',
      });
    }
  }, [initialData?.fullName, initialData?.email, initialData?.username]);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Full Name (read-only) */}
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='bg-gray-100 dark:bg-muted/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <p className='text-xs text-gray-400 mt-1'>
                    Name cannot be changed here
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='johndoe'
                      className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Address (read-only) */}
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      className='bg-gray-100 dark:bg-muted/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <p className='text-xs text-gray-400 mt-1'>
                    Email cannot be changed here
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name='phoneNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <div className='flex gap-2'>
                      <Select defaultValue='+234'>
                        <SelectTrigger className='w-[100px] bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='+234'>+234</SelectItem>
                          <SelectItem value='+1'>+1</SelectItem>
                          <SelectItem value='+44'>+44</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder='8132205304'
                        className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200 flex-1'
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country (display-only, from business) */}
            <FormField
              control={form.control}
              name='country'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1'>
                    Country
                    <span className='text-gray-400'>ⓘ</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='bg-gray-100 dark:bg-muted/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <p className='text-xs text-gray-400 mt-1'>
                    Set in Organization profile
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address (display-only, from business) */}
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='bg-gray-100 dark:bg-muted/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <p className='text-xs text-gray-400 mt-1'>
                    Set in Organization profile
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Save Button */}
          <div className='flex justify-start'>
            <Button
              type='submit'
              disabled={isLoading}
              className='bg-[#5C2D0D] hover:bg-[#4A2409] text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black px-8 py-2 rounded-lg'
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

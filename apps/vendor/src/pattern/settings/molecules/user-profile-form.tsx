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

    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Row 1: Country & Phone Number */}
            <FormField
              control={form.control}
              name='country'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 flex items-center gap-1'>
                    Country
                    <span className='text-gray-400'>ⓘ</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='bg-[#E5E7EB] border-0 rounded-[8px] text-gray-500 cursor-not-allowed'
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phoneNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <div className='flex gap-2'>
                      <Select defaultValue='+234'>
                        <SelectTrigger className='w-[100px] bg-[#F3F4F6] border-0 rounded-[8px] focus:ring-1 focus:ring-gray-300'>
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
                        className='bg-[#F3F4F6] border-0 rounded-[8px] flex-1 focus-visible:ring-1 focus-visible:ring-gray-300'
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 2: Email Address & Address */}
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      className='bg-[#E5E7EB] border-0 rounded-[8px] text-gray-500 cursor-not-allowed'
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='bg-[#E5E7EB] border-0 rounded-[8px] text-gray-500 cursor-not-allowed'
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 3: NIN (with Verify text) & Empty Column */}
            <div className='col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='flex items-end gap-4'>
                <FormItem className='flex-1'>
                  <FormLabel className='text-sm font-medium text-gray-700 flex items-center gap-1'>
                    National Identity Number
                    <span className='text-orange-500'>ⓘ</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='1234567890'
                      className='bg-[#F3F4F6] border-0 rounded-[8px] focus-visible:ring-1 focus-visible:ring-gray-300'
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <div className='pb-2'>
                  <span className='text-[#5C2D0D] font-bold text-sm cursor-pointer'>Verify NIN</span>
                </div>
              </div>
              <div>{/* Empty column */}</div>
            </div>

            {/* Row 4: Full Name & Username */}
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Full name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='bg-[#E5E7EB] border-0 rounded-[8px] text-gray-500 cursor-not-allowed'
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Hakeem'
                      className='bg-[#F3F4F6] border-0 rounded-[8px] focus-visible:ring-1 focus-visible:ring-gray-300'
                      {...field}
                    />
                  </FormControl>
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
              className='bg-[#3d2817] hover:bg-[#2c1d11] text-white px-10 py-2 rounded-[8px]'
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

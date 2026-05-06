// User Profile Form - Molecule
// Form for user profile with personal information

import React from 'react';
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
  country: z.string().min(1, 'Country is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  nin: z.string().min(1, 'NIN is required'),
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string().min(1, 'Username is required'),
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
      country: initialData?.country || '',
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      nin: initialData?.nin || '',
      fullName: initialData?.fullName || '',
      username: initialData?.username || '',
    },
  });

  return (
    <div className='bg-white rounded-lg p-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Country */}
            <FormField
              control={form.control}
              name='country'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 flex items-center gap-1'>
                    Country
                    <span className='text-gray-400'>ⓘ</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='bg-gray-50 border-gray-200'>
                        <SelectValue placeholder='Select country' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='United States'>
                        United States
                      </SelectItem>
                      <SelectItem value='Nigeria'>Nigeria</SelectItem>
                      <SelectItem value='United Kingdom'>
                        United Kingdom
                      </SelectItem>
                      <SelectItem value='Canada'>Canada</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <div className='flex gap-2'>
                      <Select defaultValue='+234'>
                        <SelectTrigger className='w-[100px] bg-gray-50 border-gray-200'>
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
                        className='bg-gray-50 border-gray-200 flex-1'
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Address */}
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
                      placeholder='admin@garmisland.com'
                      className='bg-gray-50 border-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
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
                      placeholder='24 Axil Street'
                      className='bg-gray-50 border-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* National Identity Number */}
            <FormField
              control={form.control}
              name='nin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 flex items-center gap-1'>
                    National Identity Number
                    <span className='text-orange-500'>ⓘ</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='1234567890'
                      className='bg-gray-50 border-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <div className='mt-1'>
                    <button
                      type='button'
                      className='text-sm text-[#5C2D0D] font-medium hover:underline'
                    >
                      Verify NIN
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Full name */}
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
                      placeholder='Mensah'
                      className='bg-gray-50 border-gray-200'
                      {...field}
                    />
                  </FormControl>
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
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Hakeem'
                      className='bg-gray-50 border-gray-200'
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
              className='bg-[#5C2D0D] hover:bg-[#4A2409] text-white px-8 py-2 rounded-lg'
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

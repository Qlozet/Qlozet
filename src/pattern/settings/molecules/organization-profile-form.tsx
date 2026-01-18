// Organization Profile Form - Molecule
// Form for organization profile with all fields

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
import { Textarea } from '@/components/ui/textarea';

const organizationProfileSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  address: z.string().min(1, 'Address is required'),
  yearFounded: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  registrationId: z.string().optional(),
  about: z.string().optional(),
});

type OrganizationProfileData = z.infer<typeof organizationProfileSchema>;

interface OrganizationProfileFormProps {
  initialData?: Partial<OrganizationProfileData>;
  onSubmit: (data: OrganizationProfileData) => void;
  isLoading?: boolean;
}

export const OrganizationProfileForm: React.FC<
  OrganizationProfileFormProps
> = ({ initialData, onSubmit, isLoading = false }) => {
  const form = useForm<OrganizationProfileData>({
    resolver: zodResolver(organizationProfileSchema),
    defaultValues: {
      country: initialData?.country || '',
      state: initialData?.state || '',
      address: initialData?.address || '',
      yearFounded: initialData?.yearFounded || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      website: initialData?.website || '',
      registrationId: initialData?.registrationId || '',
      about: initialData?.about || '',
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

            {/* State */}
            <FormField
              control={form.control}
              name='state'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 flex items-center gap-1'>
                    State
                    <span className='text-gray-400'>ⓘ</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='bg-gray-50 border-gray-200'>
                        <SelectValue placeholder='Select state' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Texas'>Texas</SelectItem>
                      <SelectItem value='California'>California</SelectItem>
                      <SelectItem value='New York'>New York</SelectItem>
                      <SelectItem value='Florida'>Florida</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder='24 Avil Street'
                      className='bg-gray-50 border-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Year Founded */}
            <FormField
              control={form.control}
              name='yearFounded'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Year Founded
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='1997'
                      className='bg-gray-50 border-gray-200'
                      {...field}
                    />
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

            {/* Website */}
            <FormField
              control={form.control}
              name='website'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Website
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://www.garmisland.com'
                      className='bg-gray-50 border-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Registration ID */}
            <FormField
              control={form.control}
              name='registrationId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Registration ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='QLOZETII1501'
                      className='bg-gray-50 border-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* About */}
          <FormField
            control={form.control}
            name='about'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-gray-700'>
                  About
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Short bio here'
                    className='bg-gray-50 border-gray-200 min-h-[100px] resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

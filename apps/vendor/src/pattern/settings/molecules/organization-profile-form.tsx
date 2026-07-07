// Organization Profile Form - Molecule
// Form for organization profile with all fields mapped to backend Business schema

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
import { Textarea } from '@/components/ui/textarea';

const organizationProfileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  yearFounded: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  website: z.string().optional(),
  timeZone: z.string().optional(),
  registrationId: z.string().optional(),
  about: z.string().optional(),
  nin: z.string().optional(),
  bvn: z.string().optional(),
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
      businessName: initialData?.businessName || '',
      country: initialData?.country || '',
      state: initialData?.state || '',
      city: initialData?.city || '',
      address: initialData?.address || '',
      yearFounded: initialData?.yearFounded || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      website: initialData?.website || '',
      timeZone: initialData?.timeZone || '',
      registrationId: initialData?.registrationId || '',
      about: initialData?.about || '',
      nin: initialData?.nin || '',
      bvn: initialData?.bvn || '',
    },
  });

  // Reset form when API data loads
  useEffect(() => {
    if (initialData) {
      form.reset({
        businessName: initialData.businessName || '',
        country: initialData.country || '',
        state: initialData.state || '',
        city: initialData.city || '',
        address: initialData.address || '',
        yearFounded: initialData.yearFounded || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        website: initialData.website || '',
        timeZone: initialData.timeZone || '',
        registrationId: initialData.registrationId || '',
        about: initialData.about || '',
        nin: initialData.nin || '',
        bvn: initialData.bvn || '',
      });
    }
  }, [initialData?.businessName, initialData?.email, initialData?.country]);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Business Name */}
            <FormField
              control={form.control}
              name='businessName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Business Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Qlozet Store'
                      className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country */}
            <FormField
              control={form.control}
              name='country'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1'>
                    Country
                    <span className='text-gray-400'>ⓘ</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='bg-gray-50 dark:bg-muted border-gray-200 dark:border-white/10 dark:text-gray-200'>
                        <SelectValue placeholder='Select country' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Nigeria'>Nigeria</SelectItem>
                      <SelectItem value='United States'>
                        United States
                      </SelectItem>
                      <SelectItem value='United Kingdom'>
                        United Kingdom
                      </SelectItem>
                      <SelectItem value='Canada'>Canada</SelectItem>
                      <SelectItem value='Ghana'>Ghana</SelectItem>
                      <SelectItem value='South Africa'>South Africa</SelectItem>
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
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1'>
                    State
                    <span className='text-gray-400'>ⓘ</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Lagos'
                      className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City */}
            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    City
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ikeja'
                      className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200'
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
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='24 Avil Street'
                      className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200'
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
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Year Founded
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='2020'
                      className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200'
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
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='admin@garmisland.com'
                      className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200'
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
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <div className='flex gap-2'>
                      <Select defaultValue='+234'>
                        <SelectTrigger className='w-[100px] bg-gray-50 dark:bg-muted border-gray-200 dark:border-white/10 dark:text-gray-200'>
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

            {/* Website */}
            <FormField
              control={form.control}
              name='website'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Website
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://www.garmisland.com'
                      className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* NIN */}
            <FormField
              control={form.control}
              name='nin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1'>
                    National Identity Number (NIN)
                    <span className='text-orange-500'>ⓘ</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='1234567890'
                      className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BVN */}
            <FormField
              control={form.control}
              name='bvn'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1'>
                    Bank Verification Number (BVN)
                    <span className='text-orange-500'>ⓘ</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='22123456789'
                      className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Registration ID (read-only) */}
            <FormField
              control={form.control}
              name='registrationId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Registration ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='bg-gray-100 dark:bg-muted/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'
                      readOnly
                      disabled
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
                <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  About
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell customers about your business...'
                    className='bg-gray-50 dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200 min-h-[100px] resize-none'
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

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
import { DIAL_CODES, joinPhone, splitPhone } from '../lib/phone';

const userProfileSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .optional()
    .or(z.literal('')),
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name (read-only) */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-gray-100 dark:bg-muted/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400"
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-400 mt-1">
                    Name cannot be changed here
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Choose a username"
                      className="bg-gray-50 dark:bg-muted border-gray-200 dark:border-white/10 dark:text-gray-200"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="bg-gray-100 dark:bg-muted/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400"
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-400 mt-1">
                    Email cannot be changed here
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number — dial code and national part are two views of the
                single stored string, so the select isn't decorative. */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => {
                const { code, national } = splitPhone(field.value);
                return (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Select
                          value={code}
                          onValueChange={(next) =>
                            field.onChange(joinPhone(next, national))
                          }
                        >
                          <SelectTrigger className="w-[100px] bg-gray-50 dark:bg-muted border-gray-200 dark:border-white/10 dark:text-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIAL_CODES.map((dial) => (
                              <SelectItem key={dial} value={dial}>
                                {dial}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Phone number"
                          className="bg-gray-50 dark:bg-muted border-gray-200 dark:border-white/10 dark:text-gray-200 flex-1"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={national}
                          onChange={(e) =>
                            field.onChange(joinPhone(code, e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Country (display-only, from business) */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    Country
                    <span className="text-gray-400">ⓘ</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-gray-100 dark:bg-muted/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400"
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-400 mt-1">
                    Set in Organization profile
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address (display-only, from business) */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-gray-100 dark:bg-muted/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400"
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-400 mt-1">
                    Set in Organization profile
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-start">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#3d2817] hover:bg-[#2e1e10] text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black px-8 py-2 rounded-lg"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

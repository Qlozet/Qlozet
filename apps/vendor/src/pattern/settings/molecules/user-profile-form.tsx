// Your account: the few things about the person (not the store) that can be
// changed here. Name and email are shown, not offered as disabled inputs.

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AtSign, Phone } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ProfileSaveBar } from './profile-save-bar';
import { DIAL_CODES, joinPhone, splitPhone } from '../lib/phone';

const userProfileSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
  username: z
    .string()
    .min(3, 'A username needs at least 3 characters')
    .regex(/^[a-z0-9_.]+$/i, 'Letters, numbers, dots and underscores only')
    .optional()
    .or(z.literal('')),
  phoneNumber: z.string().min(1, 'Add a phone number'),
  country: z.string().optional(),
  address: z.string().optional(),
});

type UserProfileData = z.infer<typeof userProfileSchema>;

interface UserProfileFormProps {
  initialData?: Partial<UserProfileData>;
  onSubmit: (data: UserProfileData) => void;
  isLoading?: boolean;
  resetKey?: string;
  onDirtyChange?: (dirty: boolean) => void;
}

const seed = (d?: Partial<UserProfileData>): UserProfileData => ({
  fullName: d?.fullName || '',
  email: d?.email || '',
  username: d?.username || '',
  phoneNumber: d?.phoneNumber || '',
  country: d?.country || '',
  address: d?.address || '',
});

const inputClass =
  'bg-background border-border focus-visible:ring-primary/30 dark:bg-muted dark:border-white/10';

const ReadOnlyRow = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) => (
  <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 px-4 py-3">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="text-sm text-foreground break-all">{value || '—'}</span>
    <span className="text-[11px] text-muted-foreground">{hint}</span>
  </div>
);

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  resetKey,
  onDirtyChange,
}) => {
  const form = useForm<UserProfileData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: seed(initialData),
  });

  useEffect(() => {
    form.reset(seed(initialData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const dirty = form.formState.isDirty;
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Who you are
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your name and sign-in email are fixed to this account. Contact
              support to change them.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReadOnlyRow
              label="Full name"
              value={initialData?.fullName ?? ''}
              hint="As it appears to your team"
            />
            <ReadOnlyRow
              label="Sign-in email"
              value={initialData?.email ?? ''}
              hint="Where your login codes go"
            />
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              How we reach you
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              A username for your team and the number for urgent order matters.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="yourname"
                        autoCapitalize="none"
                        className={cn(inputClass, 'pl-9')}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => {
                const { code, national } = splitPhone(field.value);
                return (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Select
                          value={code}
                          onValueChange={(next) =>
                            field.onChange(joinPhone(next, national))
                          }
                        >
                          <SelectTrigger
                            className={cn(inputClass, 'w-[104px]')}
                          >
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
                        <div className="relative flex-1">
                          <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="801 234 5678"
                            inputMode="tel"
                            className={cn(inputClass, 'pl-9')}
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            value={national}
                            onChange={(e) =>
                              field.onChange(joinPhone(code, e.target.value))
                            }
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </section>

        <ProfileSaveBar
          dirty={dirty}
          saving={isLoading}
          onDiscard={() => form.reset(seed(initialData))}
        />
      </form>
    </Form>
  );
};

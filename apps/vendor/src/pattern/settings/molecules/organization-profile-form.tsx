// Store profile form: what shoppers read about the store, grouped the way a
// vendor thinks about it - the store, how to reach it, where it is, and its
// links - with a save bar that only appears when something changed.

import React, { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Globe,
  Instagram,
  Mail,
  MapPin,
  Music2,
  Phone,
  Pin,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AddressAutocompleteInput } from './address-autocomplete-input';
import { ProfileSaveBar } from './profile-save-bar';
import { DIAL_CODES, joinPhone, splitPhone } from '../lib/phone';
import { countryOptions } from '../lib/countries';
import { ABOUT_MIN } from '../lib/profile-completeness';
import type { PlaceDetails } from '@/hooks/use-google-places';

const THIS_YEAR = new Date().getFullYear();

const organizationProfileSchema = z.object({
  businessName: z.string().min(1, 'Give the store a name'),
  country: z.string().min(1, 'Choose a country'),
  state: z.string().min(1, 'Add the state'),
  city: z.string().optional(),
  address: z.string().min(1, 'Add the store address'),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  yearFounded: z
    .string()
    .optional()
    .refine(
      (v) =>
        !v ||
        (/^\d{4}$/.test(v) && Number(v) >= 1900 && Number(v) <= THIS_YEAR),
      `Enter a year between 1900 and ${THIS_YEAR}`
    ),
  email: z.string().email('Enter a valid email address'),
  phoneNumber: z.string().min(1, 'Add a phone number'),
  website: z.string().optional(),
  // Handles, not URLs. The backend reduces a pasted profile URL to its
  // handle and the storefront builds the link, so a vendor can paste
  // whatever their share sheet gave them.
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  pinterest: z.string().optional(),
  timeZone: z.string().optional(),
  registrationId: z.string().optional(),
  about: z.string().optional(),
});

type OrganizationProfileData = z.infer<typeof organizationProfileSchema>;

interface OrganizationProfileFormProps {
  initialData?: Partial<OrganizationProfileData>;
  onSubmit: (data: OrganizationProfileData) => void;
  isLoading?: boolean;
  /** Changes when a fresh record arrives, so the form re-seeds from it. */
  resetKey?: string;
  onDirtyChange?: (dirty: boolean) => void;
}

const seed = (
  d?: Partial<OrganizationProfileData>
): OrganizationProfileData => ({
  businessName: d?.businessName || '',
  country: d?.country || '',
  state: d?.state || '',
  city: d?.city || '',
  address: d?.address || '',
  zipCode: d?.zipCode || '',
  latitude: d?.latitude || undefined,
  longitude: d?.longitude || undefined,
  yearFounded: d?.yearFounded || '',
  email: d?.email || '',
  phoneNumber: d?.phoneNumber || '',
  website: d?.website || '',
  instagram: d?.instagram || '',
  twitter: d?.twitter || '',
  tiktok: d?.tiktok || '',
  youtube: d?.youtube || '',
  pinterest: d?.pinterest || '',
  timeZone: d?.timeZone || '',
  registrationId: d?.registrationId || '',
  about: d?.about || '',
});

const Section = ({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead: string;
  children: ReactNode;
}) => (
  <section
    id={id}
    className="scroll-mt-24 border-t border-border pt-6 first:border-t-0 first:pt-0"
  >
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{lead}</p>
    </div>
    {children}
  </section>
);

const inputClass =
  'bg-background border-border focus-visible:ring-primary/30 dark:bg-muted dark:border-white/10';

/** An input with an icon in the leading slot. */
const IconInput = ({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { icon: LucideIcon }) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input className={cn(inputClass, 'pl-9', className)} {...props} />
  </div>
);

const SOCIALS: {
  name: 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'pinterest';
  label: string;
  icon: LucideIcon;
}[] = [
  { name: 'instagram', label: 'Instagram', icon: Instagram },
  { name: 'tiktok', label: 'TikTok', icon: Music2 },
  { name: 'twitter', label: 'X (Twitter)', icon: Twitter },
  { name: 'youtube', label: 'YouTube', icon: Youtube },
  { name: 'pinterest', label: 'Pinterest', icon: Pin },
];

export const OrganizationProfileForm: React.FC<
  OrganizationProfileFormProps
> = ({ initialData, onSubmit, isLoading = false, resetKey, onDirtyChange }) => {
  const form = useForm<OrganizationProfileData>({
    resolver: zodResolver(organizationProfileSchema),
    defaultValues: seed(initialData),
  });

  // Re-seed when a fresh record arrives (first load, or a save that came back).
  useEffect(() => {
    form.reset(seed(initialData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const dirty = form.formState.isDirty;
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const about = form.watch('about') ?? '';
  const country = form.watch('country');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Section
          id="profile-about"
          title="The store"
          lead="The name shoppers search for and the few lines that sell it."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_160px]">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Aso Oke Co"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearFounded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Founded</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1900}
                      max={THIS_YEAR}
                      placeholder={String(THIS_YEAR - 5)}
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem className="mt-5">
                <FormLabel>About the store</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What you make, who it is for, and what makes it yours. Shoppers read this on your storefront."
                    className={cn(inputClass, 'min-h-[110px] resize-y')}
                    {...field}
                  />
                </FormControl>
                <p
                  className={cn(
                    'text-xs tabular-nums',
                    about.trim().length >= ABOUT_MIN
                      ? 'text-muted-foreground'
                      : 'text-amber-600'
                  )}
                >
                  {about.trim().length}/{ABOUT_MIN} characters
                  {about.trim().length < ABOUT_MIN
                    ? ' - a few more lines help shoppers trust the store'
                    : ''}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section
          id="profile-contact"
          title="How to reach you"
          lead="Shown to shoppers and used for order questions."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store email</FormLabel>
                  <FormControl>
                    <IconInput
                      icon={Mail}
                      type="email"
                      placeholder="hello@yourstore.com"
                      {...field}
                    />
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
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <IconInput
                      icon={Globe}
                      placeholder="https://yourstore.com"
                      inputMode="url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Section
          id="profile-location"
          title="Where the store is"
          lead="Search the address and the rest fills in. Used for delivery quotes and the map on your storefront."
        >
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <AddressAutocompleteInput
                    value={field.value}
                    onChange={field.onChange}
                    onSelect={(details: PlaceDetails) => {
                      field.onChange(details.address);
                      form.setValue('city', details.city, {
                        shouldDirty: true,
                      });
                      form.setValue('state', details.state, {
                        shouldDirty: true,
                      });
                      form.setValue('country', details.country || 'Nigeria', {
                        shouldDirty: true,
                      });
                      form.setValue('zipCode', details.postalCode, {
                        shouldDirty: true,
                      });
                      form.setValue('latitude', details.lat, {
                        shouldDirty: true,
                      });
                      form.setValue('longitude', details.lng, {
                        shouldDirty: true,
                      });
                    }}
                    placeholder="Start typing the street address…"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <IconInput icon={MapPin} placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="State"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countryOptions(country).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Section
          id="profile-social"
          title="Social links"
          lead="Paste a handle or a profile link; either works. They show on your storefront."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {SOCIALS.map((s) => (
              <FormField
                key={s.name}
                control={form.control}
                name={s.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{s.label}</FormLabel>
                    <FormControl>
                      <IconInput
                        icon={s.icon}
                        placeholder="yourhandle"
                        autoCapitalize="none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </Section>

        <ProfileSaveBar
          dirty={dirty}
          saving={isLoading}
          onDiscard={() => form.reset(seed(initialData))}
        />
      </form>
    </Form>
  );
};

'use client';

import { useMemo, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { readApiError } from '@/redux/services/types';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import {
  useUpdateVendorProfileMutation,
  type AdminVendorUpdate,
} from '@/redux/services/vendor-details/vendor-details.api-slice';

interface EditVendorDrawerProps {
  vendor: Business;
}

/**
 * Every field PATCH /admin/businesses/:id accepts, minus the file URLs. Those
 * are written by their own upload controls — the header avatar and banner, and
 * the document modal — never typed into this form.
 */
type EditableField = keyof Omit<
  AdminVendorUpdate,
  | 'business_logo_url'
  | 'business_logo_svg_url'
  | 'cover_image_url'
  | 'cac_document_url'
>;

interface FieldSpec {
  name: EditableField;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
}

const SECTIONS: { title: string; note?: string; fields: FieldSpec[] }[] = [
  {
    title: 'Business',
    fields: [
      { name: 'business_name', label: 'Business name' },
      { name: 'business_email', label: 'Business email', type: 'email' },
      { name: 'business_phone_number', label: 'Phone number' },
      { name: 'website', label: 'Website', placeholder: 'https://…' },
      { name: 'year_founded', label: 'Year founded', placeholder: '2023' },
      { name: 'description', label: 'Description', multiline: true },
    ],
  },
  {
    title: 'Address',
    fields: [
      { name: 'business_address', label: 'Street address' },
      { name: 'city', label: 'City' },
      { name: 'state', label: 'State' },
      { name: 'country', label: 'Country' },
      { name: 'zip_code', label: 'Postcode' },
    ],
  },
  {
    title: 'Payout account',
    note: 'Correcting these does not move money — payouts are initiated elsewhere.',
    fields: [
      { name: 'payout_bank_name', label: 'Bank name' },
      { name: 'payout_account_number', label: 'Account number' },
      { name: 'payout_account_name', label: 'Account name' },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((section) => section.fields);

const read = (vendor: Business, name: EditableField): string => {
  const value = vendor[name];
  return typeof value === 'string' ? value : '';
};

/**
 * Edit a vendor's profile through PATCH /admin/businesses/:id.
 *
 * Sends only what actually changed. A full-object PATCH would rewrite every
 * field on every save — turning an untouched blank into an explicit empty
 * string, and clobbering anything the vendor edited on their own side between
 * this drawer opening and the admin pressing save.
 *
 * The image fields are absent on purpose: the banner and logo are replaced by
 * uploading on the header itself, which is a file picker rather than a text
 * box. Status is absent too — it has its own approve/verify/reject actions.
 */
export const EditVendorDrawer = NiceModal.create(
  ({ vendor }: EditVendorDrawerProps) => {
    const { visible, hide, remove } = useModal();

    const initial = useMemo(() => {
      const base = {} as Record<EditableField, string>;
      for (const field of ALL_FIELDS)
        base[field.name] = read(vendor, field.name);
      return base;
    }, [vendor]);

    const [values, setValues] =
      useState<Record<EditableField, string>>(initial);
    const [updateVendor, { isLoading }] = useUpdateVendorProfileMutation();

    const close = () => {
      hide();
      setTimeout(() => remove(), 300);
    };

    const changed = useMemo(
      () =>
        ALL_FIELDS.filter(
          (field) => values[field.name] !== initial[field.name]
        ),
      [values, initial]
    );

    const save = async () => {
      if (changed.length === 0) {
        toast.info('Nothing to save.');
        return;
      }

      const patch: AdminVendorUpdate = {};
      for (const field of changed) {
        patch[field.name] = values[field.name].trim();
      }

      try {
        await updateVendor({ businessId: vendor._id, patch }).unwrap();
        toast.success('Vendor updated');
        close();
      } catch (error) {
        // A rejected URL or a 404 says something useful; show it verbatim.
        toast.error(readApiError(error));
      }
    };

    return (
      <Sheet open={visible} onOpenChange={(next) => !next && close()}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          <SheetHeader className="shrink-0 border-b border-border px-6 py-5">
            <SheetTitle className="text-left text-lg font-semibold">
              Edit vendor
            </SheetTitle>
            <p className="text-left text-xs text-muted-foreground">
              Changes apply to the vendor&apos;s own record.
            </p>
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {SECTIONS.map((section) => (
              <section key={section.title} className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {section.title}
                  </h3>
                  {section.note && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {section.note}
                    </p>
                  )}
                </div>

                {section.fields.map((field) => {
                  const id = `edit-vendor-${field.name}`;
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label
                        htmlFor={id}
                        className="text-sm font-medium text-foreground"
                      >
                        {field.label}
                      </label>
                      {field.multiline ? (
                        <Textarea
                          id={id}
                          rows={3}
                          className="resize-none"
                          value={values[field.name]}
                          placeholder={field.placeholder}
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              [field.name]: event.target.value,
                            }))
                          }
                        />
                      ) : (
                        <Input
                          id={id}
                          type={field.type ?? 'text'}
                          value={values[field.name]}
                          placeholder={field.placeholder}
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              [field.name]: event.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </section>
            ))}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-6 py-4">
            <span className="text-xs text-muted-foreground">
              {changed.length === 0
                ? 'No changes'
                : `${changed.length} field${changed.length === 1 ? '' : 's'} changed`}
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isLoading || changed.length === 0}
                onClick={() => void save()}
                className="gap-1.5"
              >
                {isLoading && <Loader2 className="size-3.5 animate-spin" />}
                Save changes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);

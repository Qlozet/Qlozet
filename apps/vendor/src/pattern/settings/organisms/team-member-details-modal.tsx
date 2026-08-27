// Team Member Modal - Organism
// Edit a team member (name, phone, role) via PATCH /users/team/members/{id}.
// The business owner is guarded server-side and can't be edited, so for an
// owner this renders read-only.

'use client';

import React from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  useGetVendorRolesQuery,
  useUpdateTeamMemberMutation,
} from '@/redux/services/users/users.api-slice';
import { readApiError } from '@/redux/services/types';

export interface TeamMemberDetails {
  _id: string;
  name: string;
  emailAddress: string;
  phoneNumber: string;
  role: string;
  /** Role id, needed to preselect the Select. */
  roleId?: string;
  status: string;
  is_owner?: boolean;
}

const memberSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  phone_number: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
});

type MemberFormData = z.infer<typeof memberSchema>;

const prettyRole = (name?: string): string =>
  (name ?? '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <label className="text-sm font-normal text-gray-900 dark:text-gray-200">
      {label}
    </label>
    <Input
      value={value || '—'}
      readOnly
      disabled
      className="bg-gray-100 dark:bg-muted/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400"
    />
  </div>
);

export const TeamMemberDetailsModal = create<{ member: TeamMemberDetails }>(
  ({ member }) => {
    const { visible, resolve, remove } = useModal();
    const { data: rolesResponse } = useGetVendorRolesQuery();
    const [updateMember] = useUpdateTeamMemberMutation();

    // Owner can't be reassigned, so it isn't offered as a target role.
    const roles = (rolesResponse?.data ?? []).filter((r) => r.name !== 'owner');

    const form = useForm<MemberFormData>({
      resolver: zodResolver(memberSchema),
      defaultValues: {
        full_name: member.name === '—' ? '' : member.name,
        phone_number: member.phoneNumber === '—' ? '' : member.phoneNumber,
        role: member.roleId ?? '',
      },
    });

    const close = () => {
      form.reset();
      resolve({ resolved: false });
      remove();
    };

    const onSubmit = async (values: MemberFormData) => {
      try {
        await updateMember({ id: member._id, data: values }).unwrap();
        toast.success('Team member updated');
        close();
      } catch (error: any) {
        toast.error(readApiError(error, 'Failed to update team member'));
      }
    };

    const submitting = form.formState.isSubmitting;

    return (
      <Dialog open={visible} onOpenChange={close}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {member.is_owner ? 'Team member' : 'Edit team member'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto max-h-[70vh] px-1">
            {member.is_owner ? (
              <>
                <ReadOnlyField label="Full name" value={member.name} />
                <ReadOnlyField
                  label="Email address"
                  value={member.emailAddress}
                />
                <ReadOnlyField
                  label="Phone number"
                  value={member.phoneNumber}
                />
                <ReadOnlyField label="User role" value={member.role} />
                <ReadOnlyField label="Status" value={member.status} />
                <p className="text-xs text-gray-400">
                  The business owner can&apos;t be edited or removed.
                </p>
              </>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal text-gray-900 dark:text-gray-200">
                          Full name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter full name"
                            className="bg-white dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email isn't part of UpdateTeamMemberDto — it identifies the
                      invite, so it stays read-only. */}
                  <ReadOnlyField
                    label="Email address"
                    value={member.emailAddress}
                  />

                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal text-gray-900 dark:text-gray-200">
                          Phone number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Enter phone number"
                            className="bg-white dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal text-gray-900 dark:text-gray-200">
                          User role
                        </FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-muted border-gray-200 dark:border-white/10 dark:text-gray-200">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role._id} value={role._id}>
                                {prettyRole(role.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={close}
                      disabled={submitting}
                      className="min-w-28 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="min-w-28 cursor-pointer"
                    >
                      {submitting ? 'Saving...' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

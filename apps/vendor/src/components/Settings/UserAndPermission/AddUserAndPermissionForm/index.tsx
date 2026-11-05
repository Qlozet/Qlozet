'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Users, Loader2 } from 'lucide-react';
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
  useInviteTeamMemberMutation,
} from '@/redux/services/users/users.api-slice';
import { toast } from 'sonner';
import { readApiError } from '@/redux/services/types';
import { prettyRole, roleSummary } from '@/pattern/settings/lib/team-roles';
import {
  inviteEmailSent,
  isValidInviteEmail,
  normalizeInviteEmail,
} from '@/pattern/settings/lib/team-invite';
import { cn } from '@/lib/utils';

interface InviteRow {
  id: string;
  full_name: string;
  email: string;
  role_id: string;
}

const createEmptyRow = (): InviteRow => ({
  id: crypto.randomUUID(),
  full_name: '',
  email: '',
  role_id: '',
});

const AddNewUserAndPermissionForm = ({
  closeModal,
}: {
  closeModal: () => void;
}) => {
  const [rows, setRows] = useState<InviteRow[]>([createEmptyRow()]);
  // Rows whose email didn't pass the format check, outlined until edited.
  const [badEmailIds, setBadEmailIds] = useState<Set<string>>(new Set());
  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    isError: rolesError,
    refetch: refetchRoles,
  } = useGetVendorRolesQuery();
  const [inviteTeamMember, { isLoading: isInviting }] =
    useInviteTeamMemberMutation();

  // Filter out 'owner' role — can't invite someone as owner
  const availableRoles = (rolesResponse?.data ?? []).filter(
    (r) => r.name !== 'owner'
  );

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);

  const removeRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRow = (id: string, field: keyof InviteRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
    if (field === 'email' && badEmailIds.has(id)) {
      setBadEmailIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleInvite = async () => {
    // Send what the server will store: trimmed, emails lowercased.
    const prepared = rows.map((r) => ({
      ...r,
      full_name: r.full_name.trim(),
      email: normalizeInviteEmail(r.email),
    }));
    setRows(prepared);

    const invalid = prepared.some(
      (r) => !r.email || !r.full_name || !r.role_id
    );
    if (invalid) {
      toast.error('Please fill in name, email, and role for all rows');
      return;
    }

    const badEmails = prepared.filter((r) => !isValidInviteEmail(r.email));
    if (badEmails.length > 0) {
      setBadEmailIds(new Set(badEmails.map((r) => r.id)));
      toast.error(
        badEmails.length === 1
          ? `"${badEmails[0].email}" isn't a valid email address`
          : `${badEmails.length} email addresses aren't valid`
      );
      return;
    }

    const emails = prepared.map((r) => r.email);
    const duplicate = emails.find((e, i) => emails.indexOf(e) !== i);
    if (duplicate) {
      toast.error(`${duplicate} is in the list more than once`);
      return;
    }

    let invitedCount = 0;
    const failedIds = new Set<string>();

    for (const row of prepared) {
      try {
        const result = await inviteTeamMember({
          email: row.email,
          full_name: row.full_name,
          role: row.role_id,
        }).unwrap();
        if (inviteEmailSent(result)) {
          invitedCount++;
        } else {
          // Added, but the email with their sign-in details didn't go. The
          // server's message names them and points at Resend invite.
          toast.warning(
            result?.message ||
              `${row.full_name} was added, but we couldn't send their invite email. Use Resend invite on their row.`
          );
        }
      } catch (err: unknown) {
        failedIds.add(row.id);
        toast.error(readApiError(err, `Failed to invite ${row.email}`));
      }
    }

    if (invitedCount > 0) {
      toast.success(
        `${invitedCount} member${invitedCount > 1 ? 's' : ''} invited successfully`
      );
    }

    if (failedIds.size === 0) {
      closeModal();
      return;
    }
    // Keep only the rows that failed open, so a retry doesn't invite the
    // others a second time.
    setRows(prepared.filter((r) => failedIds.has(r.id)));
  };

  return (
    <div className="bg-white dark:bg-card rounded-[12px] w-full px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground font-poppins">
          Invite Team Members
        </h2>
        <button
          type="button"
          onClick={closeModal}
          className="size-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Column Headers */}
      <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_40px] gap-3 mb-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Full Name
        </span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Email
        </span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Role
        </span>
        <span />
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_40px] gap-3 items-start md:items-center bg-gray-50 dark:bg-white/5 md:bg-transparent p-4 md:p-0 rounded-lg md:rounded-none"
          >
            {/* Full Name */}
            <input
              type="text"
              value={row.full_name}
              onChange={(e) => updateRow(row.id, 'full_name', e.target.value)}
              placeholder="John Doe"
              className="h-10 w-full rounded-lg border border-gray-300 dark:border-white/20 bg-transparent px-3 text-sm text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />

            {/* Email */}
            <input
              type="email"
              value={row.email}
              onChange={(e) => updateRow(row.id, 'email', e.target.value)}
              placeholder="email@example.com"
              aria-invalid={badEmailIds.has(row.id) || undefined}
              className={cn(
                'h-10 w-full rounded-lg border border-gray-300 dark:border-white/20 bg-transparent px-3 text-sm text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary transition-colors',
                badEmailIds.has(row.id) && 'border-red-500 dark:border-red-500'
              )}
            />

            {/* Role (from API) */}
            <Select
              value={row.role_id || undefined}
              onValueChange={(v) => updateRow(row.id, 'role_id', v)}
            >
              <SelectTrigger className="h-10 w-full rounded-lg border-gray-300 dark:border-white/10 dark:bg-muted text-sm">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {rolesLoading ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Loading roles...
                  </div>
                ) : rolesError ? (
                  <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-muted-foreground">
                    <span>Couldn&apos;t load roles.</span>
                    <button
                      type="button"
                      onClick={() => refetchRoles()}
                      className="font-medium text-primary dark:text-white underline cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                ) : availableRoles.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No roles available
                  </div>
                ) : (
                  availableRoles.map((role) => (
                    <SelectItem key={role._id} value={role._id}>
                      {prettyRole(role.name)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Delete */}
            <div className="flex justify-end md:block">
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
                className="size-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            {/* What the chosen role can do */}
            {row.role_id && (
              <p className="md:col-span-4 -mt-1 text-xs text-gray-500 dark:text-gray-400">
                {roleSummary(
                  availableRoles.find((r) => r._id === row.role_id)?.name
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add row */}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 mt-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-foreground transition-colors cursor-pointer"
      >
        <Plus className="size-4" />
        Add another member
      </button>

      {/* Note */}
      <div className="mt-5 flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3">
        <div className="flex items-center justify-center size-9 rounded-full bg-amber-100 dark:bg-amber-900/30 shrink-0">
          <Users className="size-4 text-amber-700 dark:text-amber-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Invited members will receive an email with a temporary password. They
          must change it on first login. If the email goes missing, use Resend
          invite from their row.
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={closeModal}
          className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleInvite}
          disabled={isInviting}
          className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-white dark:hover:bg-gray-200 dark:text-black text-sm font-medium"
        >
          {isInviting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Send Invites'
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddNewUserAndPermissionForm;

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { ChevronDown, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/lib/hooks/useClickOutside';
import { formatRoleName } from '@/lib/admins';
import { readApiError } from '@/redux/services/types';
import {
  useGetRolesQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  type PlatformAdmin,
} from '@/redux/services/users/users.api-slice';

interface RoleOption {
  id: string;
  label: string;
}

interface RoleSelectProps {
  value: string;
  options: RoleOption[];
  placeholder: string;
  onChange: (value: string) => void;
}

// Mirrors the VendorStatusFilter dropdown styling so the role picker matches the
// rest of the admin app rather than introducing a new select component.
const RoleSelect = ({
  value,
  options,
  placeholder,
  onChange,
}: RoleSelectProps) => {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(240);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const selected = options.find((option) => option.id === value);

  // Decide whether to drop the menu up or down based on available viewport space
  // so it never gets clipped (the field can sit near the bottom of the modal).
  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const margin = 8;
        const spaceBelow = window.innerHeight - rect.bottom - margin;
        const spaceAbove = rect.top - margin;
        const desired = 240;
        const dropUp = spaceBelow < desired && spaceAbove > spaceBelow;
        setOpenUp(dropUp);
        setMenuMaxHeight(
          Math.max(140, Math.min(desired, dropUp ? spaceAbove : spaceBelow))
        );
      }
      return next;
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-muted/80 transition-colors cursor-pointer"
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-gray-500 dark:text-gray-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          style={{ maxHeight: menuMaxHeight }}
          className={cn(
            'absolute left-0 right-0 z-20 overflow-auto rounded-lg border border-border bg-white dark:bg-card py-1 shadow-lg',
            openUp ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
        >
          {options.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No platform roles yet — create one under Manage Roles.
            </p>
          )}
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-muted/80"
            >
              <span>{option.label}</span>
              {option.id === value && <Check className="size-4 text-success" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export interface AdminFormModalProps {
  /** Present for "Edit Admin"; absent for "Add New Admin". */
  admin?: PlatformAdmin;
}

/**
 * Add and edit an administrator.
 *
 * One dialog for both: the design's two frames have the same four fields, and
 * the only differences are the title, the button label and whether the fields
 * start filled. Two components would have been the same form twice.
 */
export const AdminFormModal = NiceModal.create<AdminFormModalProps>(
  ({ admin }) => {
    const modal = useModal();
    const isEdit = Boolean(admin);

    const [fullName, setFullName] = useState(admin?.full_name ?? '');
    const [email, setEmail] = useState(admin?.email ?? '');
    const [phone, setPhone] = useState(admin?.phone_number ?? '');
    const [role, setRole] = useState(admin?.role?._id ?? '');

    // Only PLATFORM roles: a vendor role on a platform account cannot pass the
    // console's guard, so offering one would create an admin who can't sign in.
    const { data: rolesData } = useGetRolesQuery({ type: 'platform' });
    const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
    const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
    const isLoading = isCreating || isUpdating;

    const roleOptions = useMemo<RoleOption[]>(
      () =>
        (rolesData?.data ?? []).map((r) => ({
          id: r._id,
          label: formatRoleName(r.name),
        })),
      [rolesData]
    );

    // The row carries the role id already, but an admin whose role was renamed
    // between list and open should still show the current label.
    useEffect(() => {
      if (admin?.role?._id) setRole(admin.role._id);
    }, [admin?.role?._id]);

    if (!modal.visible) return null;

    const handleClose = () => modal.remove();

    const isValid = Boolean(fullName.trim() && email.trim() && role);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) {
        toast.error('Fill in the name, email address and role.');
        return;
      }

      try {
        if (admin) {
          await updateAdmin({
            id: admin._id,
            data: {
              full_name: fullName.trim(),
              email: email.trim(),
              phone_number: phone.trim(),
              role,
            },
          }).unwrap();
          toast.success('Admin updated');
        } else {
          await createAdmin({
            full_name: fullName.trim(),
            email: email.trim(),
            ...(phone.trim() && { phone_number: phone.trim() }),
            role,
          }).unwrap();
          // The backend emails them a temporary password — say so, or the admin
          // doing this has no idea how the new person gets in.
          toast.success(
            'Admin added. They have been emailed a temporary password.'
          );
        }
        handleClose();
      } catch (error) {
        // The server's refusal is the useful message ("that email is already in
        // use", "changing the last super admin would lock everyone out").
        toast.error(readApiError(error));
      }
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Dialog */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-form-title"
          className="relative z-10 w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl"
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-muted/80 transition"
          >
            <X className="size-4" />
          </button>

          <h2
            id="admin-form-title"
            className="text-lg font-semibold text-foreground"
          >
            {isEdit ? 'Edit Admin' : 'Add New Admin'}
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-full-name"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Full name
              </label>
              <Input
                id="admin-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Email address
              </label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-phone"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Phone number
              </label>
              <Input
                id="admin-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Admin role
              </label>
              <RoleSelect
                value={role}
                options={roleOptions}
                placeholder="Select an option"
                onChange={setRole}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading || !isValid}>
                {isLoading
                  ? isEdit
                    ? 'Saving...'
                    : 'Adding...'
                  : isEdit
                    ? 'Edit admin'
                    : 'Add admin'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

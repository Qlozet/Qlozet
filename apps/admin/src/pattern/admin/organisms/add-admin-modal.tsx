'use client';

import { useMemo, useRef, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { ChevronDown, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/lib/hooks/useClickOutside';
import { ADMIN_ROLE_OPTIONS } from '@/lib/admins';
import {
  useGetRolesQuery,
  useInviteTeamMemberMutation,
} from '@/redux/services/users/users.api-slice';

interface RoleSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

// Mirrors the VendorStatusFilter dropdown styling so the role picker matches the
// rest of the admin app rather than introducing a new select component.
const RoleSelect = ({ value, options, onChange }: RoleSelectProps) => {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(240);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

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
    <div className='relative' ref={ref}>
      <button
        ref={triggerRef}
        type='button'
        onClick={handleToggle}
        className='flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'
      >
        <span className={cn('truncate', !value && 'text-muted-foreground')}>
          {value || 'Select an option'}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-gray-500 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          style={{ maxHeight: menuMaxHeight }}
          className={cn(
            'absolute left-0 right-0 z-20 overflow-auto rounded-lg border border-border bg-white py-1 shadow-lg',
            openUp ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
        >
          {options.map((option) => (
            <button
              key={option}
              type='button'
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className='flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
            >
              <span>{option}</span>
              {option === value && <Check className='size-4 text-success' />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const AddAdminModal = NiceModal.create(() => {
  const modal = useModal();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  const { data: rolesData } = useGetRolesQuery();
  const [invite, { isLoading }] = useInviteTeamMemberMutation();

  // Prefer the real platform roles; fall back to the Figma list when the backend
  // returns nothing so the form is still usable.
  const roleOptions = useMemo(() => {
    const fromApi = (rolesData?.data ?? [])
      .map((r) => r.name)
      .filter((name): name is string => Boolean(name));
    return fromApi.length > 0 ? fromApi : [...ADMIN_ROLE_OPTIONS];
  }, [rolesData]);

  if (!modal.visible) return null;

  const handleClose = () => modal.remove();

  const isValid = fullName.trim() && email.trim() && phone.trim() && role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error('Please fill in all fields.');
      return;
    }
    try {
      await invite({
        full_name: fullName.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
        role,
      }).unwrap();
      toast.success('Admin invited successfully');
      handleClose();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={handleClose}
      />

      {/* Dialog */}
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='add-admin-title'
        className='relative z-10 w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl'
      >
        <button
          type='button'
          onClick={handleClose}
          aria-label='Close'
          className='absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition'
        >
          <X className='size-4' />
        </button>

        <h2
          id='add-admin-title'
          className='text-lg font-semibold text-foreground'
        >
          Add New Admin
        </h2>

        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-gray-700'>
              Full name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder='Enter full name'
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-gray-700'>
              Email address
            </label>
            <Input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter email address'
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-gray-700'>
              Phone number
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='Enter phone number'
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-gray-700'>
              Admin role
            </label>
            <RoleSelect value={role} options={roleOptions} onChange={setRole} />
          </div>

          <div className='flex justify-end pt-2'>
            <Button type='submit' disabled={isLoading || !isValid}>
              {isLoading ? 'Adding...' : 'Add admin'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});

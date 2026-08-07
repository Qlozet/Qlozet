// Team Member Details Modal - Organism
// Read-only view of a team member.
//
// Deliberately has no save action: the backend exposes only
// GET /users/team/members and POST /users/team/invite-member — there is no
// endpoint to update a member, deactivate one, or remove one.
// TODO(api): turn this into an edit form once a member-update endpoint exists.

'use client';

import React from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export interface TeamMemberDetails {
  name: string;
  emailAddress: string;
  phoneNumber: string;
  role: string;
  status: string;
  is_owner?: boolean;
}

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div className='space-y-2'>
    <label className='text-sm font-normal text-gray-900 dark:text-gray-200'>
      {label}
    </label>
    <Input
      value={value || '—'}
      readOnly
      disabled
      className='bg-gray-100 dark:bg-muted/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'
    />
  </div>
);

export const TeamMemberDetailsModal = create<{ member: TeamMemberDetails }>(
  ({ member }) => {
    const { visible, remove } = useModal();

    return (
      <Dialog open={visible} onOpenChange={() => remove()}>
        <DialogContent className='max-w-md max-h-[90vh] overflow-hidden'>
          <DialogHeader>
            <DialogTitle className='text-lg font-semibold'>
              Team member
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4 overflow-y-auto max-h-[70vh] px-1'>
            <ReadOnlyField label='Full name' value={member.name} />
            <ReadOnlyField label='Email address' value={member.emailAddress} />
            <ReadOnlyField label='Phone number' value={member.phoneNumber} />
            <ReadOnlyField
              label='User role'
              value={member.is_owner ? `${member.role} (Owner)` : member.role}
            />
            <ReadOnlyField label='Status' value={member.status} />

            <p className='text-xs text-gray-400'>
              Team member details can&apos;t be edited here yet.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

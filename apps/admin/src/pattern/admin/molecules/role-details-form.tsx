'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface RoleDetailsFormProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export const RoleDetailsForm = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: RoleDetailsFormProps) => {
  return (
    <div className='rounded-2xl border border-border bg-white p-5'>
      <h2 className='text-base font-bold text-grey-black'>Role Details</h2>

      <div className='mt-5 space-y-4'>
        <div className='space-y-1.5'>
          <label className='text-sm font-medium text-grey-black'>
            Name of Role
          </label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder='Enter role name'
          />
        </div>

        <div className='space-y-1.5'>
          <label className='text-sm font-medium text-grey-black'>
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder='Input with text area'
            className='min-h-[220px] resize-none'
          />
        </div>
      </div>
    </div>
  );
};

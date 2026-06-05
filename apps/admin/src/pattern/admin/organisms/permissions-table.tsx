'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  type PermissionAction,
  type PermissionMatrix,
} from '@/lib/admins';

interface PermissionsTableProps {
  matrix: PermissionMatrix;
  onToggle: (resourceKey: string, action: PermissionAction) => void;
}

const ACTION_LABEL: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
};

export const PermissionsTable = ({
  matrix,
  onToggle,
}: PermissionsTableProps) => {
  return (
    <div className='overflow-hidden rounded-2xl border border-border bg-white'>
      <div className='px-5 py-4'>
        <h2 className='text-base font-bold text-grey-black'>Permission</h2>
      </div>

      <Table>
        <TableHeader className='bg-[#F9FAFB]'>
          <TableRow className='hover:bg-transparent'>
            <TableHead className='h-11 pl-5 text-xs font-medium text-gray-500'>
              Module
            </TableHead>
            {PERMISSION_ACTIONS.map((action) => (
              <TableHead
                key={action}
                className='h-11 text-xs font-medium text-gray-500'
              >
                {ACTION_LABEL[action]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {PERMISSION_RESOURCES.map((resource) => (
            <TableRow key={resource.key} className='border-t border-border'>
              <TableCell
                className={cn(
                  'py-3 pl-5 text-sm text-gray-600',
                  'whitespace-nowrap'
                )}
              >
                {resource.label}
              </TableCell>
              {PERMISSION_ACTIONS.map((action) => (
                <TableCell key={action} className='py-3'>
                  <Checkbox
                    checked={matrix[resource.key]?.[action] ?? false}
                    onCheckedChange={() => onToggle(resource.key, action)}
                    aria-label={`${resource.label} ${ACTION_LABEL[action]}`}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

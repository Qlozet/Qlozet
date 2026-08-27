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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  PERMISSION_ACTIONS,
  type PermissionAction,
  type PermissionMatrix,
} from '@/lib/admins';
import type { ConsolePermissionGroup } from '@/redux/services/users/users.api-slice';

interface PermissionsTableProps {
  /** The grid's rows, from GET /users/permissions. */
  catalogue: ConsolePermissionGroup[];
  matrix: PermissionMatrix;
  isLoading?: boolean;
  onToggle: (resourceKey: string, action: PermissionAction) => void;
}

const ACTION_LABEL: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
};

export const PermissionsTable = ({
  catalogue,
  matrix,
  isLoading = false,
  onToggle,
}: PermissionsTableProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white dark:bg-card">
      <div className="px-5 py-4">
        <h2 className="text-base font-bold text-grey-black dark:text-white">
          Permission
        </h2>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F9FAFB] dark:bg-muted">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 pl-5 text-xs font-medium text-gray-500 dark:text-gray-400">
                Module
              </TableHead>
              {PERMISSION_ACTIONS.map((action) => (
                <TableHead
                  key={action}
                  className="h-11 text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {ACTION_LABEL[action]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index} className="border-t border-border">
                  <TableCell className="py-3 pl-5">
                    <Skeleton className="h-4 w-44" />
                  </TableCell>
                  {PERMISSION_ACTIONS.map((action) => (
                    <TableCell key={action} className="py-3">
                      <Skeleton className="size-4 rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading &&
              catalogue.map((group) => (
                <TableRow
                  key={group.resource}
                  className="border-t border-border"
                >
                  <TableCell
                    className={cn(
                      'py-3 pl-5 text-sm text-gray-600 dark:text-gray-400',
                      'whitespace-nowrap'
                    )}
                  >
                    {group.label}
                  </TableCell>
                  {PERMISSION_ACTIONS.map((action) => (
                    <TableCell key={action} className="py-3">
                      <Checkbox
                        checked={matrix[group.resource]?.[action] ?? false}
                        // A cell with no permission behind it cannot be granted;
                        // the catalogue is what defines the grid.
                        disabled={!group.actions?.[action]}
                        onCheckedChange={() => onToggle(group.resource, action)}
                        aria-label={`${group.label} ${ACTION_LABEL[action]}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && catalogue.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={PERMISSION_ACTIONS.length + 1}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Couldn&apos;t load the permission list.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

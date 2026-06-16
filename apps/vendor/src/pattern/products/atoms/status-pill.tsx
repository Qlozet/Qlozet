import { cn } from '@/lib/utils';

interface StatusPillProps {
  status?: 'active' | 'draft' | 'archived';
  className?: string;
}

const CONFIG: Record<string, { label: string; dot: string }> = {
  active: { label: 'Active', dot: 'bg-success' },
  draft: { label: 'Draft', dot: 'bg-yellow-500' },
  archived: { label: 'Archived', dot: 'bg-muted-foreground' },
};

// Small "label + coloured dot" status pill shown beside the Status select.
export const StatusPill = ({
  status = 'active',
  className,
}: StatusPillProps) => {
  const { label, dot } = CONFIG[status] ?? CONFIG.active;
  return (
    <span className={cn('flex items-center gap-2 text-sm text-grey-black dark:text-white', className)}>
      {label}
      <span className={cn('size-2.5 rounded-full', dot)} />
    </span>
  );
};

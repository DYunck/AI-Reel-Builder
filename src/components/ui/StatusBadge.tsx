import { STATUS_META } from '@/data/options';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/types/project';

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        meta.className,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}

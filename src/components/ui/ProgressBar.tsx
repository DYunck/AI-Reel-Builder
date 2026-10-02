import { cn } from '@/lib/utils';

export function ProgressBar({ value, className, label }: { value: number; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Large, tappable checkbox row used by the build and publishing checklists. */
export function CheckRow({
  checked,
  onChange,
  title,
  description,
  index,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description?: string;
  index?: number;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        checked
          ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5'
          : 'border-slate-200 bg-white hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/40',
      )}
    >
      <label className="flex cursor-pointer items-start gap-4">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span
          aria-hidden
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold transition-colors',
            checked
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 text-slate-400 dark:border-slate-600',
          )}
        >
          {checked ? <Check className="h-4 w-4" strokeWidth={3} /> : index}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block font-medium',
              checked ? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-900 dark:text-white',
            )}
          >
            {title}
          </span>
          {description && <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{description}</span>}
        </span>
      </label>
      {children && <div className="mt-3 pl-10">{children}</div>}
    </div>
  );
}

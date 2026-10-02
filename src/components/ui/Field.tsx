import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const control =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 ' +
  'placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 ' +
  'dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400';

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  /** Render-prop receives the generated id so label and control are linked. */
  children: (id: string) => ReactNode;
  className?: string;
  trailing?: ReactNode;
}

export function Field({ label, hint, error, required, children, className, trailing }: FieldProps) {
  const id = useId();
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
        {trailing && <span className="text-xs text-slate-400">{trailing}</span>}
      </div>
      {children(id)}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(control, 'h-10', className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn(control, 'min-h-[80px] resize-y leading-relaxed', className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...props },
  ref,
) {
  return <select ref={ref} className={cn(control, 'h-10 pr-10', className)} {...props} />;
});

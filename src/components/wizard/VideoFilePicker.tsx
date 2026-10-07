import { useId } from 'react';
import { CircleAlert, Film, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Big, phone-friendly "choose a video" button. Nothing is uploaded. */
export function VideoFilePicker({
  onPick,
  reading,
  error,
  label,
  compact,
}: {
  onPick: (file: File) => void;
  reading: boolean;
  error: string | null;
  label: string;
  compact?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          'flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed text-center transition-colors',
          'border-brand-300 bg-brand-50/50 text-brand-700 hover:border-brand-500 hover:bg-brand-50',
          'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-600',
          'dark:border-brand-500/40 dark:bg-brand-500/5 dark:text-brand-300 dark:hover:bg-brand-500/10',
          compact ? 'px-4 py-3' : 'flex-col px-6 py-8',
        )}
      >
        {reading ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <Film className={compact ? 'h-5 w-5' : 'h-8 w-8'} />}
        <span>
          <span className="block font-semibold">{reading ? 'Checking your video…' : label}</span>
          {!compact && !reading && (
            <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">
              Your video stays on your device. Nothing is uploaded.
            </span>
          )}
        </span>
        <input
          id={id}
          type="file"
          accept="video/*,.mov,.mp4,.m4v,.webm"
          className="sr-only"
          disabled={reading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = ''; // Allow picking the same file again.
            if (file) onPick(file);
          }}
        />
      </label>
      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react';
import type { SaveState } from '@/hooks/useAutosaveProject';

export function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
        <CircleAlert className="h-3.5 w-3.5" /> Not saved, will retry
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <CircleCheck className="h-3.5 w-3.5 text-emerald-500" /> All changes saved
    </span>
  );
}

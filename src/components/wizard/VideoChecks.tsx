import type { ReactNode } from 'react';
import { CircleCheck, CircleHelp, Info, TriangleAlert } from 'lucide-react';
import { runVideoChecks, type CheckLevel } from '@/lib/videoFile';
import { cn } from '@/lib/utils';
import type { VideoInfo } from '@/types/project';

const LEVEL_ICON: Record<CheckLevel, ReactNode> = {
  ok: <CircleCheck className="h-5 w-5 text-emerald-500" aria-label="OK" />,
  note: <Info className="h-5 w-5 text-sky-500" aria-label="Note" />,
  warn: <TriangleAlert className="h-5 w-5 text-amber-500" aria-label="Warning" />,
  unknown: <CircleHelp className="h-5 w-5 text-slate-400" aria-label="Not checked" />,
};

/** Plain-language shape / length / quality checks for the owner's video. */
export function VideoChecks({ video, compact }: { video: VideoInfo; compact?: boolean }) {
  const checks = runVideoChecks(video);
  return (
    <ul className={cn('space-y-3', compact && 'space-y-2')} aria-label="Video checks">
      {checks.map((c) => (
        <li key={c.id} className="flex gap-3" data-check={c.id} data-level={c.level}>
          <span className="mt-0.5 shrink-0">{LEVEL_ICON[c.level]}</span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-slate-900 dark:text-white">{c.title}</span>
            {c.detail && !compact && <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{c.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

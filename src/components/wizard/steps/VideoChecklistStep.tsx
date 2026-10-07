import { ArrowRight, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CheckRow } from '@/components/ui/Checkbox';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StepFooter, StepIntro } from '@/components/wizard/StepFooter';
import type { StepProps } from '@/components/wizard/types';
import { VIDEO_CHECKLIST } from '@/data/options';

export function VideoChecklistStep({ project, update, goTo }: StepProps) {
  const done = VIDEO_CHECKLIST.filter((item) => project.checklist[item.key]).length;
  const allDone = done === VIDEO_CHECKLIST.length;

  return (
    <div>
      <StepIntro
        title="Build your video"
        description="Use your favorite editing app (CapCut, InShot or Instagram Edits) and tick off each item as you go."
      />

      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {done} of {VIDEO_CHECKLIST.length} complete
          </span>
          <span className="text-slate-500">{Math.round((done / VIDEO_CHECKLIST.length) * 100)}%</span>
        </div>
        <ProgressBar value={(done / VIDEO_CHECKLIST.length) * 100} label="Build checklist progress" />
      </div>

      <div className="space-y-3">
        {VIDEO_CHECKLIST.map((item, i) => (
          <CheckRow
            key={item.key}
            index={i + 1}
            title={item.label}
            description={item.tip}
            checked={project.checklist[item.key]}
            onChange={(checked) => update({ checklist: { ...project.checklist, [item.key]: checked } })}
          />
        ))}
      </div>

      {allDone && (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          <PartyPopper className="h-5 w-5 shrink-0" />
          Your video is built! Let's do a final review.
        </div>
      )}

      <StepFooter onBack={() => goTo('scenes')}>
        {!allDone && <span className="text-center text-xs text-slate-500 sm:text-right">You can continue and finish these later.</span>}
        <Button size="lg" onClick={() => goTo('review')} iconRight={<ArrowRight className="h-4 w-4" />}>
          Continue to Review
        </Button>
      </StepFooter>
    </div>
  );
}

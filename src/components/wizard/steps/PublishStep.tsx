import { Link } from 'react-router-dom';
import { CircleCheck, PartyPopper, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CheckRow } from '@/components/ui/Checkbox';
import { CopyButton } from '@/components/ui/CopyButton';
import { StepFooter, StepIntro } from '@/components/wizard/StepFooter';
import type { StepProps } from '@/components/wizard/types';
import { PUBLISH_STEPS } from '@/data/options';

export function PublishStep({ project, update, goTo }: StepProps) {
  const checks = PUBLISH_STEPS.map((_, i) => Boolean(project.publish_checklist[i]));
  const allDone = checks.every(Boolean);
  const published = project.status === 'published';

  const toggle = (index: number, value: boolean) => {
    const next = [...checks];
    next[index] = value;
    update({ publish_checklist: next });
  };

  const extras: Record<number, React.ReactNode> = {
    2: <CopyButton text={project.caption} label="Copy caption" />,
    3: <CopyButton text={project.hashtags.join(' ')} label="Copy hashtags" />,
  };

  if (published) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Your Reel is live!</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Great work. Reply to comments in the first hour, it helps Instagram show your Reel to more people.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => update({ status: 'ready_to_publish' })}>
            Mark as not published
          </Button>
          <Link
            to="/projects/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500"
          >
            <Plus className="h-4 w-4" /> Create another Reel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepIntro title="Publish to Instagram" description="Follow these steps on your phone. Tick each one when it's done." />

      <ol className="space-y-3">
        {PUBLISH_STEPS.map((step, i) => (
          <li key={step.title}>
            <CheckRow
              index={i + 1}
              title={step.title}
              description={step.description}
              checked={checks[i]}
              onChange={(v) => toggle(i, v)}
            >
              {extras[i]}
            </CheckRow>
          </li>
        ))}
      </ol>

      <StepFooter onBack={() => goTo(6)}>
        {!allDone && <span className="text-center text-xs text-slate-500 sm:text-right">Complete all steps to mark as published.</span>}
        <Button
          size="lg"
          variant="success"
          disabled={!allDone}
          onClick={() => update({ status: 'published' })}
          icon={<CircleCheck className="h-4 w-4" />}
        >
          Mark as Published
        </Button>
      </StepFooter>
    </div>
  );
}

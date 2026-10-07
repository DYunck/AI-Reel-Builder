import { Check } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { WizardStepDef } from '@/data/wizardPaths';
import { cn } from '@/lib/utils';

interface Props {
  /** This project's own step list. */
  steps: readonly WizardStepDef[];
  activeStep: number;
  /** Furthest step reached; steps up to this one are clickable. */
  maxStep: number;
  onSelect: (step: number) => void;
}

export function WizardProgress({ steps, activeStep, maxStep, onSelect }: Props) {
  const active = steps[activeStep - 1];
  return (
    <nav aria-label="Progress">
      {/* Mobile: compact bar */}
      <div className="md:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-900 dark:text-white">
            Step {activeStep} of {steps.length}: {active.title}
          </span>
          <span className="text-slate-500 dark:text-slate-400">{Math.round((activeStep / steps.length) * 100)}%</span>
        </div>
        <ProgressBar value={(activeStep / steps.length) * 100} label="Wizard progress" />
        <div className="mt-3 flex gap-1.5">
          {steps.map((s, i) => (
            <button
              key={s.slug}
              onClick={() => onSelect(i + 1)}
              disabled={(i + 1) > maxStep}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors disabled:cursor-not-allowed',
                (i + 1) === activeStep
                  ? 'bg-brand-600 dark:bg-brand-400'
                  : (i + 1) <= maxStep
                    ? 'bg-brand-200 dark:bg-brand-500/40'
                    : 'bg-slate-200 dark:bg-slate-800',
              )}
              aria-label={`Go to step ${i + 1}: ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: full stepper */}
      <ol className="hidden items-start md:flex">
        {steps.map((s, i) => {
          const n = i + 1;
          const done = n < activeStep || (n <= maxStep && n !== activeStep);
          const isActive = n === activeStep;
          const reachable = n <= maxStep;
          return (
            <li key={s.slug} className="relative flex flex-1 flex-col items-center">
              {i > 0 && (
                <div
                  className={cn(
                    'absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2',
                    n <= maxStep ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800',
                  )}
                  aria-hidden
                />
              )}
              <button
                onClick={() => onSelect(n)}
                disabled={!reachable}
                aria-current={isActive ? 'step' : undefined}
                className="group relative z-10 flex flex-col items-center disabled:cursor-not-allowed"
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-slate-50 transition-colors dark:ring-slate-950',
                    isActive && 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 dark:bg-brand-500',
                    !isActive && done && 'bg-brand-500 text-white group-hover:bg-brand-600',
                    !isActive && !done && 'border-2 border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900',
                  )}
                >
                  {done && !isActive ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
                </span>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isActive ? 'text-brand-700 dark:text-brand-300' : reachable ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600',
                  )}
                >
                  {s.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

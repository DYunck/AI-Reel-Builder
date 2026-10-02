import { Check } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { WIZARD_STEPS } from '@/data/options';
import { cn } from '@/lib/utils';

interface Props {
  activeStep: number;
  /** Furthest step reached; steps up to this one are clickable. */
  maxStep: number;
  onSelect: (step: number) => void;
}

export function WizardProgress({ activeStep, maxStep, onSelect }: Props) {
  const active = WIZARD_STEPS[activeStep - 1];
  return (
    <nav aria-label="Progress">
      {/* Mobile: compact bar */}
      <div className="md:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-900 dark:text-white">
            Step {activeStep} of {WIZARD_STEPS.length}: {active.title}
          </span>
          <span className="text-slate-500 dark:text-slate-400">{Math.round((activeStep / WIZARD_STEPS.length) * 100)}%</span>
        </div>
        <ProgressBar value={(activeStep / WIZARD_STEPS.length) * 100} label="Wizard progress" />
        <div className="mt-3 flex gap-1.5">
          {WIZARD_STEPS.map((s) => (
            <button
              key={s.number}
              onClick={() => onSelect(s.number)}
              disabled={s.number > maxStep}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors disabled:cursor-not-allowed',
                s.number === activeStep
                  ? 'bg-brand-600 dark:bg-brand-400'
                  : s.number <= maxStep
                    ? 'bg-brand-200 dark:bg-brand-500/40'
                    : 'bg-slate-200 dark:bg-slate-800',
              )}
              aria-label={`Go to step ${s.number}: ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: full stepper */}
      <ol className="hidden items-start md:flex">
        {WIZARD_STEPS.map((s, i) => {
          const done = s.number < activeStep || (s.number <= maxStep && s.number !== activeStep);
          const isActive = s.number === activeStep;
          const reachable = s.number <= maxStep;
          return (
            <li key={s.number} className="relative flex flex-1 flex-col items-center">
              {i > 0 && (
                <div
                  className={cn(
                    'absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2',
                    s.number <= maxStep ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800',
                  )}
                  aria-hidden
                />
              )}
              <button
                onClick={() => onSelect(s.number)}
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
                  {done && !isActive ? <Check className="h-4 w-4" strokeWidth={3} /> : s.number}
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

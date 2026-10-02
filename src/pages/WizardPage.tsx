import { useCallback, type ComponentType } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileQuestion, LoaderCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SaveIndicator } from '@/components/wizard/SaveIndicator';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import type { StepProps } from '@/components/wizard/types';
import { IdeaIntakeStep } from '@/components/wizard/steps/IdeaIntakeStep';
import { ScriptStep } from '@/components/wizard/steps/ScriptStep';
import { VoiceStep } from '@/components/wizard/steps/VoiceStep';
import { ScenePlannerStep } from '@/components/wizard/steps/ScenePlannerStep';
import { VideoChecklistStep } from '@/components/wizard/steps/VideoChecklistStep';
import { FinalReviewStep } from '@/components/wizard/steps/FinalReviewStep';
import { PublishStep } from '@/components/wizard/steps/PublishStep';
import { WIZARD_STEPS, type WizardStepSlug } from '@/data/options';
import { useAutosaveProject } from '@/hooks/useAutosaveProject';

const STEP_COMPONENTS: Record<WizardStepSlug, ComponentType<StepProps>> = {
  idea: IdeaIntakeStep,
  script: ScriptStep,
  voice: VoiceStep,
  scenes: ScenePlannerStep,
  build: VideoChecklistStep,
  review: FinalReviewStep,
  publish: PublishStep,
};

export function WizardPage() {
  const { id, step } = useParams<{ id: string; step?: string }>();
  const navigate = useNavigate();
  const { project, loading, notFound, update, saveState } = useAutosaveProject(id);

  const goTo = useCallback(
    (target: number) => {
      if (!project) return;
      const clamped = Math.max(1, Math.min(WIZARD_STEPS.length, target));
      if (clamped > project.current_step) {
        update({
          current_step: clamped,
          ...(project.status === 'draft' && clamped >= 2 ? { status: 'in_progress' as const } : {}),
        });
      }
      navigate(`/projects/${project.id}/${WIZARD_STEPS[clamped - 1].slug}`);
    },
    [project, update, navigate],
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <EmptyState
        icon={<FileQuestion className="h-6 w-6" />}
        title="Reel not found"
        description="It may have been deleted. Head back to your dashboard to pick another one."
        action={
          <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Back to dashboard
          </Link>
        }
      />
    );
  }

  const active = WIZARD_STEPS.find((s) => s.slug === step);
  // Unknown step, or a step the user hasn't unlocked yet: resume at the furthest step reached.
  if (!active || active.number > project.current_step) {
    const resume = WIZARD_STEPS[Math.min(project.current_step, WIZARD_STEPS.length) - 1];
    return <Navigate to={`/projects/${project.id}/${resume.slug}`} replace />;
  }

  const StepComponent = STEP_COMPONENTS[active.slug];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            to="/"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
              {project.title || 'Untitled Reel'}
            </h1>
            <StatusBadge status={project.status} />
          </div>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      <Card className="mb-6 px-4 py-4 sm:px-6 sm:py-5">
        <WizardProgress activeStep={active.number} maxStep={project.current_step} onSelect={goTo} />
      </Card>

      <Card className="p-5 sm:p-8">
        <StepComponent key={active.slug} project={project} update={update} goTo={goTo} />
      </Card>
    </div>
  );
}

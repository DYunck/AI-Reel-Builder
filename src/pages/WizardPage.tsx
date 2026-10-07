import { useCallback, useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileQuestion, LoaderCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SaveIndicator } from '@/components/wizard/SaveIndicator';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { STEP_COMPONENTS } from '@/components/wizard/stepComponents';
import { getWizardPath, stepAt, stepNumber, type StepSlug } from '@/data/wizardPaths';
import { useAutosaveProject } from '@/hooks/useAutosaveProject';
import { clearSessionVideo } from '@/lib/videoSession';

export function WizardPage() {
  const { id, step } = useParams<{ id: string; step?: string }>();
  const navigate = useNavigate();
  const { project, loading, notFound, update, saveState } = useAutosaveProject(id);

  const path = project ? getWizardPath(project) : null;

  // Release the owner's video file when they leave this Reel.
  useEffect(() => () => {
    if (id) clearSessionVideo(id);
  }, [id]);

  const goToNumber = useCallback(
    (target: number) => {
      if (!project || !path) return;
      const clamped = Math.max(1, Math.min(path.steps.length, target));
      if (clamped > project.current_step) {
        update({
          current_step: clamped,
          ...(project.status === 'draft' && clamped >= 2 ? { status: 'in_progress' as const } : {}),
        });
      }
      navigate(`/projects/${project.id}/${stepAt(path, clamped).slug}`);
    },
    [project, path, update, navigate],
  );

  const goTo = useCallback(
    (slug: StepSlug) => {
      if (path && stepNumber(path, slug)) goToNumber(stepNumber(path, slug));
    },
    [path, goToNumber],
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

  const projectPath = getWizardPath(project);
  const activeNumber = step ? stepNumber(projectPath, step) : 0;
  // Unknown step, a step from another path, or one not unlocked yet: resume at the furthest step reached.
  if (!activeNumber || activeNumber > project.current_step) {
    const resume = stepAt(projectPath, project.current_step);
    return <Navigate to={`/projects/${project.id}/${resume.slug}`} replace />;
  }

  const active = stepAt(projectPath, activeNumber);
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
        <WizardProgress
          steps={projectPath.steps}
          activeStep={activeNumber}
          maxStep={project.current_step}
          onSelect={goToNumber}
        />
      </Card>

      <Card className="p-5 sm:p-8">
        <StepComponent
          key={active.slug}
          project={project}
          update={update}
          path={projectPath}
          goTo={goTo}
          goNext={() => goToNumber(activeNumber + 1)}
          goBack={() => goToNumber(activeNumber - 1)}
        />
      </Card>
    </div>
  );
}

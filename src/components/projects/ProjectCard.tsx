import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { WIZARD_STEPS } from '@/data/options';
import { formatRelative } from '@/lib/utils';
import type { Project } from '@/types/project';

export function projectProgress(p: Project) {
  if (p.status === 'published') return 100;
  return Math.round(((p.current_step - 1) / WIZARD_STEPS.length) * 100);
}

export function ProjectCard({ project, onDelete }: { project: Project; onDelete?: (p: Project) => void }) {
  const step = WIZARD_STEPS[Math.min(project.current_step, WIZARD_STEPS.length) - 1];
  const finished = project.status === 'published';

  return (
    <Card className="group flex flex-col transition-shadow hover:shadow-md">
      <Link to={`/projects/${project.id}`} className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <StatusBadge status={project.status} />
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" /> {formatRelative(project.updated_at)}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
          {project.title || 'Untitled Reel'}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
          {[project.tone, `${project.length}s`, project.audience].filter(Boolean).join(' · ')}
        </p>
        <div className="mt-auto pt-5">
          <div className="mb-1.5 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{finished ? 'Complete' : `Step ${project.current_step} of ${WIZARD_STEPS.length}: ${step.title}`}</span>
            <span>{projectProgress(project)}%</span>
          </div>
          <ProgressBar value={projectProgress(project)} />
        </div>
      </Link>
      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 dark:border-slate-800">
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          {finished ? 'View' : project.status === 'draft' ? 'Start' : 'Continue'} <ArrowRight className="h-4 w-4" />
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(project)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
            aria-label={`Delete ${project.title || 'project'}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}

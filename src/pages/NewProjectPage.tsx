import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Film, LoaderCircle, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/AppLayout';
import { WIZARD_PATHS } from '@/data/wizardPaths';
import { projectService } from '@/lib/projectService';
import { cn } from '@/lib/utils';
import type { ProjectSource } from '@/types/project';

const CHOICES: { source: ProjectSource; title: string; description: string; icon: typeof Film }[] = [
  {
    source: 'plan',
    title: 'Plan a new Reel with help',
    description: "Start from an idea. We'll write the script, plan the shots, and walk you through filming and posting.",
    icon: Sparkles,
  },
  {
    source: 'existing',
    title: 'Post a video I already have',
    description: "Already filmed it? We'll check it's ready for Instagram, write the caption and hashtags, and help you pick a cover.",
    icon: Film,
  },
];

/**
 * Asks which way to make the Reel. The project is only created once the owner
 * picks, so opening this page and leaving doesn't leave an empty draft behind.
 */
export function NewProjectPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState<ProjectSource | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async (source: ProjectSource) => {
    setCreating(source);
    setError(null);
    try {
      const project = await projectService.create({ source });
      navigate(`/projects/${project.id}/${WIZARD_PATHS[source].steps[0].slug}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create project');
      setCreating(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New Reel" description="How would you like to make it?" />

      <div className="grid gap-4 sm:grid-cols-2">
        {CHOICES.map(({ source, title, description, icon: Icon }) => (
          <button
            key={source}
            onClick={() => start(source)}
            disabled={creating !== null}
            className={cn(
              'group flex flex-col rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition',
              'hover:border-brand-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
              'disabled:cursor-wait disabled:opacity-70 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60',
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              {creating === source ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
            </span>
            <span className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{title}</span>
            <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</span>
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-600 dark:text-brand-400">
              {WIZARD_PATHS[source].steps.length} short steps
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          Couldn't create a new Reel: {error}
        </p>
      )}
    </div>
  );
}

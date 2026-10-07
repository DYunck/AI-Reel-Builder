import { Link } from 'react-router-dom';
import { ArrowRight, CircleCheck, Clapperboard, FilePen, Play, Plus, Rocket, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/AppLayout';
import { ProjectCard, projectProgress } from '@/components/projects/ProjectCard';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getWizardPath, stepAt } from '@/data/wizardPaths';
import { useProjects } from '@/hooks/useProjects';
import type { ProjectStatus } from '@/types/project';

const STATS: { status: ProjectStatus; label: string; icon: typeof FilePen; tint: string }[] = [
  { status: 'draft', label: 'Drafts', icon: FilePen, tint: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  { status: 'in_progress', label: 'In Progress', icon: Play, tint: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  { status: 'ready_to_publish', label: 'Ready to Publish', icon: Rocket, tint: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' },
  { status: 'published', label: 'Published', icon: CircleCheck, tint: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
];

export function DashboardPage() {
  const { projects, loading, error, confirmRemove } = useProjects();
  const resume = projects.find((p) => p.status !== 'published');

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Turn your ideas into scroll-stopping Reels, one simple step at a time."
        action={
          <Link
            to="/projects/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            <Plus className="h-4 w-4" /> New Reel
          </Link>
        }
      />

      {error && (
        <p className="mb-6 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          Couldn't load your projects: {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ status, label, icon: Icon, tint }) => (
          <Card key={status} className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? '–' : projects.filter((p) => p.status === status).length}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {resume && (
        <Card className="mt-6 overflow-hidden">
          <div className="flex flex-col gap-5 bg-gradient-to-r from-brand-600 to-fuchsia-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Sparkles className="h-4 w-4" /> Pick up where you left off
              </div>
              <h2 className="mt-1 truncate text-xl font-bold">{resume.title || 'Untitled Reel'}</h2>
              <div className="mt-3 flex items-center gap-3">
                <StatusBadge status={resume.status} className="bg-white/90 ring-white/0 dark:bg-white/90" />
                <span className="text-sm text-white/80">
                  Next: {stepAt(getWizardPath(resume), resume.current_step).description}
                </span>
              </div>
              <ProgressBar value={projectProgress(resume)} className="mt-4 max-w-sm bg-white/20 dark:bg-white/20" />
            </div>
            <Link
              to={`/projects/${resume.id}`}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-brand-700 shadow hover:bg-brand-50"
            >
              Resume <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      )}

      <div className="mb-4 mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Reels</h2>
        {projects.length > 0 && (
          <Link to="/projects" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            View all
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl bg-slate-200/60 dark:bg-slate-800/60" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<Clapperboard className="h-6 w-6" />}
          title="No Reels yet"
          description="Start with an idea. We'll guide you through the script, voice, scenes and publishing."
          action={
            <Link
              to="/projects/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" /> Create your first Reel
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.slice(0, 6).map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onDelete={(proj) => void confirmRemove(proj)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

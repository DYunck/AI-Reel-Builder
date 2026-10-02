import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, SearchX } from 'lucide-react';
import { PageHeader } from '@/components/layout/AppLayout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Field';
import { STATUS_META } from '@/data/options';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/types/project';

type Filter = 'all' | ProjectStatus;

export function ProjectsPage() {
  const { projects, loading, confirmRemove } = useProjects();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (filter === 'all' || p.status === filter) &&
        (!q || p.title.toLowerCase().includes(q) || p.audience.toLowerCase().includes(q)),
    );
  }, [projects, query, filter]);

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: projects.length },
    ...(Object.keys(STATUS_META) as ProjectStatus[]).map((s) => ({
      value: s,
      label: STATUS_META[s].label,
      count: projects.filter((p) => p.status === s).length,
    })),
  ];

  return (
    <div>
      <PageHeader
        title="My Reels"
        description="Every Reel you've started. Pick one up anytime, your progress is saved."
        action={
          <Link
            to="/projects/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 dark:bg-brand-500"
          >
            <Plus className="h-4 w-4" /> New Reel
          </Link>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                filter === f.value
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800',
              )}
            >
              {f.label} <span className="ml-1 opacity-60">{f.count}</span>
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Reels…" className="pl-9" aria-label="Search Reels" />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl bg-slate-200/60 dark:bg-slate-800/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-6 w-6" />}
          title="No Reels found"
          description={projects.length ? 'Try a different search or filter.' : 'Create your first Reel to see it here.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
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

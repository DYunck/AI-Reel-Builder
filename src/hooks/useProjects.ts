import { useCallback, useEffect, useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { projectService } from '@/lib/projectService';
import type { Project } from '@/types/project';

/** Loads the full project list for the dashboard and projects pages. */
export function useProjects() {
  const confirm = useConfirm();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await projectService.list());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await projectService.remove(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /** Asks first, then deletes. */
  const confirmRemove = useCallback(
    async (project: Project) => {
      const ok = await confirm({
        title: `Delete "${project.title || 'Untitled Reel'}"?`,
        message: "This can't be undone.",
        confirmLabel: 'Delete',
        danger: true,
      });
      if (ok) await remove(project.id);
    },
    [confirm, remove],
  );

  return { projects, loading, error, refresh, remove, confirmRemove };
}

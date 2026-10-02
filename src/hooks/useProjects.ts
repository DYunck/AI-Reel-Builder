import { useCallback, useEffect, useState } from 'react';
import { projectService } from '@/lib/projectService';
import type { Project } from '@/types/project';

/** Loads the full project list for the dashboard and projects pages. */
export function useProjects() {
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

  return { projects, loading, error, refresh, remove };
}

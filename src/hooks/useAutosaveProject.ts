import { useCallback, useEffect, useRef, useState } from 'react';
import { projectService } from '@/lib/projectService';
import type { Project, ProjectInput } from '@/types/project';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const DEBOUNCE_MS = 700;
const RETRY_MS = 4000;

/**
 * Loads one project and saves edits automatically.
 *
 * `update()` applies changes to local state immediately and queues them;
 * queued changes are written to storage after a short pause in typing,
 * when `flush()` is called (e.g. before navigating), or on unmount.
 */
export function useAutosaveProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const pending = useRef<ProjectInput>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<Promise<void>>(Promise.resolve());
  const flushRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    projectService
      .get(id)
      .then((p) => {
        if (cancelled) return;
        setProject(p);
        setNotFound(!p);
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (!id || Object.keys(pending.current).length === 0) return inFlight.current;

    const patch = pending.current;
    pending.current = {};
    setSaveState('saving');

    // Chain saves so they reach storage in order.
    inFlight.current = inFlight.current
      .then(() => projectService.update(id, patch))
      .then(() => {
        if (Object.keys(pending.current).length === 0) setSaveState('saved');
        setLastSavedAt(new Date());
      })
      .catch(() => {
        // Re-queue so the next save retries these changes.
        pending.current = { ...patch, ...pending.current };
        setSaveState('error');
        if (!timer.current) timer.current = setTimeout(() => void flushRef.current(), RETRY_MS);
      });
    return inFlight.current;
  }, [id]);
  flushRef.current = flush;

  const update = useCallback(
    (patch: ProjectInput) => {
      setProject((prev) => (prev ? { ...prev, ...patch } : prev));
      pending.current = { ...pending.current, ...patch };
      setSaveState('saving');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), DEBOUNCE_MS);
    },
    [flush],
  );

  // Save anything outstanding when leaving the page or closing the tab.
  useEffect(() => {
    const onBeforeUnload = () => void flush();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      void flush();
    };
  }, [flush]);

  return { project, loading, notFound, update, flush, saveState, lastSavedAt };
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { projectService } from '@/lib/projectService';

/** Creates a blank draft and jumps straight into step 1 of the wizard. */
export function NewProjectPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // React StrictMode runs effects twice in dev.
    started.current = true;
    projectService
      .create()
      .then((p) => navigate(`/projects/${p.id}/idea`, { replace: true }))
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not create project'));
  }, [navigate]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      {error ? (
        <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          Couldn't create a new Reel: {error}
        </p>
      ) : (
        <>
          <LoaderCircle className="h-8 w-8 animate-spin text-brand-500" />
          <p className="mt-3 text-sm text-slate-500">Setting up your new Reel…</p>
        </>
      )}
    </div>
  );
}

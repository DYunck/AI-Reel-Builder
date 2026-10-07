import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Clapperboard, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input, Textarea } from '@/components/ui/Field';
import { StepFooter, StepIntro } from '@/components/wizard/StepFooter';
import type { StepProps } from '@/components/wizard/types';
import { generateScenes } from '@/lib/contentGenerator';
import { cn, uid } from '@/lib/utils';
import type { Scene } from '@/types/project';

export function ScenePlannerStep({ project, update, goTo }: StepProps) {
  const confirm = useConfirm();
  const [generating, setGenerating] = useState(false);
  const autoStarted = useRef(false);
  const scenes = project.scenes;

  const regenerate = async () => {
    setGenerating(true);
    try {
      update({ scenes: await generateScenes(project) });
    } finally {
      setGenerating(false);
    }
  };

  // First visit: build a starting plan automatically.
  useEffect(() => {
    if (!autoStarted.current && scenes.length === 0) {
      autoStarted.current = true;
      void regenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setScene = (id: string, patch: Partial<Scene>) =>
    update({ scenes: scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const addScene = () =>
    update({ scenes: [...scenes, { id: uid(), description: '', visual: '', duration: 3 }] });

  const removeScene = (id: string) => update({ scenes: scenes.filter((s) => s.id !== id) });

  const handleRegenerate = async () => {
    if (
      scenes.length &&
      !(await confirm({ title: 'Replace your scene plan?', message: 'Your current scenes and any edits will be replaced.', confirmLabel: 'Replace scenes' }))
    ) {
      return;
    }
    void regenerate();
  };

  const total = scenes.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
  const diff = total - project.length;

  const durationInput = (s: Scene) => (
    <Input
      type="number"
      min={1}
      max={90}
      inputMode="numeric"
      value={s.duration}
      onChange={(e) => setScene(s.id, { duration: Math.max(0, Number(e.target.value)) })}
      className="w-20 text-center"
      aria-label="Duration in seconds"
    />
  );

  return (
    <div>
      <StepIntro
        title="Plan your scenes"
        description="Each row is one shot to film. Edit the descriptions to match what you can easily capture with your phone."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium',
            Math.abs(diff) <= 3
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
          )}
        >
          Total: {total}s of {project.length}s
          {Math.abs(diff) > 3 && <span className="font-normal">({diff > 0 ? `${diff}s too long` : `${-diff}s short`})</span>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleRegenerate} loading={generating} icon={<RefreshCw className="h-4 w-4" />}>
            Regenerate
          </Button>
          <Button variant="secondary" size="sm" onClick={addScene} icon={<Plus className="h-4 w-4" />}>
            Add scene
          </Button>
        </div>
      </div>

      {generating && scenes.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : scenes.length === 0 ? (
        <EmptyState
          icon={<Clapperboard className="h-6 w-6" />}
          title="No scenes yet"
          description="Generate a plan or add your first scene manually."
          action={<Button onClick={addScene} icon={<Plus className="h-4 w-4" />}>Add scene</Button>}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="w-16 px-4 py-3 font-semibold">Scene</th>
                  <th className="px-4 py-3 font-semibold">Scene Description</th>
                  <th className="px-4 py-3 font-semibold">Suggested Visual</th>
                  <th className="w-28 px-4 py-3 font-semibold">Duration (s)</th>
                  <th className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
                {scenes.map((s, i) => (
                  <tr key={s.id} className="align-top">
                    <td className="px-4 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <Textarea
                        rows={2}
                        value={s.description}
                        placeholder="What happens in this scene?"
                        onChange={(e) => setScene(s.id, { description: e.target.value })}
                        className="min-h-[60px]"
                        aria-label={`Scene ${i + 1} description`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Textarea
                        rows={2}
                        value={s.visual}
                        placeholder="What should the camera show?"
                        onChange={(e) => setScene(s.id, { visual: e.target.value })}
                        className="min-h-[60px]"
                        aria-label={`Scene ${i + 1} suggested visual`}
                      />
                    </td>
                    <td className="px-2 py-2">{durationInput(s)}</td>
                    <td className="px-2 py-3">
                      <button
                        onClick={() => removeScene(s.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                        aria-label={`Delete scene ${i + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {scenes.map((s, i) => (
              <li key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Scene {i + 1}</span>
                  <div className="flex items-center gap-2">
                    {durationInput(s)}
                    <span className="text-xs text-slate-500">sec</span>
                    <button
                      onClick={() => removeScene(s.id)}
                      className="rounded-lg p-2 text-slate-400 hover:text-rose-600"
                      aria-label={`Delete scene ${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Scene Description</label>
                <Textarea rows={2} value={s.description} onChange={(e) => setScene(s.id, { description: e.target.value })} />
                <label className="mb-1 mt-3 block text-xs font-medium text-slate-500">Suggested Visual</label>
                <Textarea rows={2} value={s.visual} onChange={(e) => setScene(s.id, { visual: e.target.value })} />
              </li>
            ))}
          </ul>
        </>
      )}

      <StepFooter onBack={() => goTo('voice')}>
        <Button size="lg" onClick={() => goTo('build')} disabled={scenes.length === 0} iconRight={<ArrowRight className="h-4 w-4" />}>
          Continue to Build
        </Button>
      </StepFooter>
    </div>
  );
}

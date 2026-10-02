import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { StepFooter, StepIntro } from '@/components/wizard/StepFooter';
import type { StepProps } from '@/components/wizard/types';
import { generateContent } from '@/lib/contentGenerator';
import { LENGTHS, TONES } from '@/data/options';
import { cn } from '@/lib/utils';

export function IdeaIntakeStep({ project, update, goTo }: StepProps) {
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [genError, setGenError] = useState<string | null>(null);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!project.title.trim()) next.title = 'Tell us what your Reel is about.';
    if (!project.audience.trim()) next.audience = 'Who should this Reel speak to?';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    if (project.script && !window.confirm('This will replace your current script, caption and hashtags. Continue?')) {
      return;
    }
    setGenerating(true);
    setGenError(null);
    try {
      const content = await generateContent(project);
      update({
        ...content,
        status: project.status === 'draft' ? 'in_progress' : project.status,
        checklist: { ...project.checklist, script: true },
      });
      goTo(2);
    } catch {
      setGenError('Something went wrong while generating. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <StepIntro
        title="What's your Reel about?"
        description="Answer a few quick questions. We'll write the script, caption and hashtags for you."
      />

      <div className="grid gap-5">
        <Field
          label="Reel Topic"
          required
          error={errors.title}
          hint="Be specific. “3 ways to style our linen shirt” works better than “clothes”."
        >
          {(id) => (
            <Input
              id={id}
              value={project.title}
              placeholder="e.g. Behind the scenes of baking our sourdough"
              maxLength={120}
              onChange={(e) => update({ title: e.target.value })}
            />
          )}
        </Field>

        <Field label="Audience" required error={errors.audience} hint="Who are you trying to reach?">
          {(id) => (
            <Input
              id={id}
              value={project.audience}
              placeholder="e.g. Busy parents in our neighborhood"
              maxLength={120}
              onChange={(e) => update({ audience: e.target.value })}
            />
          )}
        </Field>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">Tone</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TONES.map((t) => (
              <label
                key={t.value}
                className={cn(
                  'cursor-pointer rounded-lg border p-3 transition-colors',
                  project.tone === t.value
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:bg-brand-500/10'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
                )}
              >
                <input
                  type="radio"
                  name="tone"
                  value={t.value}
                  checked={project.tone === t.value}
                  onChange={() => update({ tone: t.value })}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">{t.value}</span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{t.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Video Length" hint="30 seconds is a great starting point for most businesses.">
          {(id) => (
            <Select id={id} value={project.length} onChange={(e) => update({ length: Number(e.target.value) })}>
              {LENGTHS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label} · {l.hint}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Call To Action" hint="What should viewers do after watching? Leave blank and we'll suggest one.">
          {(id) => (
            <Textarea
              id={id}
              rows={2}
              value={project.call_to_action}
              placeholder="e.g. Book your free consultation at the link in our bio"
              maxLength={160}
              onChange={(e) => update({ call_to_action: e.target.value })}
            />
          )}
        </Field>
      </div>

      {genError && (
        <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{genError}</p>
      )}

      <StepFooter>
        {project.script && (
          <Button variant="secondary" onClick={() => goTo(2)} disabled={generating}>
            Keep current script
          </Button>
        )}
        <Button size="lg" onClick={handleGenerate} loading={generating} icon={<Sparkles className="h-4 w-4" />}>
          {generating ? 'Writing your script…' : project.script ? 'Regenerate Content' : 'Generate Content'}
        </Button>
      </StepFooter>
    </div>
  );
}

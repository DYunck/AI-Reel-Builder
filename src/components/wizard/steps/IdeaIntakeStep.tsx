import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import { Field, Input, Select } from '@/components/ui/Field';
import { AudienceField, CallToActionField, ToneField } from '@/components/wizard/ReelBasicsFields';
import { StepFooter, StepIntro } from '@/components/wizard/StepFooter';
import type { StepProps } from '@/components/wizard/types';
import { generateContent } from '@/lib/contentGenerator';
import { LENGTHS } from '@/data/options';

export function IdeaIntakeStep({ project, update, goTo }: StepProps) {
  const confirm = useConfirm();
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
    if (
      project.script &&
      !(await confirm({
        title: 'Regenerate content?',
        message: 'This replaces your current script, caption and hashtags, including any edits you made.',
        confirmLabel: 'Regenerate',
      }))
    ) {
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
      goTo('script');
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

        <AudienceField value={project.audience} error={errors.audience} onChange={(audience) => update({ audience })} />

        <ToneField value={project.tone} onChange={(tone) => update({ tone })} />

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

        <CallToActionField value={project.call_to_action} onChange={(call_to_action) => update({ call_to_action })} />
      </div>

      {genError && (
        <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{genError}</p>
      )}

      <StepFooter>
        {project.script && (
          <Button variant="secondary" onClick={() => goTo('script')} disabled={generating}>
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

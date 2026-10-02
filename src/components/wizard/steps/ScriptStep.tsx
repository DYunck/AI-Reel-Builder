import { useState } from 'react';
import { ArrowRight, Clock, Hash, MessageSquareText, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { StepFooter, StepIntro } from '@/components/wizard/StepFooter';
import type { StepProps } from '@/components/wizard/types';
import { cn, estimateSpeechSeconds, fullScript, normalizeHashtags } from '@/lib/utils';
import type { ReelScript } from '@/types/project';

export function ScriptStep({ project, update, goTo }: StepProps) {
  const script: ReelScript = project.script ?? { hook: '', body: '', cta: '' };
  const [tagDraft, setTagDraft] = useState('');

  const setScript = (patch: Partial<ReelScript>) => update({ script: { ...script, ...patch } });

  const addTags = () => {
    const added = normalizeHashtags(tagDraft);
    if (added.length) update({ hashtags: Array.from(new Set([...project.hashtags, ...added])) });
    setTagDraft('');
  };

  const removeTag = (tag: string) => update({ hashtags: project.hashtags.filter((t) => t !== tag) });

  const estimated = estimateSpeechSeconds(fullScript(script));
  const overTime = estimated > project.length + 5;

  return (
    <div>
      <StepIntro
        title="Review your script"
        description="Here's a first draft. Change anything you like, it saves automatically."
      />

      <div
        className={cn(
          'mb-6 flex items-start gap-3 rounded-lg p-3 text-sm',
          overTime
            ? 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
            : 'bg-brand-50 text-brand-800 dark:bg-brand-500/10 dark:text-brand-200',
        )}
      >
        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Estimated speaking time: <strong>~{estimated}s</strong> (target {project.length}s).{' '}
          {overTime ? 'Try trimming the main script so it fits.' : 'Nice, that fits your target length.'}
        </span>
      </div>

      <div className="grid gap-5">
        <Field label="Hook" hint="The first line people hear. Make them stop scrolling." trailing={`${script.hook.length}/150`}>
          {(id) => (
            <Textarea id={id} rows={2} maxLength={150} value={script.hook} onChange={(e) => setScript({ hook: e.target.value })} />
          )}
        </Field>

        <Field label="Main Script" hint="The heart of your message. Short sentences are easier to say.">
          {(id) => (
            <Textarea id={id} rows={6} value={script.body} onChange={(e) => setScript({ body: e.target.value })} />
          )}
        </Field>

        <Field label="Call To Action" hint="Tell viewers exactly what to do next.">
          {(id) => <Textarea id={id} rows={2} value={script.cta} onChange={(e) => setScript({ cta: e.target.value })} />}
        </Field>

        <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <MessageSquareText className="h-4 w-4 text-brand-500" /> Instagram post
          </h3>

          <div className="grid gap-5">
            <Field label="Instagram Caption" trailing={`${project.caption.length}/2200`}>
              {(id) => (
                <Textarea
                  id={id}
                  rows={5}
                  maxLength={2200}
                  value={project.caption}
                  onChange={(e) => update({ caption: e.target.value })}
                />
              )}
            </Field>

            <Field label="Hashtags" hint="3 to 10 relevant hashtags works best. Press Enter to add." trailing={`${project.hashtags.length} tags`}>
              {(id) => (
                <div>
                  <div className="flex gap-2">
                    <Input
                      id={id}
                      value={tagDraft}
                      placeholder="#yourcity #yourniche"
                      onChange={(e) => setTagDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addTags();
                        }
                      }}
                      onBlur={addTags}
                    />
                    <Button variant="secondary" onClick={addTags} icon={<Hash className="h-4 w-4" />}>
                      Add
                    </Button>
                  </div>
                  {project.hashtags.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {project.hashtags.map((tag) => (
                        <li
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="rounded-full p-0.5 hover:bg-brand-100 dark:hover:bg-brand-500/20"
                            aria-label={`Remove ${tag}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </Field>
          </div>
        </div>
      </div>

      <StepFooter onBack={() => goTo(1)}>
        <Button
          size="lg"
          onClick={() => goTo(3)}
          disabled={!script.hook.trim() || !script.body.trim()}
          iconRight={<ArrowRight className="h-4 w-4" />}
        >
          Continue to Voice
        </Button>
      </StepFooter>
    </div>
  );
}

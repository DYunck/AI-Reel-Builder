import { useState } from 'react';
import { Sparkles, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { useConfirm } from '@/context/ConfirmContext';
import { AudienceField, CallToActionField, ToneField } from '@/components/wizard/ReelBasicsFields';
import { StepFooter, StepIntro } from '@/components/wizard/StepFooter';
import { VideoChecks } from '@/components/wizard/VideoChecks';
import { VideoFilePicker } from '@/components/wizard/VideoFilePicker';
import type { StepProps } from '@/components/wizard/types';
import { lengthFromDuration, useVideoPicker } from '@/hooks/useVideoPicker';
import { generateVideoCaption } from '@/lib/contentGenerator';
import { formatBytes, formatSeconds } from '@/lib/utils';

export function VideoStep({ project, update, goTo }: StepProps) {
  const confirm = useConfirm();
  const { reading, error, pick } = useVideoPicker(project, update);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [genError, setGenError] = useState<string | null>(null);
  const video = project.video ?? null;

  const setManualDuration = (value: string) => {
    if (!video) return;
    const seconds = Math.max(0, Number(value) || 0);
    update({ video: { ...video, duration_seconds: seconds }, ...(seconds > 0 ? { length: lengthFromDuration(seconds) } : {}) });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!video) next.video = 'Choose your video first.';
    else if (!video.duration_seconds) next.duration = 'Enter how long your video is, in seconds.';
    if (!project.title.trim()) next.title = 'Tell us in one sentence what happens in the video.';
    if (!project.audience.trim()) next.audience = 'Who should this Reel speak to?';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate() || !video) return;
    if (
      project.caption &&
      !(await confirm({
        title: 'Write a new caption?',
        message: 'This replaces your current caption and hashtags, including any edits you made.',
        confirmLabel: 'Write a new one',
      }))
    ) {
      return;
    }
    setGenerating(true);
    setGenError(null);
    try {
      const content = await generateVideoCaption({
        description: project.title,
        audience: project.audience,
        tone: project.tone,
        call_to_action: project.call_to_action,
        duration_seconds: video.duration_seconds,
      });
      update(content);
      goTo('caption');
    } catch {
      setGenError('Something went wrong while writing your caption. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <StepIntro
        title="Let's check your video"
        description="Choose the video from your phone. We'll check it's ready for Instagram, then write your caption."
      />

      <VideoFilePicker
        onPick={pick}
        reading={reading}
        error={error ?? errors.video ?? null}
        label={video ? 'Choose a different video' : 'Choose your video'}
        compact={!!video}
      />

      {video && (
        <Card className="mt-4 p-4 sm:p-5" data-testid="video-details">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="min-w-0 break-all font-medium text-slate-900 dark:text-white">{video.file_name}</span>
            <span className="text-sm tabular-nums text-slate-500 dark:text-slate-400">
              {[video.duration_seconds ? formatSeconds(video.duration_seconds) : null, formatBytes(video.size_bytes)]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </div>

          {!video.playable && (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200" role="status">
              <p className="flex items-start gap-2 font-medium">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> Your browser can't play this video here.
              </p>
              <p className="mt-1 pl-6">
                This often happens with iPhone videos in Chrome or Firefox. The video itself is probably fine for Instagram.
                Type its length below and carry on. You'll pick the cover inside Instagram instead.
              </p>
              <div className="mt-3 pl-6">
                <Field label="How long is the video? (seconds)" error={errors.duration} hint="Check it in your phone's Photos app, e.g. 45.">
                  {(id) => (
                    <Input
                      id={id}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      className="max-w-[10rem]"
                      value={video.duration_seconds || ''}
                      onChange={(e) => setManualDuration(e.target.value)}
                    />
                  )}
                </Field>
              </div>
            </div>
          )}

          <VideoChecks video={video} />
        </Card>
      )}

      <div className="mt-8 grid gap-5 border-t border-slate-200 pt-6 dark:border-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Tell us about it</h3>
        <Field
          label="What happens in the video?"
          required
          error={errors.title}
          hint="One sentence is enough. We use it to write your caption."
        >
          {(id) => (
            <Input
              id={id}
              value={project.title}
              placeholder="e.g. Customer reacting to her new haircut"
              maxLength={120}
              onChange={(e) => update({ title: e.target.value })}
            />
          )}
        </Field>
        <AudienceField value={project.audience} error={errors.audience} onChange={(audience) => update({ audience })} />
        <ToneField value={project.tone} onChange={(tone) => update({ tone })} />
        <CallToActionField value={project.call_to_action} onChange={(call_to_action) => update({ call_to_action })} />
      </div>

      {genError && (
        <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{genError}</p>
      )}

      <StepFooter>
        {project.caption && (
          <Button variant="secondary" onClick={() => validate() && goTo('caption')} disabled={generating || reading}>
            Keep current caption
          </Button>
        )}
        <Button size="lg" onClick={handleGenerate} loading={generating} disabled={reading} icon={<Sparkles className="h-4 w-4" />}>
          {generating ? 'Writing your caption…' : project.caption ? 'Write a New Caption' : 'Write My Caption'}
        </Button>
      </StepFooter>
    </div>
  );
}

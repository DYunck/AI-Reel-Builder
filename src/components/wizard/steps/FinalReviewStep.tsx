import type { ReactNode } from 'react';
import { Clapperboard, FileText, Film, Hash, MessageSquareText, Pencil, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { CoverPreview } from '@/components/wizard/CoverPreview';
import { StepFooter, StepIntro } from '@/components/wizard/StepFooter';
import { VideoChecks } from '@/components/wizard/VideoChecks';
import type { StepProps } from '@/components/wizard/types';
import { VIDEO_CHECKLIST } from '@/data/options';
import type { ReviewSection, WizardPath } from '@/data/wizardPaths';
import { formatSeconds, fullScript } from '@/lib/utils';

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} icon={<Pencil className="h-3.5 w-3.5" />}>
      Edit
    </Button>
  );
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">{value || '—'}</dd>
    </div>
  );
}

export function FinalReviewStep({ project, update, path, goTo, goNext, goBack }: StepProps) {
  const has = (section: ReviewSection) => path.review.includes(section);
  const edit = (target: keyof WizardPath['editStep']) => {
    const slug = path.editStep[target];
    if (slug) goTo(slug);
  };
  const unchecked = has('buildChecklist') ? VIDEO_CHECKLIST.filter((i) => !project.checklist[i.key]) : [];
  const totalDuration = project.scenes.reduce((s, sc) => s + (Number(sc.duration) || 0), 0);
  const video = project.video ?? null;

  const handleReady = () => {
    if (project.status !== 'published') update({ status: 'ready_to_publish' });
    goNext();
  };

  return (
    <div>
      <StepIntro title="Final review" description="Everything in one place. Give it a last read before you post." />

      <dl className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-4 dark:bg-slate-900">
        <Meta label={path.titleLabel} value={project.title} />
        <Meta label="Audience" value={project.audience} />
        <Meta label="Tone" value={project.tone} />
        <Meta label="Length" value={video ? formatSeconds(video.duration_seconds) : `${project.length}s`} />
      </dl>

      {unchecked.length > 0 && (
        <div className="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          Still to do in your video: {unchecked.map((i) => i.label).join(', ')}.{' '}
          <button className="font-semibold underline" onClick={() => edit('build')}>
            Open checklist
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {has('video') && video && (
          <Card className="lg:col-span-2">
            <CardHeader
              icon={<Film className="h-4 w-4" />}
              title="Your video"
              action={<EditButton onClick={() => edit('video')} />}
            />
            <CardBody className="flex flex-col gap-5 sm:flex-row">
              <div className="flex shrink-0 flex-row items-end gap-3 sm:flex-col sm:items-start">
                <CoverPreview src={video.cover_image} text={video.cover_text} className="w-24 sm:w-28" label="Your cover" />
                <Button variant="secondary" size="sm" onClick={() => edit('cover')}>
                  Change cover
                </Button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                  <span className="break-all">{video.file_name}</span> · {formatSeconds(video.duration_seconds)}
                </p>
                <VideoChecks video={video} compact />
                {video.cover_time_seconds != null && (
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                    Cover: when you post, tap "Edit cover" and slide to{' '}
                    <strong className="tabular-nums">{formatSeconds(video.cover_time_seconds)}</strong>.
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {has('script') && (
          <Card className="lg:col-span-2">
            <CardHeader
              icon={<FileText className="h-4 w-4" />}
              title="Script"
              action={
                <div className="flex gap-1">
                  <CopyButton text={fullScript(project.script)} />
                  <EditButton onClick={() => edit('script')} />
                </div>
              }
            />
            <CardBody className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <p>
                <span className="mr-2 text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">Hook</span>
                {project.script?.hook}
              </p>
              <p className="whitespace-pre-line">
                <span className="mr-2 text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">Main</span>
                {project.script?.body}
              </p>
              <p>
                <span className="mr-2 text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">CTA</span>
                {project.script?.cta}
              </p>
            </CardBody>
          </Card>
        )}

        {has('scenes') && (
          <Card className="lg:col-span-2">
            <CardHeader
              icon={<Clapperboard className="h-4 w-4" />}
              title="Scene Plan"
              description={`${project.scenes.length} scenes · ${totalDuration}s total`}
              action={<EditButton onClick={() => edit('scenes')} />}
            />
            <ol className="divide-y divide-slate-200 dark:divide-slate-800">
              {project.scenes.map((s, i) => (
                <li key={s.id} className="flex gap-4 px-5 py-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{s.description || 'Untitled scene'}</p>
                    <p className="text-slate-500 dark:text-slate-400">{s.visual}</p>
                  </div>
                  <span className="shrink-0 tabular-nums text-slate-500">{s.duration}s</span>
                </li>
              ))}
              {project.scenes.length === 0 && <li className="px-5 py-4 text-sm text-slate-500">No scenes planned yet.</li>}
            </ol>
          </Card>
        )}

        {has('caption') && (
          <Card>
            <CardHeader
              icon={<MessageSquareText className="h-4 w-4" />}
              title="Caption"
              action={<EditButton onClick={() => edit('caption')} />}
            />
            <CardBody>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {project.caption || <span className="text-slate-400">No caption yet.</span>}
              </p>
            </CardBody>
          </Card>
        )}

        {has('hashtags') && (
          <Card>
            <CardHeader
              icon={<Hash className="h-4 w-4" />}
              title="Hashtags"
              action={<EditButton onClick={() => edit('caption')} />}
            />
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {project.hashtags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                  >
                    {t}
                  </span>
                ))}
                {project.hashtags.length === 0 && <span className="text-sm text-slate-400">No hashtags yet.</span>}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <StepFooter onBack={goBack}>
        <Button size="lg" variant="success" onClick={handleReady} icon={<Rocket className="h-4 w-4" />}>
          Ready to Publish
        </Button>
      </StepFooter>
    </div>
  );
}

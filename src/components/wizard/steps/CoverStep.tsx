import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Download, ImageIcon, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { CoverPreview } from '@/components/wizard/CoverPreview';
import { StepFooter, StepIntro } from '@/components/wizard/StepFooter';
import { VideoFilePicker } from '@/components/wizard/VideoFilePicker';
import type { StepProps } from '@/components/wizard/types';
import { useVideoPicker } from '@/hooks/useVideoPicker';
import { captureCoverPreview, captureFullCover } from '@/lib/videoFile';
import { formatSeconds } from '@/lib/utils';

const NUDGE_SECONDS = 0.5;

/** m:ss.t, for scrubbing precision. */
function formatTimestamp(t: number) {
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(1).padStart(4, '0');
  return `${m}:${s}`;
}

function seekAndWait(video: HTMLVideoElement, t: number) {
  return new Promise<void>((resolve) => {
    const done = () => {
      video.removeEventListener('seeked', done);
      resolve();
    };
    video.addEventListener('seeked', done);
    video.currentTime = t;
  });
}

export function CoverStep({ project, update, goNext, goBack }: StepProps) {
  const { session, reading, error, pick } = useVideoPicker(project, update);
  const video = project.video ?? null;
  const duration = video?.duration_seconds ?? 0;
  const videoRef = useRef<HTMLVideoElement>(null);

  const initialTime = () => video?.cover_time_seconds ?? Math.min(1, duration / 2);
  const [time, setTime] = useState(initialTime);
  const [ready, setReady] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [frameError, setFrameError] = useState(false);

  const canScrub = !!session && !!video?.playable && !frameError;

  // A newly chosen file starts fresh.
  useEffect(() => {
    setReady(false);
    setFrameError(false);
    setTime(initialTime());
  }, [session?.url]);

  const seekTo = (t: number) => {
    const clamped = Math.max(0, Math.min(Math.max(0, duration - 0.05), t));
    setTime(clamped);
    const v = videoRef.current;
    if (v && ready) {
      setSeeking(true);
      v.currentTime = clamped;
    }
  };

  const useFrame = () => {
    const v = videoRef.current;
    if (!v || !video) return;
    update({
      video: { ...video, cover_image: captureCoverPreview(v), cover_time_seconds: Math.round(time * 10) / 10 },
    });
  };

  const saveFullSize = async () => {
    const v = videoRef.current;
    if (!v || !video || video.cover_time_seconds == null) return;
    setSaving(true);
    try {
      if (Math.abs(v.currentTime - video.cover_time_seconds) > 0.05) {
        setTime(video.cover_time_seconds);
        await seekAndWait(v, video.cover_time_seconds);
      }
      const blob = await captureFullCover(v, video.cover_text);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reel-cover.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setSaving(false);
    }
  };

  const coverTime = video?.cover_time_seconds;

  return (
    <div>
      <StepIntro
        title="Pick a cover"
        description="The cover is what people see on your profile before they tap. Pick a moment that shows what the video is about."
      />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Frame picker, or why it isn't available */}
        <section aria-label="Choose a frame" className="min-w-0">
          {canScrub && session ? (
            <div>
              <div className="mx-auto w-full max-w-[15rem]">
                <CoverPreview text={video?.cover_text} label="Video frame" className="w-full">
                  <video
                    key={session.url}
                    ref={videoRef}
                    src={session.url}
                    muted
                    playsInline
                    preload="auto"
                    className="h-full w-full object-contain"
                    onLoadedData={(e) => {
                      setReady(true);
                      setSeeking(true);
                      e.currentTarget.currentTime = time;
                    }}
                    onSeeked={() => setSeeking(false)}
                    onError={() => setFrameError(true)}
                  />
                </CoverPreview>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-10 shrink-0 px-0"
                  aria-label="Back a little"
                  onClick={() => seekTo(time - NUDGE_SECONDS)}
                  disabled={!ready}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0.1, duration - 0.05)}
                  step={0.04}
                  value={time}
                  disabled={!ready}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  aria-label="Moment to use as the cover"
                  aria-valuetext={formatTimestamp(time)}
                  className="h-10 min-w-0 flex-1 cursor-pointer accent-brand-600"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-10 shrink-0 px-0"
                  aria-label="Forward a little"
                  onClick={() => seekTo(time + NUDGE_SECONDS)}
                  disabled={!ready}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-center text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {formatTimestamp(time)} of {formatTimestamp(duration)}
              </p>

              <Button className="mt-4 w-full" onClick={useFrame} disabled={!ready || seeking} icon={<ImageIcon className="h-4 w-4" />}>
                Use this frame
              </Button>
            </div>
          ) : video && (!video.playable || frameError) ? (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200" role="status">
              <p className="flex items-start gap-2 font-medium">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> Your browser can't show this video, so you can't pick a frame here.
              </p>
              <p className="mt-1 pl-6">
                That's OK. When you post on Instagram, tap "Edit cover" and slide to the moment you want.
              </p>
            </div>
          ) : (
            <Card className="p-4 sm:p-5">
              <p className="font-medium text-slate-900 dark:text-white">Your video isn't open right now.</p>
              <p className="mb-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose your video again to change the cover. It stays on your device.
              </p>
              <VideoFilePicker onPick={pick} reading={reading} error={error} label="Choose your video again" compact />
            </Card>
          )}
        </section>

        {/* The chosen cover */}
        <section aria-label="Your cover" className="min-w-0">
          <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">Your cover</h3>
          {video?.cover_image ? (
            <div className="flex gap-4">
              <CoverPreview src={video.cover_image} text={video.cover_text} className="w-28 shrink-0 sm:w-32" label="Your cover" />
              <div className="min-w-0 text-sm text-slate-600 dark:text-slate-300">
                <p>
                  From <strong className="tabular-nums">{formatSeconds(coverTime ?? 0)}</strong> in your video.
                </p>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  When you post, tap "Edit cover" and slide to {formatSeconds(coverTime ?? 0)}. Or, if you saved the full-size
                  cover, choose it from your camera roll there.
                </p>
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No cover picked yet. {canScrub ? 'Slide to a moment you like and tap "Use this frame".' : 'You can pick it in Instagram instead.'}
            </p>
          )}

          {video?.playable && (
            <div className="mt-5">
              <Field label="Cover text (optional)" hint="A few words that make people tap, e.g. “Wait for her reaction”.">
                {(id) => (
                  <Input
                    id={id}
                    value={video.cover_text}
                    maxLength={50}
                    placeholder="e.g. Wait for her reaction"
                    onChange={(e) => update({ video: { ...video, cover_text: e.target.value } })}
                  />
                )}
              </Field>
            </div>
          )}

          {video?.cover_image && (
            <div className="mt-5">
              {canScrub ? (
                <>
                  <Button variant="secondary" onClick={saveFullSize} loading={saving} icon={<Download className="h-4 w-4" />}>
                    Save full-size cover
                  </Button>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Saves the frame at full quality{video.cover_text.trim() ? ', with your cover text' : ''}, so you can choose it in
                    Instagram.
                  </p>
                </>
              ) : (
                video.playable && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">To save a full-size cover, choose your video again.</p>
                )
              )}
            </div>
          )}
        </section>
      </div>

      <StepFooter onBack={goBack}>
        {!video?.cover_image && (
          <span className="text-center text-xs text-slate-500 sm:text-right">You can skip this and pick the cover in Instagram.</span>
        )}
        <Button size="lg" onClick={goNext} iconRight={<ArrowRight className="h-4 w-4" />}>
          Continue to Review
        </Button>
      </StepFooter>
    </div>
  );
}

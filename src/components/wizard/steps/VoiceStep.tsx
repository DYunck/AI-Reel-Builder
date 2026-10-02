import { useEffect, useRef, useState } from 'react';
import { ArrowRight, AudioLines, Mic, Pause, Pencil, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Select } from '@/components/ui/Field';
import { StepFooter, StepIntro } from '@/components/wizard/StepFooter';
import type { StepProps } from '@/components/wizard/types';
import { generateVoice } from '@/lib/contentGenerator';
import { VOICES } from '@/data/options';
import { cn, formatRelative, formatSeconds, fullScript } from '@/lib/utils';

const BAR_COUNT = 48;
// Deterministic pseudo-waveform so it looks the same on every render.
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => 0.25 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)) * 0.75);

const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function VoiceStep({ project, update, goTo }: StepProps) {
  const text = fullScript(project.script);
  const [voiceId, setVoiceId] = useState(project.voice?.voice_id ?? VOICES[0].id);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const voice = project.voice;
  const voiceChanged = voice && voice.voice_id !== voiceId;

  const stop = () => {
    if (speechSupported) window.speechSynthesis.cancel();
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
    setPlaying(false);
  };

  useEffect(() => stop, []);

  const handleGenerate = async () => {
    stop();
    setGenerating(true);
    try {
      const result = await generateVoice(text, voiceId);
      update({ voice: result, checklist: { ...project.checklist, voice: true } });
      setProgress(0);
    } finally {
      setGenerating(false);
    }
  };

  const handlePlay = () => {
    if (!voice) return;
    if (playing) return stop();

    const preset = VOICES.find((v) => v.id === voice.voice_id) ?? VOICES[0];
    const durationMs = voice.duration_seconds * 1000;
    const start = Date.now() - (progress >= 1 ? 0 : progress * durationMs);
    setPlaying(true);

    // Preview uses the browser's built-in voice. A real TTS service would return an audio file instead.
    if (speechSupported) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = preset.pitch;
      utterance.rate = preset.rate;
      utterance.onend = () => {
        stop();
        setProgress(1);
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }

    tick.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / durationMs);
      setProgress(p);
      if (p >= 1 && !speechSupported) stop();
    }, 100);
  };

  return (
    <div>
      <StepIntro title="Create your voiceover" description="Pick a voice and we'll turn your script into narration." />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Script</span>
            <Button variant="ghost" size="sm" onClick={() => goTo(2)} icon={<Pencil className="h-3.5 w-3.5" />}>
              Edit
            </Button>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {project.script ? (
              <>
                <p className="font-semibold text-slate-900 dark:text-white">{project.script.hook}</p>
                <p className="whitespace-pre-line">{project.script.body}</p>
                <p className="font-medium text-brand-700 dark:text-brand-300">{project.script.cta}</p>
              </>
            ) : (
              <p className="text-slate-400">No script yet. Go back to step 1 to generate one.</p>
            )}
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Field label="Voice" hint="You can try different voices. Only the last one generated is kept.">
            {(id) => (
              <Select id={id} value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {v.description}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            loading={generating}
            disabled={!text}
            icon={voice ? <RefreshCw className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          >
            {generating ? 'Generating voice…' : voice ? (voiceChanged ? 'Generate with new voice' : 'Regenerate Voice') : 'Generate Voice'}
          </Button>
        </div>
      </div>

      {/* Audio preview */}
      <Card className="mt-6 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <AudioLines className="h-4 w-4 text-brand-500" /> Audio Preview
        </div>

        {generating ? (
          <div className="flex h-20 items-center justify-center gap-1" aria-live="polite">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="h-12 w-1.5 origin-center animate-wave rounded-full bg-brand-400"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
            <span className="sr-only">Generating voice</span>
          </div>
        ) : voice ? (
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlay}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-md transition-transform hover:scale-105 dark:bg-brand-500"
              aria-label={playing ? 'Pause preview' : 'Play preview'}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex h-12 items-center gap-[3px]" aria-hidden>
                {BARS.map((h, i) => (
                  <span
                    key={i}
                    className={cn(
                      'flex-1 rounded-full transition-colors',
                      i / BAR_COUNT < progress ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700',
                    )}
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {formatSeconds(progress * voice.duration_seconds)} / {formatSeconds(voice.duration_seconds)}
                </span>
                <span>
                  {VOICES.find((v) => v.id === voice.voice_id)?.name ?? voice.voice_id} · generated {formatRelative(voice.generated_at)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="flex h-20 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Your voiceover will appear here.
          </p>
        )}

        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          Demo: voice generation is simulated, and the preview is read aloud by your browser's built-in voice.
        </p>
      </Card>

      <StepFooter onBack={() => goTo(2)}>
        {!voice && (
          <Button variant="ghost" onClick={() => goTo(4)}>
            Skip, I'll record my own
          </Button>
        )}
        <Button size="lg" onClick={() => goTo(4)} disabled={!voice} iconRight={<ArrowRight className="h-4 w-4" />}>
          Continue to Scenes
        </Button>
      </StepFooter>
    </div>
  );
}

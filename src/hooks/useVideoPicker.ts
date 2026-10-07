import { useCallback, useRef, useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { isLikelyVideo, probeVideo } from '@/lib/videoFile';
import { clearSessionVideo, getSessionVideo, setSessionVideo } from '@/lib/videoSession';
import type { Project, ProjectInput, VideoInfo } from '@/types/project';

export const NOT_A_VIDEO_MESSAGE =
  "That file doesn't look like a video. Choose a video from your camera roll or files (for example .mp4 or .mov).";

/** The `length` column allows 5-180 seconds; the real duration lives in video.duration_seconds. */
export function lengthFromDuration(seconds: number) {
  return Math.min(180, Math.max(5, Math.round(seconds)));
}

/**
 * Picks the owner's video, reads it in the browser and saves its details.
 * Choosing the same file again (same name and size) keeps the chosen cover;
 * a different file asks first if a cover would be lost.
 */
export function useVideoPicker(project: Project, update: (patch: ProjectInput) => void) {
  const confirm = useConfirm();
  const [session, setSession] = useState(() => getSessionVideo(project.id));
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestPick = useRef(0);

  const pick = useCallback(
    async (file: File) => {
      setError(null);
      if (!isLikelyVideo(file)) {
        setError(NOT_A_VIDEO_MESSAGE);
        return;
      }

      const prev = project.video ?? null;
      const sameFile = !!prev && prev.file_name === file.name && prev.size_bytes === file.size;
      if (prev && !sameFile && prev.cover_image) {
        const ok = await confirm({
          title: 'Use this video instead?',
          message: "It's a different video from the one you checked before. We'll check the new one, and you'll pick a new cover.",
          confirmLabel: 'Use this video',
        });
        if (!ok) return;
      }

      const pickId = ++latestPick.current;
      setReading(true);
      const entry = setSessionVideo(project.id, file);
      setSession(entry);

      const probe = await probeVideo(entry.url);
      if (pickId !== latestPick.current) return; // A newer file was picked meanwhile.

      if (!probe.playable) {
        // Nothing to show from this file, so let it go.
        clearSessionVideo(project.id);
        setSession(undefined);
      }

      const duration = probe.duration ?? (sameFile ? (prev?.duration_seconds ?? 0) : 0);
      const info: VideoInfo = {
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        duration_seconds: Math.round(duration * 10) / 10,
        width: probe.width,
        height: probe.height,
        playable: probe.playable,
        cover_image: sameFile && probe.playable ? (prev?.cover_image ?? null) : null,
        cover_text: prev?.cover_text ?? '',
        cover_time_seconds: sameFile && probe.playable ? (prev?.cover_time_seconds ?? null) : null,
      };
      update({ video: info, ...(duration > 0 ? { length: lengthFromDuration(duration) } : {}) });
      setReading(false);
    },
    [project.id, project.video, confirm, update],
  );

  return { session, reading, error, pick };
}

/**
 * Reading the owner's own video in the browser. Nothing here uploads anything:
 * the file is opened through an object URL and only its details are kept.
 */

/**
 * Longest Reel Instagram accepts, in seconds.
 * Check this against Instagram's current rules before relying on it: the limit has
 * changed several times (it was 3 minutes when this was written, in 2026).
 */
export const INSTAGRAM_REEL_MAX_SECONDS = 180;

/** Below this many pixels on the shorter side, a Reel may look blurry. */
export const MIN_SHORT_SIDE_PX = 720;

/** How long to wait for the browser to read a video before giving up. */
export const PROBE_TIMEOUT_MS = 10_000;

/** Cover preview size kept in storage: small enough for localStorage. */
export const COVER_PREVIEW_WIDTH = 360;
export const COVER_PREVIEW_QUALITY = 0.7;

const VIDEO_EXTENSIONS = /\.(mp4|m4v|mov|qt|webm|mkv|avi|3gp|3g2|hevc|mpg|mpeg|wmv)$/i;

/** Some phones and browsers send an empty MIME type, so fall back to the extension. */
export function isLikelyVideo(file: File): boolean {
  if (file.type) return file.type.startsWith('video/');
  return VIDEO_EXTENSIONS.test(file.name);
}

export interface VideoProbe {
  /** True when the browser can show the video's picture (needed for the cover picker). */
  playable: boolean;
  width: number | null;
  height: number | null;
  /** Seconds, or null when the browser couldn't tell. */
  duration: number | null;
}

/**
 * Reads duration and size from a video URL. Never rejects and never hangs:
 * files the browser can't play resolve with `playable: false` (and a duration if
 * one was readable) once an error fires or PROBE_TIMEOUT_MS passes.
 */
export function probeVideo(url: string, timeoutMs = PROBE_TIMEOUT_MS): Promise<VideoProbe> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    let duration: number | null = null;
    let done = false;

    const finish = (result: VideoProbe) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      video.removeAttribute('src');
      video.load(); // Release the decoder.
      resolve(result);
    };

    const readDuration = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) duration = video.duration;
    };

    const timer = setTimeout(() => {
      readDuration();
      finish({ playable: false, width: null, height: null, duration });
    }, timeoutMs);

    video.onerror = () => finish({ playable: false, width: null, height: null, duration });

    video.onloadedmetadata = () => {
      readDuration();
      if (duration === null) {
        // Some files (e.g. browser recordings) report Infinity until we seek to the end.
        video.currentTime = Number.MAX_SAFE_INTEGER;
      }
    };

    video.ondurationchange = readDuration;

    // A decoded frame proves the picture is usable, not just the container.
    video.onloadeddata = () => {
      readDuration();
      if (!video.videoWidth || !video.videoHeight) {
        finish({ playable: false, width: null, height: null, duration });
        return;
      }
      if (duration === null) return; // Wait for durationchange after the seek above.
      finish({ playable: true, width: video.videoWidth, height: video.videoHeight, duration });
    };

    video.onseeked = () => {
      readDuration();
      if (duration !== null && video.videoWidth && video.readyState >= 2) {
        finish({ playable: true, width: video.videoWidth, height: video.videoHeight, duration });
      }
    };

    video.src = url;
  });
}

// ---------------------------------------------------------------------------
// Checks shown to the owner
// ---------------------------------------------------------------------------

export type CheckLevel = 'ok' | 'note' | 'warn' | 'unknown';

export interface VideoCheck {
  id: 'shape' | 'length' | 'quality';
  level: CheckLevel;
  title: string;
  detail: string;
}

const FIX_SHAPE_TIP =
  'To fix it, open the video in CapCut or Instagram Edits, set the format (canvas) to 9:16, then save it again.';

export function checkShape(width: number | null, height: number | null): VideoCheck {
  if (!width || !height) {
    return {
      id: 'shape',
      level: 'unknown',
      title: "We couldn't check the shape",
      detail: 'Reels look best vertical (taller than wide). Check it on your phone before posting.',
    };
  }
  const ratio = width / height;
  if (height > width && Math.abs(ratio - 9 / 16) < 0.03) {
    return { id: 'shape', level: 'ok', title: 'Vertical 9:16, perfect for Reels', detail: '' };
  }
  if (height > width) {
    return {
      id: 'shape',
      level: 'note',
      title: 'Vertical, but not quite 9:16',
      detail: 'Instagram will crop the edges a little to fill the screen. Keep anything important near the middle.',
    };
  }
  if (ratio <= 1.1) {
    return {
      id: 'shape',
      level: 'warn',
      title: 'This video is square',
      detail: `Reels fill a tall phone screen, so a square video shows with big empty bars. ${FIX_SHAPE_TIP}`,
    };
  }
  return {
    id: 'shape',
    level: 'warn',
    title: 'This video is sideways (horizontal)',
    detail: `Reels are vertical, so a sideways video shows small with big empty bars. ${FIX_SHAPE_TIP}`,
  };
}

export function checkLength(seconds: number | null): VideoCheck {
  if (!seconds) {
    return { id: 'length', level: 'unknown', title: "We couldn't read the length", detail: '' };
  }
  const limitMinutes = INSTAGRAM_REEL_MAX_SECONDS / 60;
  if (seconds > INSTAGRAM_REEL_MAX_SECONDS) {
    return {
      id: 'length',
      level: 'warn',
      title: `Longer than Instagram's ${limitMinutes}-minute Reel limit`,
      detail: 'Trim it in CapCut or Instagram Edits first. Shorter Reels usually get watched to the end more often too.',
    };
  }
  return {
    id: 'length',
    level: 'ok',
    title: `Length is fine (Reels can be up to ${limitMinutes} minutes)`,
    detail: seconds > 90 ? 'Tip: Reels under 90 seconds are often watched to the end more.' : '',
  };
}

export function checkQuality(width: number | null, height: number | null): VideoCheck {
  if (!width || !height) {
    return { id: 'quality', level: 'unknown', title: "We couldn't check the quality", detail: '' };
  }
  const shortSide = Math.min(width, height);
  if (shortSide < MIN_SHORT_SIDE_PX) {
    return {
      id: 'quality',
      level: 'warn',
      title: 'Low resolution, it may look blurry',
      detail: `This video is ${width} × ${height}. If you can, use the original from your camera (1080 × 1920 is ideal).`,
    };
  }
  return { id: 'quality', level: 'ok', title: `Good quality (${width} × ${height})`, detail: '' };
}

export function runVideoChecks(info: { width: number | null; height: number | null; duration_seconds: number }) {
  return [checkShape(info.width, info.height), checkLength(info.duration_seconds), checkQuality(info.width, info.height)];
}

// ---------------------------------------------------------------------------
// Cover frames
// ---------------------------------------------------------------------------

/**
 * Draws cover text the way the preview overlay shows it: bold white text on a
 * dark rounded band, a little below the middle. Long text wraps onto up to 3 lines.
 */
export function drawCoverText(ctx: CanvasRenderingContext2D, text: string, width: number, height: number) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const fontSize = Math.round(width * 0.075);
  ctx.font = `800 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxLineWidth = width * 0.8;
  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxLineWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  const shown = lines.slice(0, 3);

  const lineHeight = fontSize * 1.25;
  const padX = fontSize * 0.6;
  const padY = fontSize * 0.45;
  const boxWidth = Math.min(width * 0.92, Math.max(...shown.map((l) => ctx.measureText(l).width)) + padX * 2);
  const boxHeight = shown.length * lineHeight + padY * 2;
  const centerY = height * 0.62;
  const x = (width - boxWidth) / 2;
  const y = centerY - boxHeight / 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  const r = fontSize * 0.4;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + boxWidth, y, x + boxWidth, y + boxHeight, r);
  ctx.arcTo(x + boxWidth, y + boxHeight, x, y + boxHeight, r);
  ctx.arcTo(x, y + boxHeight, x, y, r);
  ctx.arcTo(x, y, x + boxWidth, y, r);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  shown.forEach((l, i) => ctx.fillText(l, width / 2, y + padY + lineHeight * (i + 0.5)));
}

function frameCanvas(video: HTMLVideoElement, targetWidth: number) {
  const scale = Math.min(1, targetWidth / video.videoWidth);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

/** The current frame as a small JPEG data URL, without text (the preview overlays it). */
export function captureCoverPreview(video: HTMLVideoElement): string {
  const { canvas } = frameCanvas(video, COVER_PREVIEW_WIDTH);
  return canvas.toDataURL('image/jpeg', COVER_PREVIEW_QUALITY);
}

/** The current frame at full resolution with cover text drawn in, ready to save to the phone. */
export function captureFullCover(video: HTMLVideoElement, text: string): Promise<Blob> {
  const { canvas, ctx } = frameCanvas(video, video.videoWidth);
  drawCoverText(ctx, text, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create image'))), 'image/jpeg', 0.92),
  );
}

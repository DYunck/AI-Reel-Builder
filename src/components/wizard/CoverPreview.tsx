import type { CSSProperties, ReactNode } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A 9:16 frame with optional cover text, styled to match drawCoverText() in
 * lib/videoFile.ts (bold white text on a dark band, a little below the middle).
 * Pass an image `src`, or `children` (e.g. a live <video>) to fill the frame.
 * Set the width with `className` (e.g. `w-24` or `w-full`); the height follows.
 */
export function CoverPreview({
  src,
  text,
  className,
  children,
  label = 'Cover preview',
}: {
  src?: string | null;
  text?: string;
  className?: string;
  children?: ReactNode;
  label?: string;
}) {
  // Container query units keep the text proportional to the frame at any size.
  const frameStyle: CSSProperties = { containerType: 'inline-size' };
  return (
    <div
      className={cn('relative aspect-[9/16] overflow-hidden rounded-xl bg-slate-950', className)}
      style={frameStyle}
      role="img"
      aria-label={text ? `${label}: ${text}` : label}
    >
      {children ??
        (src ? (
          <img src={src} alt="" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-500">
            <ImageOff className="h-6 w-6" />
            <span className="text-xs">No cover yet</span>
          </div>
        ))}
      {text?.trim() && (
        <div className="pointer-events-none absolute inset-x-0 top-[62%] flex -translate-y-1/2 justify-center px-[4%]">
          <span
            className="line-clamp-3 rounded-[3cqw] bg-black/55 px-[4.5cqw] py-[3.4cqw] text-center font-extrabold leading-tight text-white"
            style={{ fontSize: '7.5cqw', maxWidth: '92%' }}
          >
            {text.trim()}
          </span>
        </div>
      )}
    </div>
  );
}

import { FileVideoIcon, SparklesIcon } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { mediaUrl } from "../lib/media";
import { onSeek } from "../replay/seek";

export interface VideoStageHandle {
  el: HTMLVideoElement | null;
}

// The center "stage": the source video is the hero (matches the console's
// video-stage layout). Citation clicks in the chat seek it via `ambient:seek`.
export const VideoStage = forwardRef<
  VideoStageHandle,
  { sourceKey: string | null; posterKey: string | null; title: string }
>(function VideoStage({ sourceKey, posterKey, title }, ref) {
  const vref = useRef<HTMLVideoElement>(null);
  const [flash, setFlash] = useState(false);
  const src = mediaUrl(sourceKey);
  const poster = mediaUrl(posterKey) ?? undefined;

  useImperativeHandle(ref, () => ({ el: vref.current }), []);

  useEffect(
    () =>
      onSeek((seconds) => {
        const v = vref.current;
        if (!v) return;
        v.currentTime = Math.max(0, seconds);
        v.play().catch(() => {});
        setFlash(true);
        setTimeout(() => setFlash(false), 700);
      }),
    []
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl shrink-0 flex-col gap-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border bg-black shadow-[var(--shadow-float)] transition-shadow",
          flash && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        {src ? (
          // biome-ignore lint: static replay asset
          <video
            className="aspect-video w-full"
            controls
            key={src}
            poster={poster}
            preload="metadata"
            ref={vref}
            src={src}
          >
            <track kind="captions" />
          </video>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center p-6 text-center text-white/60 text-sm">
            Source video unavailable
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-1">
        <FileVideoIcon className="size-4 shrink-0 text-muted-foreground" />
        <h1 className="truncate font-semibold text-base" title={title}>
          {title}
        </h1>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs">
          <SparklesIcon className="size-3" /> replay
        </span>
      </div>
    </div>
  );
});

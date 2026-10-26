import { CropIcon, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn, formatClock } from "../lib/utils";
import { emitSeek } from "../replay/seek";
import type { Marker } from "../replay/markers";

// A custom "what the agent looked at" track under the video: focus_clip ranges
// as bands, grab_frames as ticks. The marker the replay is currently on is
// highlighted; clicking any marker (or the track) seeks the player. A live
// playhead follows the video's currentTime.
export function ActivityTimeline({
  markers,
  durationSec,
  activeToolId,
  getVideo,
}: {
  markers: Marker[];
  durationSec: number;
  activeToolId: string | null;
  getVideo: () => HTMLVideoElement | null;
}) {
  const [head, setHead] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Follow the video's currentTime with a light rAF loop while mounted.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = getVideo();
      if (v && durationSec > 0) setHead(v.currentTime / durationSec);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [getVideo, durationSec]);

  if (!durationSec || markers.length === 0) return null;
  const pct = (s: number) => `${Math.min(100, Math.max(0, (s / durationSec) * 100))}%`;

  const seekToFraction = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    emitSeek(((clientX - r.left) / r.width) * durationSec);
  };

  return (
    <div className="flex flex-col gap-1.5 px-1">
      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <span className="font-medium">What the agent looked at</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <CropIcon className="size-3" /> clip
          </span>
          <span className="flex items-center gap-1">
            <ImageIcon className="size-3" /> frame
          </span>
        </span>
      </div>

      <div
        ref={trackRef}
        onClick={(e) => seekToFraction(e.clientX)}
        className="relative h-9 w-full cursor-pointer overflow-hidden rounded-lg border bg-muted/40"
        title="Click to seek"
      >
        {/* range bands (focus_clip / search_clip) */}
        {markers
          .filter((m) => m.kind === "range")
          .map((m) => {
            const active = m.id === activeToolId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  emitSeek(m.start);
                }}
                title={`${m.tool} · ${formatClock(m.start)}–${formatClock(m.end)}`}
                className={cn(
                  "absolute top-1 bottom-1 rounded-md border transition-colors",
                  active
                    ? "z-10 border-primary bg-primary/40 ring-2 ring-primary"
                    : "border-primary/30 bg-primary/15 hover:bg-primary/25"
                )}
                style={{ left: pct(m.start), width: `calc(${pct(m.end - m.start)} + 2px)` }}
              />
            );
          })}

        {/* point ticks (grab_frames) */}
        {markers
          .filter((m) => m.kind === "point")
          .map((m) => {
            const active = m.id === activeToolId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  emitSeek(m.start);
                }}
                title={`${m.tool} · ${formatClock(m.start)}`}
                className={cn(
                  "-translate-x-1/2 absolute top-0.5 bottom-0.5 w-[3px] rounded-full transition-colors",
                  active
                    ? "z-10 bg-primary ring-2 ring-primary/40"
                    : "bg-foreground/35 hover:bg-foreground/60"
                )}
                style={{ left: pct(m.start) }}
              />
            );
          })}

        {/* live playhead */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-20 w-px bg-primary"
          style={{ left: pct(head * durationSec) }}
        >
          <div className="-translate-x-1/2 -top-0.5 absolute size-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

import {
  GaugeIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SkipForwardIcon,
} from "lucide-react";
import { cn } from "../lib/utils";

const SPEEDS = [1, 2, 4, 8];

// Playback transport for the replay: play/pause, restart, skip-to-end, a
// scrubber, and a speed cycle. Styled to sit under the chat like a media bar.
export function Controls({
  playing,
  done,
  progress,
  speed,
  onToggle,
  onRestart,
  onSkip,
  onSeek,
  onCycleSpeed,
}: {
  playing: boolean;
  done: boolean;
  progress: number;
  speed: number;
  onToggle: () => void;
  onRestart: () => void;
  onSkip: () => void;
  onSeek: (fraction: number) => void;
  onCycleSpeed: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card/70 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur">
      <button
        type="button"
        onClick={onToggle}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
        title={playing ? "Pause" : done ? "Replay" : "Play"}
      >
        {playing ? (
          <PauseIcon className="size-4" />
        ) : done ? (
          <RotateCcwIcon className="size-4" />
        ) : (
          <PlayIcon className="size-4 translate-x-px" />
        )}
      </button>

      <button
        type="button"
        onClick={onRestart}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        title="Restart"
      >
        <RotateCcwIcon className="size-4" />
      </button>

      <input
        type="range"
        min={0}
        max={1000}
        value={Math.round(progress * 1000)}
        onChange={(e) => onSeek(Number(e.target.value) / 1000)}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        aria-label="Seek replay"
      />

      <button
        type="button"
        onClick={onCycleSpeed}
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-medium text-xs",
          "bg-muted text-muted-foreground hover:bg-muted/70"
        )}
        title="Playback speed"
      >
        <GaugeIcon className="size-3.5" />
        {speed}×
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        title="Skip to end"
      >
        <SkipForwardIcon className="size-4" />
      </button>
    </div>
  );
}

export function nextSpeed(current: number): number {
  const i = SPEEDS.indexOf(current);
  return SPEEDS[(i + 1) % SPEEDS.length];
}

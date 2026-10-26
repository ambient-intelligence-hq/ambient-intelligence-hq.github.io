import { cn } from "../lib/utils";
import markSrc from "../assets/ambient-mark.jpg";

// The Ambient brand mark in a rounded, ring-framed chip — the assistant's
// identity (message avatars + headers), same asset as the Studio console.
export function AmbientMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background ring-1 ring-border/70",
        className
      )}
    >
      <img
        alt="Ambient"
        className="size-full object-cover"
        draggable={false}
        src={markSrc}
      />
    </div>
  );
}

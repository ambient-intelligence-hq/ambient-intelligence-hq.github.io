import { ArrowLeftIcon, CoinsIcon, CpuIcon, SparklesIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "../lib/utils";
import { useEngine } from "../replay/useEngine";
import { extractMarkers } from "../replay/markers";
import { OUTCOMES } from "../replay/outcomes";
import type { Fixture } from "../replay/types";
import { ActivityTimeline } from "./ActivityTimeline";
import { Artifacts } from "./Artifacts";
import { AmbientMark } from "./AmbientMark";
import { Controls, nextSpeed } from "./Controls";
import { MessageView } from "./MessageView";
import { VideoStage, type VideoStageHandle } from "./VideoStage";

export function ReplayView({ fixture }: { fixture: Fixture }) {
  const { engine, state } = useEngine(fixture);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const videoRef = useRef<VideoStageHandle>(null);
  const markers = useMemo(() => extractMarkers(fixture), [fixture]);
  const outcome = OUTCOMES[fixture.slug];

  // Follow the stream unless the viewer has scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && pinnedRef.current) el.scrollTop = el.scrollHeight;
  });

  const usage = (state.usage ?? fixture.usage) as Record<string, any>;
  const totalTokens = usage?.total_tokens as number | undefined;
  const cost = usage?.cost as number | undefined;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b bg-background/80 px-4 py-2.5 backdrop-blur">
        <a
          href="?"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-muted-foreground text-sm hover:bg-muted"
        >
          <ArrowLeftIcon className="size-4" /> Gallery
        </a>
        <div className="flex items-center gap-2">
          <AmbientMark className="size-6" />
          <span className="font-display font-bold text-sm">{fixture.title}</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-muted-foreground text-xs">
          {fixture.model && (
            <span className="hidden items-center gap-1 sm:flex" title="Agent model">
              <CpuIcon className="size-3.5" />
              <span className="max-w-[18ch] truncate">{fixture.model}</span>
            </span>
          )}
          {typeof totalTokens === "number" && totalTokens > 0 && (
            <span className="flex items-center gap-1" title="Tokens used">
              <CoinsIcon className="size-3.5" />
              {totalTokens.toLocaleString()} tok
              {typeof cost === "number" && cost > 0 ? ` · $${cost.toFixed(3)}` : ""}
            </span>
          )}
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
            read-only replay
          </span>
        </div>
      </header>

      {/* Body: chat left, sticky video right (stacks on small screens) */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_minmax(380px,44%)]">
        <div ref={scrollRef} className="order-2 min-h-0 overflow-y-auto lg:order-1">
          <div
            className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6"
            onWheel={() => {
              const el = scrollRef.current;
              if (el)
                pinnedRef.current =
                  el.scrollHeight - el.scrollTop - el.clientHeight < 120;
            }}
          >
            {state.messages.map((m) => (
              <MessageView key={m.id} msg={m} rev={m.rev} />
            ))}
            {state.messages.length === 0 && (
              <p className="text-muted-foreground text-sm">Starting replay…</p>
            )}
            {state.done && outcome && (
              <div className="replay-in flex gap-3">
                <AmbientMark className="mt-0.5 size-6 shrink-0" />
                <div className="flex-1 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <div className="mb-1 flex items-center gap-1.5 font-medium text-primary text-xs uppercase tracking-wide">
                    <SparklesIcon className="size-3.5" /> Outcome
                  </div>
                  <p className="text-[13px] leading-[1.6]">{outcome}</p>
                  <Artifacts artifacts={fixture.artifacts} />
                </div>
              </div>
            )}
            <div className="h-2" />
          </div>
        </div>

        <aside className="order-1 flex min-h-0 flex-col gap-4 border-b bg-muted/20 p-4 lg:order-2 lg:border-b-0 lg:border-l">
          <div className="lg:sticky lg:top-4 flex flex-col gap-4">
            <VideoStage
              posterKey={fixture.media.poster}
              ref={videoRef}
              sourceKey={fixture.media.source}
              title={fixture.title}
            />
            <ActivityTimeline
              activeToolId={state.currentToolId}
              durationSec={fixture.durationSec}
              getVideo={() => videoRef.current?.el ?? null}
              markers={markers}
            />
            <Controls
              done={state.done}
              onCycleSpeed={() => engine.setSpeed(nextSpeed(state.speed))}
              onRestart={() => engine.restart()}
              onSeek={(f) => engine.seek(f)}
              onSkip={() => engine.skipToEnd()}
              onToggle={() => engine.toggle()}
              playing={state.playing}
              progress={state.progress}
              speed={state.speed}
            />
            <p className={cn("px-1 text-muted-foreground text-xs leading-relaxed")}>
              {fixture.summary} Click any timestamp in the answer to jump the video.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

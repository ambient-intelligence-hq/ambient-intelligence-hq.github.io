import { memo } from "react";
import { cn, sanitizeText } from "../lib/utils";
import { linkifyArtifacts } from "../lib/media";
import { linkifyTimestamps } from "../replay/seek";
import type { Msg } from "../replay/types";
import { Markdown } from "./Markdown";
import { JsonAnswer, tryParseJsonAnswer } from "./JsonAnswer";
import { Reasoning } from "./Reasoning";
import { ToolCard } from "./ToolCard";
import { AmbientMark } from "./AmbientMark";

// One chat message. Memoised on (id, rev) so finished messages don't re-render
// while the active message streams — keeps long transcripts smooth.
// `rev` is passed as a separate scalar prop (not read off `msg`) so memoisation
// works even though the engine mutates each message object in place — React
// captures the previous `rev` value, so the comparator can detect a change.
function MessageViewInner({ msg }: { msg: Msg; rev: number }) {
  if (msg.role === "user") {
    const text = msg.parts.map((p) => (p.kind === "text" ? p.text : "")).join("");
    return (
      <div className="replay-in flex justify-end">
        <div className="w-fit max-w-[min(80%,56ch)] overflow-hidden break-words rounded-2xl rounded-br-lg border border-border/30 bg-gradient-to-br from-secondary to-muted px-3.5 py-2 text-[13px] leading-[1.6] shadow-[var(--shadow-card)]">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <AmbientMark className="mt-0.5 size-6 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {msg.parts.map((part) => {
          if (part.kind === "reasoning") {
            if (!part.text.trim()) return null;
            return (
              <Reasoning key={part.id} streaming={part.streaming} text={part.text} />
            );
          }
          if (part.kind === "tool") {
            return <ToolCard key={part.id} part={part} />;
          }
          // A structured JSON answer → key/value list + raw JSON fence; a prose
          // answer → markdown with citation seeking. (While streaming, partial
          // JSON won't parse, so it shows as text until the last token lands.)
          const json = tryParseJsonAnswer(part.text);
          return (
            <div className={cn("replay-in text-[13px] leading-[1.65]")} key={part.id}>
              {json ? (
                <JsonAnswer data={json} raw={part.text} />
              ) : (
                <Markdown>
                  {linkifyArtifacts(linkifyTimestamps(sanitizeText(part.text)))}
                </Markdown>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const MessageView = memo(
  MessageViewInner,
  (a, b) => a.msg.id === b.msg.id && a.rev === b.rev
);

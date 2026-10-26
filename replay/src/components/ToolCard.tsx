import { useState } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  Loader2Icon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import type { Part } from "../replay/types";

// Engine tool call — mirrors the console's dynamic-tool rendering: a collapsible
// card with a header (icon + name + state badge), the arguments as key/value
// rows, and the result as readable preformatted text.
export function ToolCard({ part }: { part: Extract<Part, { kind: "tool" }> }) {
  const [open, setOpen] = useState(false);
  const args = Object.entries(part.input).filter(
    ([k]) => k !== "video_id" && k !== "video_path"
  );
  const running = part.state === "input-available";
  const error = part.state === "output-error";

  return (
    <div className="w-[min(100%,520px)] replay-in">
      <div className="not-prose mb-1 w-full rounded-md border bg-card/40">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
        >
          <WrenchIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="font-mono font-medium">{part.toolName}</span>
          <span
            className={cn(
              "ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
              running && "bg-muted text-muted-foreground",
              !running && !error && "bg-primary/10 text-primary",
              error && "bg-destructive/10 text-destructive"
            )}
          >
            {running ? (
              <>
                <Loader2Icon className="size-3 animate-spin" /> running
              </>
            ) : error ? (
              <>
                <XCircleIcon className="size-3" /> error
              </>
            ) : (
              <>
                <CheckCircleIcon className="size-3" /> done
              </>
            )}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        {open && (
          <div className="space-y-3 border-t px-3 py-3">
            {args.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Arguments
                </h4>
                <div className="space-y-1 rounded-md bg-muted/50 p-3">
                  {args.map(([k, v]) => (
                    <div className="flex gap-2 text-xs" key={k}>
                      <span className="shrink-0 font-medium text-muted-foreground">
                        {k}
                      </span>
                      <span className="whitespace-pre-wrap break-all font-mono">
                        {typeof v === "string" ? v : JSON.stringify(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {part.output && (
              <div className="space-y-1.5">
                <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Result
                </h4>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
                  {part.output}
                </pre>
              </div>
            )}
          </div>
        )}
        {!open && (
          <div className="flex items-center gap-1 px-3 pb-2 text-muted-foreground text-xs">
            <CircleIcon className="size-2 fill-current" />
            {args.length} arg{args.length === 1 ? "" : "s"}
            {part.output ? " · result ready" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

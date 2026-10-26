import { useState } from "react";
import { BrainIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Markdown } from "./Markdown";

// A "thinking" block — collapsible, shimmering label while streaming. Mirrors
// the console's MessageReasoning (open by default while the step streams).
export function Reasoning({
  text,
  streaming,
}: {
  text: string;
  streaming: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="replay-in w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-muted-foreground text-xs"
      >
        <BrainIcon className="size-3.5" />
        <span className={cn("font-medium", streaming && "replay-shimmer")}>
          {streaming ? "Thinking…" : "Thought process"}
        </span>
        <ChevronDownIcon
          className={cn("size-3.5 transition-transform", !open && "-rotate-90")}
        />
      </button>
      {open && (
        <div className="mt-1.5 border-muted border-l-2 pl-3 text-muted-foreground">
          <Markdown className="text-[12.5px] leading-[1.6] text-muted-foreground" seek={false}>
            {text}
          </Markdown>
        </div>
      )}
    </div>
  );
}

import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { cn } from "../lib/utils";
import { seekComponents } from "../replay/seek";

// Syntax highlighting + CJK, matching the Studio console's Streamdown plugins
// (math/mermaid omitted — the demos don't use them, and they're heavy).
const plugins = { code, cjk };

// Markdown renderer matching the Studio console's MessageResponse: Streamdown
// with the #seek-<s> link override so citation timestamps jump the player.
export function Markdown({
  children,
  className,
  seek = true,
}: {
  children: string;
  className?: string;
  seek?: boolean;
}) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none break-words dark:prose-invert",
        "prose-pre:bg-muted/60 prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none",
        className
      )}
    >
      <Streamdown components={seek ? seekComponents : undefined} plugins={plugins}>
        {children}
      </Streamdown>
    </div>
  );
}

import { DownloadIcon } from "lucide-react";
import { useState } from "react";
import { cn, formatClock } from "../lib/utils";
import { linkifyArtifacts, resolveArtifactUrl } from "../lib/media";
import { emitSeek, linkifyTimestamps } from "../replay/seek";
import { Markdown } from "./Markdown";

// If an assistant answer is a whole JSON object/array (the agent returned a
// structured response), parse it — stripping an optional ```json fence. Returns
// null when it isn't clean JSON, so the caller falls back to markdown.
export function tryParseJsonAnswer(text: string): unknown | null {
  let s = text.trim();
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) s = fence[1].trim();
  if (!(s.startsWith("{") || s.startsWith("["))) return null;
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

const label = (k: string) =>
  k
    .replace(/[_-]+/g, " ")
    .replace(/\burl\b/gi, "URL")
    .replace(/^\w/, (c) => c.toUpperCase());

const isUrl = (v: unknown): v is string =>
  typeof v === "string" && /^https?:\/\//.test(v);

const isTimeKey = (k: string) => /time|timestamp|start|end|\bts\b/i.test(k);

function SeekChip({ seconds }: { seconds: number }) {
  return (
    <button
      type="button"
      onClick={() => emitSeek(seconds)}
      title={`Jump to ${seconds}s`}
      className="mx-0.5 inline-flex items-center rounded bg-primary/15 px-1 font-medium text-primary tabular-nums no-underline transition-colors hover:bg-primary/25"
    >
      {formatClock(seconds)}
    </button>
  );
}

function Scalar({ k, v }: { k: string; v: unknown }) {
  if (isUrl(v)) {
    // Never render the giant raw URL as text — label it with the filename, and
    // resolve to the durable (non-expiring) artifact URL.
    const isArtifact = /\/artifacts\//.test(v);
    const name = (() => {
      try {
        const base = decodeURIComponent(v.split("?")[0].split("/").pop() || "");
        return base || "link";
      } catch {
        return "link";
      }
    })();
    const isPrimary = isArtifact || /download|result|artifact/i.test(k);
    return (
      <a
        href={resolveArtifactUrl(v)}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "inline-flex items-center gap-1 font-medium text-primary hover:underline",
          isPrimary &&
            "rounded-md bg-primary px-2 py-1 text-primary-foreground no-underline hover:opacity-90"
        )}
      >
        {isPrimary && <DownloadIcon className="size-3.5" />}
        {name}
      </a>
    );
  }
  if (typeof v === "number" && isTimeKey(k) && v > 0) return <SeekChip seconds={v} />;
  // Long prose values (e.g. an `answer` field with embedded artifact URLs) render
  // as markdown so URLs become neat links and timestamps become seek chips.
  if (typeof v === "string" && (v.length > 80 || v.includes("\n") || v.includes("://"))) {
    return <Markdown>{linkifyArtifacts(linkifyTimestamps(v))}</Markdown>;
  }
  return <span className="break-words">{String(v)}</span>;
}

// One field row (key + rendered value), recursing into nested objects/arrays.
function Field({ k, v }: { k: string; v: unknown }) {
  // array of citation-like objects: render each as "start–end · text"
  if (Array.isArray(v)) {
    const scalars = v.every((x) => typeof x !== "object" || x === null);
    if (scalars) {
      const timey = isTimeKey(k) && v.every((x) => typeof x === "number");
      return (
        <Row label={label(k)}>
          <span className="flex flex-wrap gap-1">
            {timey
              ? (v as number[]).map((n, i) => <SeekChip key={i} seconds={n} />)
              : v.map((x, i) => (
                  <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {String(x)}
                  </span>
                ))}
          </span>
        </Row>
      );
    }
    return (
      <Row label={label(k)}>
        <ul className="flex flex-col gap-1.5">
          {v.map((item, i) => (
            <li key={i} className="rounded-md bg-muted/50 px-2.5 py-1.5">
              <Citation obj={item as Record<string, unknown>} />
            </li>
          ))}
        </ul>
      </Row>
    );
  }
  if (v && typeof v === "object") {
    return (
      <Row label={label(k)}>
        <ul className="flex flex-col gap-1">
          {Object.entries(v as Record<string, unknown>).map(([kk, vv]) => (
            <Field key={kk} k={kk} v={vv} />
          ))}
        </ul>
      </Row>
    );
  }
  return (
    <Row label={label(k)}>
      <Scalar k={k} v={v} />
    </Row>
  );
}

function Row({ label: l, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <span className="shrink-0 font-medium text-muted-foreground sm:min-w-[120px]">
        {l}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </li>
  );
}

// A {start_time,end_time,text}-ish object rendered compactly with a seek chip.
function Citation({ obj }: { obj: Record<string, unknown> }) {
  const start = Number(obj.start_time ?? obj.start ?? obj.t);
  const end = Number(obj.end_time ?? obj.end);
  const text = obj.text ?? obj.description ?? obj.label;
  if (Number.isFinite(start) && text != null) {
    return (
      <div className="flex gap-2 text-[13px]">
        <span className="shrink-0 tabular-nums">
          <SeekChip seconds={start} />
          {Number.isFinite(end) && end > start && (
            <span className="text-muted-foreground">–{formatClock(end)}</span>
          )}
        </span>
        <span className="min-w-0">{String(text)}</span>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-1 text-[13px]">
      {Object.entries(obj).map(([k, v]) => (
        <Field key={k} k={k} v={v} />
      ))}
    </ul>
  );
}

export function JsonAnswer({ data, raw }: { data: unknown; raw: string }) {
  const [open, setOpen] = useState(false);
  const entries =
    data && typeof data === "object" && !Array.isArray(data)
      ? Object.entries(data as Record<string, unknown>)
      : null;

  return (
    <div className="flex flex-col gap-3 text-[13px] leading-[1.6]">
      {entries ? (
        <ul className="flex flex-col gap-2">
          {entries.map(([k, v]) => (
            <Field key={k} k={k} v={v} />
          ))}
        </ul>
      ) : (
        // top-level array
        <ul className="flex flex-col gap-1.5">
          {(data as unknown[]).map((item, i) => (
            <li key={i} className="rounded-md bg-muted/50 px-2.5 py-1.5">
              <Citation obj={item as Record<string, unknown>} />
            </li>
          ))}
        </ul>
      )}

      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-muted-foreground text-xs hover:text-foreground"
        >
          {open ? "Hide" : "Show"} raw JSON
        </button>
        {open && (
          <Markdown className="mt-1.5" seek={false}>
            {"```json\n" + raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, "") + "\n```"}
          </Markdown>
        )}
      </div>
    </div>
  );
}

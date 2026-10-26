import { DownloadIcon, ExternalLinkIcon } from "lucide-react";
import { mediaUrl } from "../lib/media";
import type { Artifact } from "../replay/types";

const isVideo = (m: string) => m.startsWith("video/");
const isImage = (m: string) => m.startsWith("image/");

// Render the deliverables: videos and images play/show inline on the page;
// everything else (CSV, ZIP, HTML, JSON) stays a download chip.
export function Artifacts({ artifacts }: { artifacts: Artifact[] }) {
  const resolved = artifacts
    .map((a) => ({ a, url: mediaUrl(a.key) }))
    .filter((x): x is { a: Artifact; url: string } => !!x.url);
  if (resolved.length === 0) return null;

  const media = resolved.filter(({ a }) => isVideo(a.mime) || isImage(a.mime));
  const files = resolved.filter(({ a }) => !isVideo(a.mime) && !isImage(a.mime));

  return (
    <div className="mt-3 flex flex-col gap-3">
      {media.map(({ a, url }) => (
        <figure key={a.key} className="flex flex-col gap-1.5">
          <div className="overflow-hidden rounded-xl border bg-black shadow-[var(--shadow-card)]">
            {isVideo(a.mime) ? (
              // biome-ignore lint: static replay artifact
              <video className="w-full" controls preload="metadata" src={url}>
                <track kind="captions" />
              </video>
            ) : (
              <img alt={a.name} className="w-full" loading="lazy" src={url} />
            )}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 self-start text-muted-foreground text-xs hover:text-foreground"
          >
            <DownloadIcon className="size-3" />
            {a.name}
          </a>
        </figure>
      ))}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map(({ a, url }) => {
            const html = a.mime === "text/html";
            return (
              <a
                key={a.key}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 font-medium text-[12px] text-primary-foreground transition-opacity hover:opacity-90"
              >
                {html ? (
                  <ExternalLinkIcon className="size-3.5" />
                ) : (
                  <DownloadIcon className="size-3.5" />
                )}
                {a.name}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

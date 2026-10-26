// Resolve a fixture's relative media key (e.g. "replay/<slug>/source.mp4") to a
// loadable URL.
//
// Production: set VITE_MEDIA_BASE to the R2 bucket's public base (its r2.dev URL
// or a custom domain) at build time — keys resolve to `${base}/<key>`.
//
// Dev / pre-public: fall back to the 7-day presigned URLs the capture script
// wrote to `_presigned.json`, so the app works before the bucket is made public.
import presigned from "../fixtures/_presigned.json";

const BASE = (import.meta.env.VITE_MEDIA_BASE as string | undefined)?.replace(/\/$/, "");
const PRESIGNED = presigned as Record<string, string>;

export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (BASE) return `${BASE}/${key}`;
  return PRESIGNED[key] ?? null;
}

// The R2 object key inside an artifact URL (the agent emits a presigned R2 URL
// that expires). We resolve by key instead so links stay durable.
const ARTIFACT_KEY = /video-analysis-tests\/(artifacts\/[^\s"'<>)\]?]+)/;

export function artifactKeyFromUrl(url: string): string | null {
  const m = url.match(ARTIFACT_KEY);
  return m ? m[1] : null;
}

// Resolve an artifact URL (or s3:// path) to a durable, loadable URL; falls back
// to the original if we don't have the key.
export function resolveArtifactUrl(url: string): string {
  const key = artifactKeyFromUrl(url) ?? (url.startsWith("s3://") ? url.replace(/^s3:\/\/[^/]+\//, "") : null);
  return (key && mediaUrl(key)) || url;
}

// Replace the giant presigned R2 artifact URLs the agent pastes into prose with
// neat, durable `[filename](url)` markdown links.
// Match the whole URL up to whitespace / closing bracket (NOT the first dot, which
// would truncate at the file extension and leave the signature tail as raw text).
const ARTIFACT_URL_RX = /https?:\/\/[^\s)\]]*video-analysis-tests\/artifacts\/[^\s)\]]+/g;

export function linkifyArtifacts(md: string): string {
  return md.replace(ARTIFACT_URL_RX, (u) => {
    const key = artifactKeyFromUrl(u);
    const name = key ? key.split("/").pop() : "download";
    return `[${name}](${resolveArtifactUrl(u)})`;
  });
}

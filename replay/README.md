# Ambient Replay Gallery

A **read-only, static** demo that replays real Ambient sessions, animated like a
live run (reasoning streams in, tool calls appear in sequence, the video pane
seeks on citation clicks). Styled to match the Studio console. No engine, no DB,
no LLM key — it plays back captured event logs.

Published by the site's GitHub Pages workflow at `<site>/replay/` (see
`.github/workflows/pages.yml`), and linked from the landing page.

## How it works

- **Fixtures** (`src/fixtures/<slug>.json`) are captured from real engine
  sessions by `scripts/capture_replay.py` (repo root). Each holds the session's
  event log plus relative media keys; the source video + poster live on R2.
- **`src/replay/engine.ts`** walks the event log on a timer, rebuilding the chat.
  Its event→message reduction mirrors the Studio console's Ambient provider
  (`ambient/studio/console/lib/ai/ambient-provider.ts`) so it renders identically.
- **UI** reuses the console's look: design tokens (`src/globals.css`), the
  click-to-seek behaviour (`src/replay/seek.tsx`), Streamdown markdown, and lean
  tool/reasoning cards.
- Routing is query-param based (`?demo=<slug>`) so the whole app is one static
  `index.html`.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173  (gallery)  ?demo=highlight-reel
npm run build      # static dist/
```

## Media

Fixtures store relative keys (e.g. `replay/<slug>/source.mp4`). Resolution:

- **Production:** set `VITE_MEDIA_BASE` to the R2 bucket's public base (its
  r2.dev URL or a custom domain). In CI this comes from the repo variable
  `REPLAY_MEDIA_BASE`. The bucket/prefix must be publicly readable with CORS +
  range requests enabled so the `<video>` can seek.
- **Dev / preview:** if `VITE_MEDIA_BASE` is unset, the app falls back to the
  7-day presigned URLs in `src/fixtures/_presigned.json` (re-run the capture
  script to refresh them).

## Re-capture / add a session

Edit `SESSIONS` in `scripts/capture_replay.py`, then from the repo root (with the
local engine on :8080):

```bash
uv run python scripts/capture_replay.py                 # all (events + media + artifacts)
uv run python scripts/capture_replay.py <slug> ...        # a subset
uv run python scripts/capture_replay.py --no-source       # refresh events/artifacts only
                                                          # (reuse already-uploaded videos)
```

Deliverable **artifacts** (GIF, rendered video, HTML doc, report, zip, etc.) are
discovered two ways: parsed from the answer text, and from the explicit
`EXTRA_ARTIFACTS` map in `scripts/capture_replay.py` (for deliverables whose link
lived only in the Studio message store because the engine run was truncated). Each
existing artifact is **copied into the replay app's own durable prefix**
(`replay/<slug>/artifacts/<name>`, a server-side R2 copy) so downloads never
expire, independent of the original object or the agent's long-expired presigned
URL. The Outcome card resolves them via `VITE_MEDIA_BASE` (public bucket base) in
prod, or the presigned sidecar in dev.

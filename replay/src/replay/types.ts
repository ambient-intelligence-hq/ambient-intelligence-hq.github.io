// The message model the replay renders. Mirrors the AI-SDK part kinds the Studio
// console renders (reasoning / dynamic-tool / text), reduced to just what the
// read-only replay needs.

export type ToolState = "input-available" | "output-available" | "output-error";

export type Part =
  | { kind: "reasoning"; id: string; text: string; streaming: boolean }
  | {
      kind: "tool";
      id: string;
      toolName: string;
      state: ToolState;
      input: Record<string, unknown>;
      output?: string;
      isError?: boolean;
    }
  | { kind: "text"; id: string; text: string };

export type Role = "user" | "assistant";

export interface Msg {
  id: string;
  role: Role;
  parts: Part[];
  /** Bumped on every mutation so the UI can memoise finished messages. */
  rev: number;
}

export interface FixtureEvent {
  event: string;
  // The raw engine event object (same shape the console's parseSSE yields as
  // `data`), so the engine can read data.reasoning / data.content / etc.
  data: Record<string, unknown>;
}

export interface Fixture {
  slug: string;
  title: string;
  summary: string;
  question: string;
  model: string | null;
  durationSec: number;
  usage: Record<string, unknown>;
  media: { source: string | null; poster: string | null };
  artifacts: Artifact[];
  events: FixtureEvent[];
}

export interface Artifact {
  key: string; // durable R2 object key
  name: string; // filename
  mime: string;
}

export interface GalleryItem {
  slug: string;
  title: string;
  summary: string;
}

import type { Fixture } from "./types";

// Time-anchored tool calls, extracted from the event log, to plot on the video
// timeline: focus_clip / search_clip are ranges; grab_frames are points.
export interface Marker {
  id: string; // tool_use id (matches ReplayState.currentToolId)
  tool: string;
  kind: "range" | "point";
  start: number;
  end: number;
}

const TIME_TOOLS = new Set(["focus_clip", "search_clip", "grab_frames"]);

export function extractMarkers(fixture: Fixture): Marker[] {
  const out: Marker[] = [];
  for (const { event, data } of fixture.events) {
    if (event !== "agent.tool_use") continue;
    const name = String((data as any).name ?? "");
    if (!TIME_TOOLS.has(name)) continue;
    const input = ((data as any).input ?? {}) as Record<string, unknown>;
    const start = Number(input.start_time);
    const end = Number(input.end_time);
    if (!Number.isFinite(start)) continue;
    const e = Number.isFinite(end) ? end : start;
    out.push({
      id: String((data as any).id ?? `t-${out.length}`),
      tool: name,
      kind: e > start + 0.01 ? "range" : "point",
      start,
      end: Math.max(e, start),
    });
  }
  return out;
}

// Timer-driven replay engine.
//
// It walks a captured engine event log and rebuilds the chat, animated like a
// live run. The event -> message-part reduction mirrors the Studio console's
// Ambient provider (lib/ai/ambient-provider.ts, the `doStream` switch) so the
// replay renders identically — reasoning streams token-by-token, tool calls
// appear then resolve, and the answer streams in. Kept faithful to that switch
// by hand (the console is a Next app; this is a separate Vite build, so the two
// can't share a module without a workspace).

import type { Fixture, Msg, Part } from "./types";

type ReasoningPart = Extract<Part, { kind: "reasoning" }>;
type TextPart = Extract<Part, { kind: "text" }>;

// Extract plain text from an engine content value (a string or [{type,text}]).
function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((b) => (b && typeof b === "object" ? String((b as any).text ?? "") : ""))
      .join("");
  }
  return "";
}

// One applied mutation of the message list, scheduled at `at` ms on the timeline.
interface Op {
  at: number;
  apply: () => void;
}

// Per-op cadence (ms). Divided by playback speed. Cadence-based (not real
// wall-clock) so playback is lively and predictable regardless of how long the
// original session actually took.
const DELAY = {
  token: 9, // a reasoning / answer token
  thinking: 140, // a whole "thinking" block settling
  toolCall: 220, // a beat before a tool runs
  toolResult: 360, // dwell so the result is readable
  user: 260,
  gap: 120, // default between other ops
};

export interface ReplayState {
  messages: Msg[];
  progress: number; // 0..1
  playing: boolean;
  done: boolean;
  speed: number;
  usage: Record<string, unknown> | null;
  /** The tool call the replay is currently on (for timeline highlighting). */
  currentToolId: string | null;
}

export class ReplayEngine {
  private ops: Op[] = [];
  private total = 0;
  private idx = 0;
  private clock = 0;
  private speed = 1;
  private playing = false;
  private raf: number | null = null;
  private lastTs = 0;
  private msgs: Msg[] = [];
  private usage: Record<string, unknown> | null = null;
  private listeners = new Set<() => void>();

  // --- build-time cursors (closed over by the ops) ----------------------
  private asst: Msg | null = null;
  private openReasoning: ReasoningPart | null = null;
  private openText: TextPart | null = null;
  private sawReasoningDelta = false;
  private sawMessageDelta = false;
  private toolById = new Map<string, Part>();
  private currentToolId: string | null = null;
  private seq = 0;

  constructor(private fixture: Fixture) {
    this.compile();
  }

  // ---- public API ------------------------------------------------------
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getState(): ReplayState {
    return {
      messages: this.msgs,
      progress: this.total ? Math.min(1, this.clock / this.total) : 1,
      playing: this.playing,
      done: this.idx >= this.ops.length,
      speed: this.speed,
      usage: this.usage,
      currentToolId: this.currentToolId,
    };
  }

  play() {
    if (this.playing) return;
    if (this.idx >= this.ops.length) this.rebuildTo(0); // replay from start
    this.playing = true;
    this.lastTs = performance.now();
    this.loop();
    this.notify();
  }

  pause() {
    this.playing = false;
    if (this.raf != null) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.notify();
  }

  toggle() {
    this.playing ? this.pause() : this.play();
  }

  restart() {
    this.pause();
    this.rebuildTo(0);
    this.play();
  }

  setSpeed(s: number) {
    this.speed = s;
    this.notify();
  }

  /** Jump to a timeline fraction (0..1), rebuilding state deterministically. */
  seek(fraction: number) {
    const target = Math.max(0, Math.min(1, fraction)) * this.total;
    let i = 0;
    while (i < this.ops.length && this.ops[i].at <= target) i++;
    this.rebuildTo(i);
    this.clock = target;
    this.notify();
  }

  skipToEnd() {
    this.pause();
    this.rebuildTo(this.ops.length);
    this.clock = this.total;
    this.notify();
  }

  dispose() {
    this.pause();
    this.listeners.clear();
  }

  // ---- internals -------------------------------------------------------
  private notify() {
    for (const fn of this.listeners) fn();
  }

  private loop = () => {
    if (!this.playing) return;
    const now = performance.now();
    this.clock += (now - this.lastTs) * this.speed;
    this.lastTs = now;
    let changed = false;
    while (this.idx < this.ops.length && this.ops[this.idx].at <= this.clock) {
      this.ops[this.idx].apply();
      this.idx++;
      changed = true;
    }
    if (this.idx >= this.ops.length) {
      this.clock = this.total;
      this.playing = false;
      this.notify();
      return;
    }
    if (changed) this.notify();
    this.raf = requestAnimationFrame(this.loop);
  };

  /** Reset and re-apply ops[0..n) instantly (used by restart / seek). */
  private rebuildTo(n: number) {
    this.msgs = [];
    this.usage = null;
    this.asst = null;
    this.openReasoning = null;
    this.openText = null;
    this.sawReasoningDelta = false;
    this.sawMessageDelta = false;
    this.toolById = new Map();
    this.currentToolId = null;
    this.seq = 0;
    for (let i = 0; i < n; i++) this.ops[i].apply();
    this.idx = n;
  }

  // ---- compile events -> timed ops (mirrors the provider switch) -------
  private compile() {
    const evs = this.fixture.events;
    let t = 0;
    const push = (delay: number, apply: () => void) => {
      t += delay;
      this.ops.push({ at: t, apply });
    };

    for (const { event, data } of evs) {
      switch (event) {
        case "user.message": {
          const text = textOf((data as any).content);
          push(DELAY.user, () => this.onUser(text));
          break;
        }
        case "agent.reasoning.delta": {
          const tok = String((data as any).reasoning ?? "");
          if (tok) push(DELAY.token, () => this.onReasoningDelta(tok));
          break;
        }
        case "agent.thinking": {
          const text = textOf((data as any).content);
          push(DELAY.thinking, () => this.onThinking(text));
          break;
        }
        case "agent.tool_use": {
          const id = String((data as any).id ?? `tool-${this.toolById.size}`);
          const name = String((data as any).name ?? "tool");
          const input = ((data as any).input ?? {}) as Record<string, unknown>;
          push(DELAY.toolCall, () => this.onToolUse(id, name, input));
          break;
        }
        case "agent.tool_result": {
          const id = String((data as any).tool_use_id ?? "");
          const out = textOf((data as any).content);
          const isError = Boolean((data as any).is_error);
          push(DELAY.toolResult, () => this.onToolResult(id, out, isError));
          break;
        }
        case "agent.message.delta": {
          const d = textOf((data as any).content);
          if (d) push(DELAY.token, () => this.onMessageDelta(d));
          break;
        }
        case "agent.message": {
          const answer = textOf((data as any).content);
          push(DELAY.gap, () => this.onMessage(answer));
          break;
        }
        case "session.status_idle": {
          const usage = (data as any).usage;
          push(DELAY.gap, () => {
            if (usage && typeof usage === "object") this.usage = usage;
          });
          break;
        }
        default:
          break;
      }
    }
    this.total = t;
  }

  // ---- reducers (closed over by ops) -----------------------------------
  private bump(m: Msg) {
    m.rev++;
  }

  private ensureAssistant(): Msg {
    if (!this.asst) {
      this.asst = { id: `a-${this.seq++}`, role: "assistant", parts: [], rev: 0 };
      this.msgs.push(this.asst);
    }
    return this.asst;
  }

  private closeReasoning() {
    if (this.openReasoning) {
      this.openReasoning.streaming = false;
      if (this.asst) this.bump(this.asst);
      this.openReasoning = null;
    }
  }

  private onUser(text: string) {
    this.closeReasoning();
    this.openText = null;
    this.asst = null; // next assistant content starts a fresh turn
    this.sawMessageDelta = false;
    this.msgs.push({
      id: `u-${this.seq++}`,
      role: "user",
      parts: [{ kind: "text", id: "t", text }],
      rev: 0,
    });
  }

  private onReasoningDelta(tok: string) {
    this.sawReasoningDelta = true;
    const m = this.ensureAssistant();
    if (!this.openReasoning) {
      this.openReasoning = {
        kind: "reasoning",
        id: `r-${this.seq++}`,
        text: "",
        streaming: true,
      };
      m.parts.push(this.openReasoning);
    }
    this.openReasoning.text += tok;
    this.bump(m);
  }

  private onThinking(text: string) {
    // Whole reasoning for one step. If we already streamed it via deltas, just
    // close the block; otherwise this text *is* the step's reasoning.
    const m = this.ensureAssistant();
    if (this.sawReasoningDelta) {
      this.closeReasoning();
    } else {
      this.closeReasoning();
      if (text) {
        m.parts.push({ kind: "reasoning", id: `r-${this.seq++}`, text, streaming: false });
        this.bump(m);
      }
    }
    this.sawReasoningDelta = false;
  }

  private onToolUse(id: string, name: string, input: Record<string, unknown>) {
    this.closeReasoning();
    this.openText = null; // a tool call ends any answer text before it
    this.sawReasoningDelta = false;
    const m = this.ensureAssistant();
    const part: Part = {
      kind: "tool",
      id,
      toolName: name,
      state: "input-available",
      input,
    };
    this.toolById.set(id, part);
    this.currentToolId = id;
    m.parts.push(part);
    this.bump(m);
  }

  private onToolResult(id: string, out: string, isError: boolean) {
    const part = this.toolById.get(id);
    if (part && part.kind === "tool") {
      part.output = out;
      part.isError = isError;
      part.state = isError ? "output-error" : "output-available";
      if (this.asst) this.bump(this.asst);
    }
  }

  private onMessageDelta(d: string) {
    this.sawMessageDelta = true;
    this.closeReasoning();
    const m = this.ensureAssistant();
    if (!this.openText) {
      this.openText = { kind: "text", id: `x-${this.seq++}`, text: "" };
      m.parts.push(this.openText);
    }
    this.openText.text += d;
    this.bump(m);
  }

  private onMessage(answer: string) {
    this.closeReasoning();
    if (!this.sawMessageDelta && answer) {
      const m = this.ensureAssistant();
      this.openText = { kind: "text", id: `x-${this.seq++}`, text: answer };
      m.parts.push(this.openText);
      this.bump(m);
    }
  }
}

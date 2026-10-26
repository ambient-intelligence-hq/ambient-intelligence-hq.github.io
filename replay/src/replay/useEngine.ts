import { useEffect, useRef, useState } from "react";
import { ReplayEngine, type ReplayState } from "./engine";
import type { Fixture } from "./types";

// Drive a ReplayEngine from React: create it for a fixture, re-render on each
// engine notify (via a version counter — the engine mutates in place for perf),
// and autoplay once on mount.
export function useEngine(fixture: Fixture) {
  const engineRef = useRef<ReplayEngine | null>(null);
  const [, force] = useState(0);
  if (!engineRef.current) engineRef.current = new ReplayEngine(fixture);
  const engine = engineRef.current;

  useEffect(() => {
    const unsub = engine.subscribe(() => force((n) => n + 1));
    const t = setTimeout(() => engine.play(), 400); // small beat before it starts
    return () => {
      clearTimeout(t);
      unsub();
      engine.dispose();
    };
    // one engine per fixture instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state: ReplayState = engine.getState();
  return { engine, state };
}

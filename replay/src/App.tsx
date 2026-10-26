import { useEffect, useState } from "react";
import { Gallery } from "./components/Gallery";
import { ReplayView } from "./components/ReplayView";
import { gallery, loadFixture } from "./replay/fixtures";
import type { Fixture } from "./replay/types";

// Query-param routing (`?demo=<slug>`) so the whole app is one static
// index.html — no per-route HTML needed for GitHub Pages.
function useDemoSlug(): string | null {
  const [slug, setSlug] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get("demo")
  );
  useEffect(() => {
    const onPop = () =>
      setSlug(new URLSearchParams(window.location.search).get("demo"));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return slug;
}

export function App() {
  const slug = useDemoSlug();
  const [fixture, setFixture] = useState<Fixture | null | "loading">(null);

  useEffect(() => {
    let alive = true;
    if (!slug) {
      setFixture(null);
      return;
    }
    setFixture("loading");
    loadFixture(slug).then((f) => {
      if (alive) setFixture(f);
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (!slug) return <Gallery items={gallery} />;

  if (fixture === "loading" || fixture === null) {
    const missing = fixture === null;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-muted-foreground text-sm">
          {missing ? "That replay doesn’t exist." : "Loading replay…"}
        </p>
        {missing && (
          <a href="?" className="text-primary text-sm underline">
            Back to gallery
          </a>
        )}
      </div>
    );
  }

  // Remount the view (and its engine) per slug.
  return <ReplayView fixture={fixture} key={slug} />;
}

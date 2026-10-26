import { ArrowUpRightIcon, PlayCircleIcon } from "lucide-react";
import { mediaUrl } from "../lib/media";
import type { GalleryItem } from "../replay/types";
import { AmbientMark } from "./AmbientMark";

// Back to the main Ambient site. The gallery is published at `<site>/replay/`,
// so the site root is one level up; "../" resolves to it in production.
const SITE_HOME = "../";

export function Gallery({ items }: { items: GalleryItem[] }) {
  return (
    <div className="mx-auto min-h-full max-w-6xl px-5 py-6">
      <nav className="mb-8 flex items-center justify-between">
        <a href={SITE_HOME} className="flex items-center gap-2 font-display font-bold">
          <AmbientMark className="size-7" />
          Ambient
        </a>
        <a
          href={SITE_HOME}
          className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          Back to site <ArrowUpRightIcon className="size-3.5" />
        </a>
      </nav>

      <header className="mb-10 flex flex-col items-center gap-4 text-center">
        <AmbientMark className="size-11 rounded-xl" />
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
            Watch Ambient work
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground text-sm leading-relaxed">
            Real sessions, replayed. The video agent reasons over footage and turns
            it into reports, documentation, reels, datasets and more — step by step,
            with grounded citations. No sign-in, nothing to run.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const poster = mediaUrl(`replay/${item.slug}/poster.jpg`);
          return (
            <a
              key={item.slug}
              href={`?demo=${item.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-float)]"
            >
              <div className="relative aspect-video overflow-hidden bg-black">
                {poster && (
                  <img
                    alt=""
                    src={poster}
                    className="size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100">
                  <PlayCircleIcon className="size-12 text-white drop-shadow" />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h2 className="font-display font-bold text-[15px]">{item.title}</h2>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      <footer className="mt-12 text-center text-muted-foreground text-xs">
        Ambient — the open video-understanding agent engine.
      </footer>
    </div>
  );
}

import type { Fixture, GalleryItem } from "./types";
import index from "../fixtures/index.json";

// Lazy per-slug loaders so the big fixtures aren't in the initial bundle — the
// gallery only needs index.json; a replay page pulls its one fixture on open.
const loaders = import.meta.glob<{ default: Fixture }>("../fixtures/*.json");

export const gallery: GalleryItem[] = index as GalleryItem[];

export async function loadFixture(slug: string): Promise<Fixture | null> {
  const key = `../fixtures/${slug}.json`;
  const loader = loaders[key];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}

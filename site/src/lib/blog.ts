import { getCollection, render, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/** Posts newest first. Drafts show in `npm run dev` but are left out of builds. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", (p) => import.meta.env.DEV || !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** The frontmatter override if set, otherwise the estimate from remark-reading-time. */
export async function readingTime(post: Post): Promise<string | undefined> {
  if (post.data.readingTime) return post.data.readingTime;
  const { remarkPluginFrontmatter } = await render(post);
  return remarkPluginFrontmatter.minutesRead;
}

/** Dates render as "2026 · 09 · 22" across the blog. */
export function formatDate(d: Date): string {
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()} · ${m} · ${day}`;
}

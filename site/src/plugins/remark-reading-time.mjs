// Adds `minutesRead` (e.g. "4 min read") to every Markdown/MDX page's
// frontmatter at build time. Read it with `remarkPluginFrontmatter` from
// `render()`. https://docs.astro.build/en/recipes/reading-time/
import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

export function remarkReadingTime() {
  return (tree, { data }) => {
    const { minutes } = getReadingTime(toString(tree));
    data.astro.frontmatter.minutesRead = `${Math.max(1, Math.round(minutes))} min read`;
  };
}

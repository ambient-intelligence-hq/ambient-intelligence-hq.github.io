import rss from "@astrojs/rss";
import { getPosts } from "../lib/blog";

export async function GET(context) {
  const posts = await getPosts();

  return rss({
    title: "Ambient Blog",
    description: "Notes from the team building Ambient — the video-understanding agent engine.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `${import.meta.env.BASE_URL}blog/${post.id}/`,
    })),
  });
}

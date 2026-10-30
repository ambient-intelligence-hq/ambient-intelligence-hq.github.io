import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

// Developer docs live as Markdown/MDX in src/content/docs/ (Starlight).
// src/content/docs/docs/quickstart.mdx → /docs/quickstart/.
const docs = defineCollection({ loader: docsLoader(), schema: docsSchema() });

// Blog posts live as Markdown or MDX in src/content/blog/. A post is either
// a single file (my-post.mdx) or a folder with its images (my-post/index.mdx,
// my-post/diagram.png). Either way the URL is /blog/my-post/.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      tag: z.string().default("Post"),
      // Optional cover, relative to the post (./cover.jpg). Optimized at build
      // time and used as the post's social preview image.
      cover: image().optional(),
      coverAlt: z.string().optional(),
      // Computed automatically; set this only to override the estimate.
      readingTime: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

// Overrides for Starlight's built-in UI strings (src/content/i18n/en.json).
const i18n = defineCollection({ loader: i18nLoader(), schema: i18nSchema() });

export const collections = { blog, docs, i18n };

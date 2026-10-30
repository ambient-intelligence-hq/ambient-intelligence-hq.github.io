import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

// Developer docs live as Markdown/MDX in src/content/docs/ (Starlight).
// src/content/docs/docs/quickstart.mdx → /docs/quickstart/.
const docs = defineCollection({ loader: docsLoader(), schema: docsSchema() });

// Blog posts live as Markdown in src/content/blog/*.md.
// Each file's name (without .md) becomes its URL slug: /blog/<slug>/.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tag: z.string().default("Post"),
    readingTime: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Overrides for Starlight's built-in UI strings (src/content/i18n/en.json).
const i18n = defineCollection({ loader: i18nLoader(), schema: i18nSchema() });

export const collections = { blog, docs, i18n };

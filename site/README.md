# Ambient site

The marketing site, blog, and developer docs for **Ambient** — the
video-understanding agent engine. *Any video in. Any action out.*

Built with [Astro](https://astro.build). The landing page is an Astro page;
**blog posts are Markdown** in a content collection, and the **developer docs
are MDX** rendered by [Starlight](https://starlight.astro.build). Dark-first,
Baseten-inspired: chunky grotesk display type, monospace UI labels, dotted-grid
backgrounds, an electric-green accent, and a scroll-driven WebGL point cloud on
the home page.

## Structure

```
site/
├── astro.config.mjs          # site URL + base path config
├── package.json
├── src/
│   ├── layouts/Base.astro     # shared shell: <head>, nav, footer, point cloud
│   ├── content.config.ts      # blog + docs collection schemas
│   ├── content/blog/          # ← blog posts live here, one .md per post
│   │   └── introducing-ambient.md
│   ├── content/docs/docs/     # ← developer docs (Starlight), one .mdx per page
│   ├── assets/docs/           # docs screenshots (optimized at build time)
│   ├── styles/starlight.css   # Ambient brand theme for the docs
│   └── pages/
│       ├── index.astro        # landing page
│       ├── blog/index.astro   # post listing (generated from the collection)
│       ├── blog/[...slug].astro   # renders each Markdown post
│       └── rss.xml.js         # RSS feed
└── public/assets/             # css, js (point cloud, interactions), images
    ├── css/styles.css          # shared design system
    ├── css/home.css            # landing-page-only styles
    └── js/{pointcloud,main}.js
```

## Develop

```bash
cd site
npm install
npm run dev        # http://localhost:4321
```

`npm run build` outputs static files to `site/dist/`; `npm run preview` serves
that build.

## Writing a blog post

Add a Markdown file to `src/content/blog/`. The filename becomes the URL slug
(`my-post.md` → `/blog/my-post/`). Frontmatter:

```markdown
---
title: My post title
description: One-line summary for the card + <meta> + RSS.
date: 2026-10-01
tag: Engineering        # shown as the card pill
readingTime: 5 min read # optional
draft: false            # true hides it from the listing, RSS, and build
---

Write the body in **Markdown**. Headings, lists, `inline code`, and
blockquotes are all styled to match the site.
```

The listing, the post page, and the RSS feed pick it up automatically — no code
changes. To manage posts through a web UI instead of editing Markdown directly,
a git-based CMS such as [Decap](https://decapcms.org) can be layered on top
(it commits to `src/content/blog/`); ask if you want that wired up.

## Writing docs

Docs are [Starlight](https://starlight.astro.build) pages: MDX files under
`src/content/docs/docs/`. The path becomes the URL
(`sdk/quickstart.mdx` → `/docs/sdk/quickstart/`). Each page needs a `title` and
`description` in its frontmatter. To add a page, create the file and add its
slug to the `sidebar` in `astro.config.mjs`.

- Use Starlight's components (`Steps`, `Tabs`, `Aside`, `CardGrid`, `LinkCard`)
  from `@astrojs/starlight/components`.
- Give code fences a title: ```` ```bash title="Terminal" ````.
- **Link between docs pages with relative paths** (`../operations/`) so links
  keep working when the site is served under a `BASE_PATH`.
- Put screenshots in `src/assets/docs/` and reference them relatively; Astro
  optimizes them at build time.

Search (Pagefind), the sidebar, the on-page table of contents, and
prev/next links are generated; there's nothing to maintain by hand.

## Editing pages

- **Landing** — edit `src/pages/index.astro`.
- **Nav / footer** — `src/layouts/Base.astro`.
- **Design tokens** — CSS variables at the top of `public/assets/css/styles.css`.

## Deploying to GitHub Pages

`.github/workflows/pages.yml` builds the site and publishes `site/dist/` on every
push to `main` that touches `site/`.

One-time setup: **Repo → Settings → Pages → Source: GitHub Actions.**

If you deploy to a **project page** (`your-org.github.io/<repo>/`) rather than a
user/org page or custom domain, set `base: "/<repo>"` in `astro.config.mjs` so
asset and link paths resolve. (Markdown post links written as `/docs/...` should
then include the base too.)

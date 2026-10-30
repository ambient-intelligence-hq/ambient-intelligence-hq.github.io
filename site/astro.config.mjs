// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import mdx from "@astrojs/mdx";
import starlightLlmsTxt from "starlight-llms-txt";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

// Deploy target is configurable so this works before a domain is chosen and
// after. Set these as repo *variables* (Settings → Actions → Variables); the
// workflow passes them through:
//
//   SITE_URL   canonical URL (for RSS/OG). Default: the intended goambient.ai.
//   BASE_PATH  URL base. Default "/" (apex domain or an org *.github.io page).
//              For an interim project page served at <org>.github.io/<repo>/,
//              set BASE_PATH="/<repo>" so assets + links resolve.
//
// `${base}replay/` and all internal links use BASE_URL, so they adapt
// automatically. The replay app itself uses a relative base and needs no change.
const SITE_URL = process.env.SITE_URL || "https://goambient.ai";
const BASE_PATH = process.env.BASE_PATH || "/";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,

  // Trailing-slash URLs (…/blog/post/) match how GitHub Pages serves folders.
  trailingSlash: "always",

  build: { format: "directory" },

  // Blog posts get an automatic reading time (frontmatter.minutesRead).
  markdown: { remarkPlugins: [remarkReadingTime] },

  // Developer docs are Starlight: Markdown/MDX pages in src/content/docs/docs/
  // become /docs/<path>/. Starlight only owns those routes — the marketing
  // pages and blog in src/pages/ are unaffected.
  integrations: [
    starlight({
      title: "Ambient Docs",
      description: "Developer documentation for Ambient, the video-understanding agent engine.",
      logo: { light: "./src/assets/ambient-mark.svg", dark: "./src/assets/ambient-mark-dark.svg", alt: "Ambient" },
      favicon: "/assets/img/ambient-mark.svg",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/ambient-intelligence-hq/ambient" }],
      customCss: ["./src/styles/starlight.css"],
      // /llms.txt, /llms-full.txt and /llms-small.txt: the docs as plain text
      // for AI agents. The agent setup guide itself is public/agents/setup.md.
      plugins: [
        starlightLlmsTxt({
          projectName: "Ambient",
          description:
            "Ambient is a video-understanding agent engine: give it a video and a question, and it answers with timestamp citations. It runs locally with Docker and includes a web UI (Studio) and an API compatible with the Anthropic SDK.",
          details:
            "To install Ambient on the user's machine, follow the agent setup guide first: https://ambient-intelligence-hq.github.io/agents/setup.md",
          promote: ["docs/quickstart*", "docs/sdk/quickstart*"],
        }),
      ],
      // Default to light mode; see the component for how System/Dark still work.
      components: {
        ThemeProvider: "./src/components/starlight/ThemeProvider.astro",
        // Adds the "Set up with your agent" button and modal to the header.
        SocialIcons: "./src/components/starlight/SocialIcons.astro",
      },
      head: [
        { tag: "link", attrs: { rel: "preconnect", href: "https://fonts.googleapis.com" } },
        { tag: "link", attrs: { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: true } },
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
          },
        },
      ],
      // The marketing site has no 404 of its own; keep GitHub Pages' default.
      disable404Route: true,
      sidebar: [
        {
          label: "Getting started",
          items: [
            { label: "Overview", slug: "docs" },
            { label: "Quickstart", slug: "docs/quickstart" },
          ],
        },
        {
          label: "Studio",
          items: [
            { label: "Setup", slug: "docs/studio/setup" },
            { label: "Walkthrough", slug: "docs/studio/walkthrough" },
          ],
        },
        {
          label: "SDK",
          items: [
            { label: "Quickstart", slug: "docs/sdk/quickstart" },
            { label: "Operations", slug: "docs/sdk/operations" },
            { label: "Sandbox setup", slug: "docs/sdk/sandbox" },
            { label: "Environments", slug: "docs/sdk/environments" },
          ],
        },
        {
          label: "Reference",
          items: [{ label: "Configuration", slug: "docs/reference/configuration" }],
        },
      ],
    }),
    // MDX for blog posts. Starlight would add it for the docs anyway; listing
    // it here keeps the blog independent. It must come after Starlight so
    // Starlight's remark plugins are applied to docs pages.
    mdx({ optimize: true }),
  ],
});

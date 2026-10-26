// @ts-check
import { defineConfig } from "astro/config";

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
});

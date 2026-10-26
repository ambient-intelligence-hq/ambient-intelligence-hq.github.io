import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Relative base so the built SPA works under any mount path — it is published
// at `<site>/replay/` (the Astro site's GitHub Pages base is `/ambient`, so the
// live path is `/ambient/replay/`). Routing is query-param based (`?demo=slug`)
// which keeps a single index.html, so no per-route HTML is needed.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});

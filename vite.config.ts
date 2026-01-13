import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import { buildConfig } from "./vite/build-config";
import { pwaConfig } from "./vite/pwa-config";
import { injectLocalizedMeta } from "./vite/ssg-meta-injector";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), VitePWA(pwaConfig)],
  base: "/",
  // Include font assets from @fontsource packages
  assetsInclude: ["**/*.woff2", "**/*.woff"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@tests": path.resolve(__dirname, "src/__tests__"),
    },
  },
  // SSG Configuration
  ssgOptions: {
    // Pages to prerender at build time
    // Client-only pages (results, sample) will be handled by SPA fallback
    script: "async",
    formatting: "minify",
    crittersOptions: {
      // Inline critical CSS
      preload: "swap",
    },

    // Hook to inject localized meta tags, canonical, hreflang for each page
    async onPageRendered(route, renderedHTML) {
      return injectLocalizedMeta(route, renderedHTML, __dirname);
    },
  },
  build: buildConfig,
});

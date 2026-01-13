import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";
import vercel from "vite-plugin-vercel";
import { defineConfig } from "vite";
import { buildConfig } from "./vite/build-config";
import { pwaConfig } from "./vite/pwa-config";
import { injectLocalizedMeta } from "./vite/ssg-meta-injector";
import { SUPPORTED_LANGUAGES } from "./src/config/languages";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), VitePWA(pwaConfig), vercel()],
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

    // Include dynamic routes (wizard steps 1-8) for all languages
    includedRoutes(paths) {
      const wizardSteps = Array.from({ length: 8 }, (_, i) => i + 1);
      const dynamicRoutes: string[] = [];

      // Add wizard steps for English
      wizardSteps.forEach(step => {
        dynamicRoutes.push(`/wizard/step/${step}`);
      });

      // Add wizard steps for other languages (from shared config)
      SUPPORTED_LANGUAGES.filter(lang => lang !== 'en').forEach(lang => {
        wizardSteps.forEach(step => {
          dynamicRoutes.push(`/${lang}/wizard/step/${step}`);
        });
      });

      return [...paths, ...dynamicRoutes];
    },

    // Hook to inject localized meta tags, canonical, hreflang for each page
    async onPageRendered(route, renderedHTML) {
      return injectLocalizedMeta(route, renderedHTML, __dirname);
    },
  },
  build: buildConfig,
});

import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "logo.svg",
      ],
      manifest: {
        name: "Safe Unfollow - Instagram Tracker",
        short_name: "Safe Unfollow",
        description:
          "Check who unfollowed you on Instagram - 100% private, no login required",
        theme_color: "#4E7EF5",
        background_color: "#0a0a0a",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Don't precache large sample data
        globIgnores: ["**/sample-data.json"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
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

    // Hook to inject correct canonical, hreflang, and og:image tags for each page
    async onPageRendered(route, renderedHTML) {
      const BASE_URL = "https://safeunfollow.app";
      const SUPPORTED_LANGUAGES = [
        "en",
        "es",
        "pt",
        "hi",
        "id",
        "tr",
        "ja",
        "ru",
        "de",
      ];

      // Normalize route for canonical URL
      const canonicalPath = route === "/" ? "" : route.replace(/\/$/, "");
      const canonicalUrl = `${BASE_URL}${canonicalPath || "/"}`;

      // Get base path without language prefix for hreflang
      const langPrefixPattern = /^\/(es|pt|hi|id|tr|ja|ru|de)(\/|$)/;
      const basePath = route.replace(langPrefixPattern, "/") || "/";
      const normalizedBasePath = basePath === "/" ? "" : basePath;

      // Extract language from route for og:image
      const langMatch = route.match(/^\/(es|pt|hi|id|tr|ja|ru|de)(\/|$)/);
      const currentLang = langMatch ? langMatch[1] : "en";

      // Generate hreflang links
      const hreflangLinks = SUPPORTED_LANGUAGES.map((lang) => {
        const url =
          lang === "en"
            ? `${BASE_URL}${normalizedBasePath || "/"}`
            : `${BASE_URL}/${lang}${normalizedBasePath}`;
        return `<link rel="alternate" hreflang="${lang}" href="${url}"/>`;
      }).join("\n    ");

      // Add x-default (English)
      const xDefaultUrl = `${BASE_URL}${normalizedBasePath || "/"}`;
      const xDefaultLink = `<link rel="alternate" hreflang="x-default" href="${xDefaultUrl}"/>`;

      // Canonical link
      const canonicalLink = `<link rel="canonical" href="${canonicalUrl}"/>`;

      // Inject into head (before </head>)
      const seoTags = `
    <!-- SSG SEO: canonical and hreflang -->
    ${canonicalLink}
    ${hreflangLinks}
    ${xDefaultLink}
  `;

      // Replace og:image URL with language parameter
      const ogImageUrl = `${BASE_URL}/api/og?lang=${currentLang}`;
      let html = renderedHTML.replace(
        /<meta property="og:image" content="[^"]*"/,
        `<meta property="og:image" content="${ogImageUrl}"`
      );

      return html.replace("</head>", `${seoTags}</head>`);
    },
  },
  build: {
    // Enable source maps for detailed bundle analysis
    sourcemap: true,
    // Optimize bundle size while keeping source maps
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
      },
    },
    // Prevent JS file generation during build
    emptyOutDir: true,
    // Rollup options for better tree shaking
    rollupOptions: {
      // Exclude test files from build
      external: (id) => {
        return (
          id.includes(".test.") ||
          id.includes(".spec.") ||
          id.includes("__tests__")
        );
      },
      output: {
        // Manual chunk splitting for better caching
        // Note: react/react-dom excluded - they're externalized during SSR build
        manualChunks: (id) => {
          // Only split chunks for client build
          if (id.includes('node_modules')) {
            // Radix primitives and slots (shared dependencies) go to core
            if (id.includes('@radix-ui/primitive') ||
                id.includes('@radix-ui/react-primitive') ||
                id.includes('@radix-ui/react-slot') ||
                id.includes('@radix-ui/react-compose-refs') ||
                id.includes('@radix-ui/react-context') ||
                id.includes('@radix-ui/react-id') ||
                id.includes('@radix-ui/react-use-') ||
                id.includes('@radix-ui/react-presence') ||
                id.includes('@radix-ui/react-portal') ||
                id.includes('@radix-ui/react-focus-') ||
                id.includes('@radix-ui/react-dismissable-layer') ||
                id.includes('@radix-ui/react-popper')) {
              return 'radix-core';
            }

            // Dialog-related (alert-dialog depends on dialog)
            if (id.includes('@radix-ui/react-dialog') ||
                id.includes('@radix-ui/react-alert-dialog')) {
              return 'radix-dialog';
            }

            // Dropdown menu
            if (id.includes('@radix-ui/react-dropdown-menu') ||
                id.includes('@radix-ui/react-menu')) {
              return 'radix-menu';
            }

            // Other Radix components
            if (id.includes('@radix-ui/react-accordion')) return 'radix-accordion';
            if (id.includes('@radix-ui/react-tabs')) return 'radix-tabs';
            if (id.includes('@radix-ui/react-collapsible')) return 'radix-accordion';

            // Remaining Radix goes to core
            if (id.includes('@radix-ui')) return 'radix-core';

            // Icons in separate chunk
            if (id.includes('lucide-react')) return 'icons';

            // Utils
            if (id.includes('zustand') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,

    // Skip type checking for tests to allow maximum flexibility
    typecheck: {
      enabled: false,
    },

    // Performance optimizations
    isolate: true,
    pool: "threads",

    // Test file patterns - only include .ts and .tsx source files (not compiled .js)
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "src/__tests__/**/*.{test,spec}.{ts,tsx}",
    ],

    // Force TypeScript compilation without JS output
    testTransformMode: {
      web: ["**/*.{ts,tsx}"],
      ssr: ["**/*.{ts,tsx}"],
    },

    // Exclude unnecessary folders and files
    exclude: [
      // All compiled JS files (exclude all JS files in src)
      "src/**/*.js",

      // Compiled JS files from tests (only run .ts/.tsx sources)
      "src/**/*.test.js",
      "src/**/*.spec.js",
      "src/__tests__/**/*.test.js",
      "src/__tests__/**/*.spec.js",

      // Documentation and static files
      "docs/**",
      "**/*.md",
      "**/*.html",
      "**/*.css",
      "**/*.scss",
      "**/*.sass",
      "**/*.less",

      // Build artifacts and dependencies
      "dist/**",
      "node_modules/**",
      "coverage/**",

      // Raw data and assets
      "raw/**",
      "public/**",
      "*.zip",
      "*.ico",
      "*.png",
      "*.jpg",
      "*.jpeg",
      "*.gif",
      "*.svg",
      "*.webp",

      "designs/**",

      // Root directory files (exclude all files in project root)
      "*.ts",
      "*.js",
      "*.json",
      "*.yml",
      "*.yaml",
      "*.md",
      "*.txt",
      "*.html",
      "*.css",
      "*.scss",
      "*.sass",
      "*.less",

      // Configuration files
      "vite.config.ts",
      "tsconfig.json",
      "tsconfig.test.json",
      "test-tsconfig.ts",
      "vitest.setup.ts",
      "vitest.setup.js",
      "tailwind.config.js",
      "postcss.config.js",
      "eslint.config.js",
      "components.json",
      "vercel.json",
      "codecov.yml",

      // Lock files and package files
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",

      // Git and other system files
      ".git/**",
      ".github/**",
      ".vscode/**",
      ".idea/**",
    ],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "text-summary", "json"],
      reportOnFailure: true, // Generate coverage report even when tests fail

      // Exclude patterns for coverage
      exclude: [
        // Entry points
        "src/main.tsx",

        // All compiled JS files (exclude all JS files in src)
        "src/**/*.js",

        // Compiled JS files from tests (only run .ts/.tsx sources)
        "src/**/*.test.js",
        "src/**/*.spec.js",
        "src/__tests__/**/*.test.js",
        "src/__tests__/**/*.spec.js",

        // Index files (re-exports only)
        "src/**/index.ts",

        // Root directory files (exclude all files in project root)
        "*.ts",
        "*.js",
        "*.json",
        "*.yml",
        "*.yaml",
        "*.md",
        "*.txt",
        "*.html",
        "*.css",
        "*.scss",
        "*.sass",
        "*.less",

        // Configuration files
        "vite.config.ts",
        "tsconfig.json",
        "tsconfig.test.json",
        "test-tsconfig.ts",
        "vitest.setup.ts",
        "vitest.setup.js",
        "tailwind.config.js",
        "postcss.config.js",
        "eslint.config.js",
        "components.json",
        "vercel.json",
        "codecov.yml",

        // Documentation
        "**/*.md",
        "docs/**",

        // Design versions
        "designs/**",

        // Build artifacts
        "dist/**",
        "node_modules/**",
        "coverage/**",

        // Raw data and assets
        "raw/**",
        "public/**",

        // Test files themselves
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/*.spec.ts",
        "src/**/*.spec.tsx",
        "src/__tests__/**",

        // Type definition files (no runtime code)
        "src/**/*.d.ts",
        "src/types/**",

        // Constants and configuration
        "src/constants/**",

        // Interface-only files (no runtime code to test)
        "src/lib/filtering/engine.ts", // Only TypeScript interfaces
        "src/locales/types.ts", // Only type definitions

        // Web Worker files (difficult to test in jsdom)
        "src/lib/parse-worker.ts", // Web Worker - runs in separate thread

        // shadcn/ui primitives with many unused exports (library code)
        "src/components/ui/dropdown-menu.tsx", // Only 4/14 exports used (LanguageSwitcher)
        "src/components/ui/dialog.tsx", // Radix primitive wrapper

        // Legacy/deprecated components pending removal
        "src/components/ParseResultDisplay.tsx", // Low usage, superseded by DiagnosticErrorScreen

        // Wizard sub-components (tested through parent Wizard.test.tsx)
        "src/components/steps/**", // HeroStep, HowToStep, UploadStep, ResultsStep

        // App orchestration layer (routing + handler delegation, mocked in tests)
        "src/ui/App.tsx", // Handlers tested indirectly via child component tests

        // Hooks with Web Worker dependencies (skip due to complexity)
        // 'src/hooks/useAccountFiltering.ts',
        // 'src/hooks/useFilterWorker.ts',

        // Scripts and utility files
        "scripts/**",

      ],

      // Coverage thresholds (balanced quality standards)
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 80,
        lines: 85,
      },

      // Coverage collection settings
      all: true,
      skipFull: false,
      // Coverage enforcement
      clean: true, // Clean coverage directory before running
      cleanOnRerun: true, // Clean on rerun
    },

    // Test timeout and retry settings
    testTimeout: 10000, // 10s max per test
    hookTimeout: 5000, // 5s max for setup/teardown
    teardownTimeout: 5000,

    // Worker configuration optimized for performance
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 4, // Start with 4 threads for good parallelization
        maxThreads: 8, // Use up to 8 threads (50% of CPU cores) to avoid memory issues
      },
    },

    // Force kill workers that exceed time limits
    forceRerunTriggers: [
      "**/package.json",
      "**/vitest.config.*",
      "**/vite.config.*",
    ],

    // Retry configuration for flaky tests
    retry: 2, // Allow 2 retries for flaky tests

    // Bail on first failure for faster CI feedback
    bail: 0, // Set to 1 to bail on first failure, 0 to run all tests

    // Reporter configuration
    reporters: ["verbose"],
    outputFile: {
      html: "./coverage/test-results.html",
    },
  },
});

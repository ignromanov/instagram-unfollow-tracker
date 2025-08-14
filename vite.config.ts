import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  base: "/instagram-unfollow-tracker/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@tests": path.resolve(__dirname, "src/__tests__"),
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
        manualChunks: {
          // Vendor chunk for third-party libraries
          vendor: ["react", "react-dom"],
          // UI components chunk
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-tabs",
            "lucide-react",
          ],
          // Utils chunk
          utils: ["zustand", "clsx", "tailwind-merge"],
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
      reporter: ["text", "text-summary", "html", "lcov", "clover"],
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

        // Web Worker files (difficult to test in jsdom)
        // 'src/lib/filter-worker.ts',

        // Hooks with Web Worker dependencies (skip due to complexity)
        // 'src/hooks/useAccountFiltering.ts',
        // 'src/hooks/useFilterWorker.ts',
      ],

      // Coverage thresholds (balanced quality standards)
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
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
    reporters: ["verbose", "html"],
    outputFile: {
      html: "./coverage/test-results.html",
    },
  },
});

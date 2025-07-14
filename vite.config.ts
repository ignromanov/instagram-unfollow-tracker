import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tests': path.resolve(__dirname, 'src/__tests__'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      exclude: [
        // Entry points
        'src/main.tsx',
        
        // Index files (re-exports only)
        'src/**/index.ts',
        
        // Configuration files
        'vite.config.ts',
        'tsconfig.json',
        'vitest.setup.ts',
        
        // Documentation
        '**/*.md',
        
        // Build artifacts
        'dist/**',
        'node_modules/**',
        
        // Test files themselves
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/__tests__/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  // no local API proxy needed
});

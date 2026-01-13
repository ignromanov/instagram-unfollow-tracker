import type { BuildOptions } from 'vite';

/**
 * Production build configuration with optimizations
 * - Source maps for debugging
 * - Terser minification with console.log removal
 * - Manual chunk splitting for optimal caching
 */
export const buildConfig: BuildOptions = {
  // Enable source maps for detailed bundle analysis
  sourcemap: true,
  // Optimize bundle size while keeping source maps
  minify: 'terser',
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
    external: id => {
      return id.includes('.test.') || id.includes('.spec.') || id.includes('__tests__');
    },
    output: {
      // Manual chunk splitting for better caching
      // Note: react/react-dom excluded - they're externalized during SSR build
      manualChunks: id => {
        // Only split chunks for client build
        if (id.includes('node_modules')) {
          // Radix primitives and slots (shared dependencies) go to core
          if (
            id.includes('@radix-ui/primitive') ||
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
            id.includes('@radix-ui/react-popper')
          ) {
            return 'radix-core';
          }

          // Dialog-related (alert-dialog depends on dialog)
          if (
            id.includes('@radix-ui/react-dialog') ||
            id.includes('@radix-ui/react-alert-dialog')
          ) {
            return 'radix-dialog';
          }

          // Dropdown menu
          if (id.includes('@radix-ui/react-dropdown-menu') || id.includes('@radix-ui/react-menu')) {
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
};

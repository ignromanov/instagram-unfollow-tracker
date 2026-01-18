import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import { initI18n } from './locales';
import { loadUmami } from './lib/umami-loader';
import './styles.css';

/**
 * Hydration Error Handler
 *
 * React 18's hydrateRoot calls onRecoverableError when:
 * - Text content doesn't match (#425)
 * - DOM structure doesn't match (#418)
 * - Hydration fails and React recovers via client render (#422)
 *
 * This handler logs detailed information to help identify the source.
 */
function handleHydrationError(error: unknown, errorInfo?: { componentStack?: string }): void {
  // Only log in browser (not during SSG build)
  if (typeof window === 'undefined') return;

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check if this is a hydration error
  const isHydrationError =
    errorMessage.includes('Hydration') ||
    errorMessage.includes('hydrat') ||
    errorMessage.includes('Text content') ||
    errorMessage.includes('did not match') ||
    errorMessage.includes('#418') ||
    errorMessage.includes('#422') ||
    errorMessage.includes('#425');

  if (isHydrationError) {
    console.group(
      '%c🔥 REACT HYDRATION ERROR',
      'background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
    );
    console.error('Error:', errorMessage);

    if (errorInfo?.componentStack) {
      console.groupCollapsed('%cComponent Stack:', 'font-weight: bold; color: #4ecdc4;');
      console.log(errorInfo.componentStack);
      console.groupEnd();
    }

    // Log helpful debugging tips
    console.log('%c💡 Common causes:', 'font-weight: bold; color: #ffe66d;');
    console.log('  1. Client-only values (Date.now(), Math.random(), localStorage)');
    console.log('  2. Browser extensions modifying DOM');
    console.log('  3. Different content during SSG vs client render');
    console.log('  4. Conditional rendering based on window/document');
    console.log('  5. Radix UI components with auto-generated IDs');
    console.log('\n%c🔍 Debug steps:', 'font-weight: bold; color: #4ecdc4;');
    console.log('  1. Run: printHydrationSummary() in console');
    console.log('  2. Check wrapped components with <HydrationDebugger>');
    console.log('  3. Look for "mounted" state guards in components');
    console.groupEnd();

    // Store in global array for later inspection
    if (!window.__HYDRATION_ERRORS__) {
      window.__HYDRATION_ERRORS__ = [];
    }
    window.__HYDRATION_ERRORS__.push({
      message: errorMessage,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Non-hydration errors - just log normally
    console.error('Recoverable error:', error);
  }
}

// Type augmentation for global window
declare global {
  interface Window {
    __HYDRATION_ERRORS__: Array<{
      message: string;
      componentStack?: string;
      timestamp: string;
    }>;
  }
}

/**
 * SSG Entry Point
 *
 * ViteReactSSG handles:
 * - Static site generation at build time
 * - Client-side hydration
 * - React Router integration
 *
 * Routes are prerendered based on routes.tsx configuration
 * ThemeProvider is applied in Layout component
 */
export const createRoot = ViteReactSSG(
  {
    routes,
    basename: import.meta.env.BASE_URL,
    // React Router v7 future flags
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  },
  async ({ isClient }) => {
    // Initialize i18n
    // - SSG (isClient=false): Loads ALL languages for prerendering
    // - Client (isClient=true): Loads only the language from URL
    await initI18n({ isClient });

    // Client-side only initialization
    if (isClient) {
      // Set up hydration error detection
      setupHydrationErrorDetection();

      // Load analytics (respects user opt-out)
      loadUmami();
    }
  }
);

/**
 * Set up global handlers to detect hydration errors
 *
 * Since vite-react-ssg doesn't expose onRecoverableError,
 * we intercept errors through:
 * 1. Global error event listener
 * 2. Patching console.error to capture React warnings
 */
function setupHydrationErrorDetection(): void {
  // Initialize storage
  window.__HYDRATION_ERRORS__ = [];

  // 1. Global error handler for uncaught errors
  window.addEventListener('error', event => {
    handleHydrationError(event.error || event.message);
  });

  // 2. Patch console.error to intercept React hydration warnings
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    // Call original first
    originalConsoleError.apply(console, args);

    // Check if this is a hydration-related error
    const message = args
      .map(arg => (typeof arg === 'string' ? arg : arg instanceof Error ? arg.message : ''))
      .join(' ');

    // React hydration errors contain these patterns
    if (
      message.includes('Hydration') ||
      message.includes('Text content does not match') ||
      message.includes('did not match') ||
      message.includes('server-rendered HTML') ||
      message.includes('#418') ||
      message.includes('#422') ||
      message.includes('#425') ||
      message.includes('Minified React error')
    ) {
      // Extract component stack if available (React passes it as a separate argument)
      const componentStack = args.find(
        arg => typeof arg === 'string' && arg.includes('\n    at ')
      ) as string | undefined;

      handleHydrationError(new Error(message), { componentStack });
    }
  };

  // Log that detection is active
  console.log(
    '%c🔍 Hydration error detection active',
    'background: #3498db; color: white; padding: 2px 6px; border-radius: 3px;',
    '\n  • Run printHydrationSummary() to see detected mismatches',
    '\n  • Check window.__HYDRATION_ERRORS__ for raw data'
  );
}

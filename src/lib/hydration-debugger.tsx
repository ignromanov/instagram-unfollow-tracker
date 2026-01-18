/**
 * Hydration Debugger Utility
 *
 * Helps identify React hydration mismatches by:
 * 1. Capturing SSR HTML before hydration
 * 2. Comparing with client-rendered HTML after hydration
 * 3. Logging differences to console with component context
 *
 * Usage:
 *   <HydrationDebugger name="Header">
 *     <Header />
 *   </HydrationDebugger>
 *
 * @see https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content
 */
import { useEffect, useRef, type ReactNode } from 'react';

interface HydrationDebuggerProps {
  /** Component name for logging */
  name: string;
  /** Children to wrap and monitor */
  children: ReactNode;
  /** Enable detailed diff (may be slow for large DOM) */
  detailed?: boolean;
}

interface HydrationMismatch {
  componentName: string;
  timestamp: string;
  ssrHtml: string;
  clientHtml: string;
  differences: string[];
}

// Store mismatches globally for inspection
declare global {
  interface Window {
    __HYDRATION_MISMATCHES__: HydrationMismatch[];
  }
}

/**
 * Initialize global storage for hydration mismatches
 */
function initMismatchStorage(): void {
  if (typeof window !== 'undefined' && !window.__HYDRATION_MISMATCHES__) {
    window.__HYDRATION_MISMATCHES__ = [];
  }
}

/**
 * Compare two HTML strings and return differences
 */
function findDifferences(ssrHtml: string, clientHtml: string): string[] {
  const differences: string[] = [];

  // Normalize whitespace for comparison
  const normalizedSsr = ssrHtml.replace(/\s+/g, ' ').trim();
  const normalizedClient = clientHtml.replace(/\s+/g, ' ').trim();

  if (normalizedSsr === normalizedClient) {
    return [];
  }

  // Check for common hydration issues
  if (ssrHtml.length !== clientHtml.length) {
    differences.push(`Length mismatch: SSR=${ssrHtml.length}, Client=${clientHtml.length}`);
  }

  // Check for data-reactroot or other React-specific attributes
  const reactIdRegex = /data-reactroot|data-react-checksum|:r[a-z0-9]+:/gi;
  const ssrReactIds = ssrHtml.match(reactIdRegex) || [];
  const clientReactIds = clientHtml.match(reactIdRegex) || [];
  if (ssrReactIds.length !== clientReactIds.length) {
    differences.push(
      `React ID count mismatch: SSR=${ssrReactIds.length}, Client=${clientReactIds.length}`
    );
  }

  // Check for class differences
  const classRegex = /class="([^"]*)"/gi;
  const ssrClasses = [...ssrHtml.matchAll(classRegex)].map(m => m[1]).sort();
  const clientClasses = [...clientHtml.matchAll(classRegex)].map(m => m[1]).sort();
  if (JSON.stringify(ssrClasses) !== JSON.stringify(clientClasses)) {
    differences.push('Class attribute differences detected');
  }

  // Check for style differences (often theme-related)
  const styleRegex = /style="([^"]*)"/gi;
  const ssrStyles = [...ssrHtml.matchAll(styleRegex)].map(m => m[1]);
  const clientStyles = [...clientHtml.matchAll(styleRegex)].map(m => m[1]);
  if (JSON.stringify(ssrStyles) !== JSON.stringify(clientStyles)) {
    differences.push('Style attribute differences detected');
  }

  // Find first character difference for debugging
  for (let i = 0; i < Math.min(ssrHtml.length, clientHtml.length); i++) {
    if (ssrHtml[i] !== clientHtml[i]) {
      const context = 50;
      const start = Math.max(0, i - context);
      const end = Math.min(ssrHtml.length, i + context);
      differences.push(
        `First diff at position ${i}:\n` +
          `  SSR:    "...${ssrHtml.slice(start, end)}..."\n` +
          `  Client: "...${clientHtml.slice(start, end)}..."`
      );
      break;
    }
  }

  return differences;
}

/**
 * Log mismatch with styling for better visibility
 */
function logMismatch(mismatch: HydrationMismatch): void {
  console.group(
    `%c🔥 HYDRATION MISMATCH: ${mismatch.componentName}`,
    'background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
  );
  console.log('%cTimestamp:', 'font-weight: bold;', mismatch.timestamp);
  console.log('%cDifferences:', 'font-weight: bold;', mismatch.differences);
  console.groupCollapsed('%cSSR HTML:', 'font-weight: bold; color: #4ecdc4;');
  console.log(mismatch.ssrHtml);
  console.groupEnd();
  console.groupCollapsed('%cClient HTML:', 'font-weight: bold; color: #ffe66d;');
  console.log(mismatch.clientHtml);
  console.groupEnd();
  console.log(
    '%c💡 Tip: Check for client-only values (dates, localStorage, random IDs)',
    'color: #a8a8a8; font-style: italic;'
  );
  console.groupEnd();
}

/**
 * HydrationDebugger Component
 *
 * Wraps children and monitors for hydration mismatches.
 * Only active in development/preview builds.
 */
export function HydrationDebugger({ name, children, detailed = false }: HydrationDebuggerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ssrHtmlRef = useRef<string | null>(null);
  const hasCheckedRef = useRef(false);

  // Capture SSR HTML on first render (before hydration completes)
  useEffect(() => {
    initMismatchStorage();

    if (hasCheckedRef.current || !containerRef.current) return;

    // Capture current HTML (should be SSR content)
    const currentHtml = containerRef.current.innerHTML;

    // Use MutationObserver to detect when React updates the DOM
    const observer = new MutationObserver(mutations => {
      if (hasCheckedRef.current) {
        observer.disconnect();
        return;
      }

      // Get the new HTML after React's update
      const newHtml = containerRef.current?.innerHTML || '';

      // Compare with captured SSR HTML
      if (ssrHtmlRef.current && newHtml !== ssrHtmlRef.current) {
        const differences = detailed
          ? findDifferences(ssrHtmlRef.current, newHtml)
          : ['HTML content changed during hydration (enable detailed mode for diff)'];

        if (differences.length > 0) {
          const mismatch: HydrationMismatch = {
            componentName: name,
            timestamp: new Date().toISOString(),
            ssrHtml: ssrHtmlRef.current,
            clientHtml: newHtml,
            differences,
          };

          window.__HYDRATION_MISMATCHES__.push(mismatch);
          logMismatch(mismatch);
        }
      }

      hasCheckedRef.current = true;
      observer.disconnect();
    });

    // Store initial HTML
    ssrHtmlRef.current = currentHtml;

    // Start observing
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    // Cleanup
    return () => observer.disconnect();
  }, [name, detailed]);

  return (
    <div ref={containerRef} data-hydration-debug={name}>
      {children}
    </div>
  );
}

/**
 * Hook to check if component has hydrated
 *
 * Usage:
 *   const hydrated = useHydrated();
 *   if (!hydrated) return <Placeholder />;
 *   return <ActualContent />;
 */
export function useHydrated(): boolean {
  const ref = useRef(false);

  useEffect(() => {
    ref.current = true;
  }, []);

  return ref.current;
}

/**
 * Get all logged hydration mismatches
 *
 * Usage in browser console:
 *   window.__HYDRATION_MISMATCHES__
 *   // or
 *   getHydrationMismatches()
 */
export function getHydrationMismatches(): HydrationMismatch[] {
  if (typeof window === 'undefined') return [];
  return window.__HYDRATION_MISMATCHES__ || [];
}

/**
 * Print a summary of all hydration mismatches
 *
 * Usage in browser console:
 *   printHydrationSummary()
 */
export function printHydrationSummary(): void {
  const mismatches = getHydrationMismatches();

  if (mismatches.length === 0) {
    console.log(
      '%c✅ No hydration mismatches detected!',
      'background: #2ecc71; color: white; padding: 4px 8px; border-radius: 4px;'
    );
    return;
  }

  console.group(
    `%c⚠️ ${mismatches.length} Hydration Mismatch(es) Found`,
    'background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
  );

  mismatches.forEach((m, i) => {
    console.log(`${i + 1}. ${m.componentName} - ${m.differences.length} difference(s)`);
  });

  console.log('\n%cRun getHydrationMismatches() for full details', 'color: #a8a8a8;');
  console.groupEnd();
}

// Export for browser console access
if (typeof window !== 'undefined') {
  (window as any).getHydrationMismatches = getHydrationMismatches;

  (window as any).printHydrationSummary = printHydrationSummary;
}

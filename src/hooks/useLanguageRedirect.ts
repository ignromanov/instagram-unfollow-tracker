import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { detectLanguageFromPathname, NON_ENGLISH_LANGUAGES } from '@/config/languages';

/**
 * Sync Zustand store language with URL
 *
 * NOTE: Actual redirect logic is now in index.html (early script)
 * This hook only syncs store for persistence, NOT for redirecting.
 *
 * The early redirect in index.html runs BEFORE React loads, which:
 * 1. Avoids hydration mismatch (no React to mismatch with)
 * 2. User gets correct SSG HTML immediately
 * 3. No flash of wrong language content
 *
 * This hook handles:
 * - Syncing store.language when URL changes (for localStorage persistence)
 * - Edge case: user navigates via browser back/forward
 */
export function useLanguageRedirect(): void {
  const location = useLocation();
  const { language, setLanguage, _hasHydrated } = useAppStore();

  // Wait until client is mounted to avoid SSR issues
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Sync store with URL language
  useEffect(() => {
    // Wait for BOTH mount and store hydration
    if (!mounted || !_hasHydrated) return;

    // Detect language from current URL
    const urlLang = detectLanguageFromPathname(location.pathname);

    // Sync store if different (for localStorage persistence)
    if (urlLang !== language) {
      setLanguage(urlLang);
    }
  }, [mounted, location.pathname, language, setLanguage, _hasHydrated]);
}

// Re-export for backwards compatibility with tests
export { NON_ENGLISH_LANGUAGES };

import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { NON_ENGLISH_LANGUAGES } from '@/config/languages';

/**
 * Redirect from language-less paths to user's preferred language
 *
 * Uses useLayoutEffect to redirect BEFORE paint — user won't see wrong content.
 *
 * Flow:
 * 1. User visits /wizard (no language prefix)
 * 2. Store has language: 'ru' from previous session
 * 3. Redirect to /ru/wizard BEFORE any content is painted
 *
 * Examples:
 * - / → /ru/ (if store.language = 'ru')
 * - /wizard → /ru/wizard
 * - /es/wizard → no redirect (explicit language choice)
 * - /wizard → /wizard (if store.language = 'en', English is default)
 */
export function useLanguageRedirect(): void {
  const location = useLocation();
  const { language, _hasHydrated } = useAppStore();

  // useLayoutEffect runs synchronously before paint
  useLayoutEffect(() => {
    // Wait for store hydration (language loaded from localStorage)
    if (!_hasHydrated) return;

    // Check if path already has language prefix
    const hasLangPrefix = NON_ENGLISH_LANGUAGES.some(
      lang => location.pathname === `/${lang}` || location.pathname.startsWith(`/${lang}/`)
    );

    // If no language prefix and user prefers non-English → redirect
    if (!hasLangPrefix && language !== 'en') {
      const newPath = `/${language}${location.pathname}`;
      window.location.href = newPath;
    }
  }, [location.pathname, language, _hasHydrated]);
}

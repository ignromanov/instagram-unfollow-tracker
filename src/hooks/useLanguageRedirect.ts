import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { detectBrowserLanguage, NON_ENGLISH_LANGUAGES } from '@/config/languages';

/** localStorage key to track if user has visited before */
const VISITED_KEY = 'unfollow-radar-visited';

/**
 * Redirect from language-less paths to user's preferred language
 *
 * Uses useLayoutEffect to redirect BEFORE paint — user won't see wrong content.
 *
 * Flow:
 * 1. If URL already has language prefix → do nothing (explicit choice)
 * 2. If first visit (no localStorage key) → detect browser language, redirect if not English
 * 3. If returning user → use stored Zustand preference
 *
 * Examples:
 * - / → /ru/ (first visit, browser language is Russian)
 * - /wizard → /es/wizard (returning user, store.language = 'es')
 * - /es/wizard → no redirect (explicit language choice in URL)
 * - /wizard → /wizard (if detected/stored language = 'en', English is default)
 */
export function useLanguageRedirect(): void {
  const location = useLocation();
  const { language, setLanguage, _hasHydrated } = useAppStore();

  // useLayoutEffect runs synchronously before paint
  useLayoutEffect(() => {
    // Wait for store hydration (language loaded from localStorage)
    if (!_hasHydrated) return;

    // Check if path already has language prefix
    const hasLangPrefix = NON_ENGLISH_LANGUAGES.some(
      lang => location.pathname === `/${lang}` || location.pathname.startsWith(`/${lang}/`)
    );

    // If URL has explicit language prefix, respect it
    if (hasLangPrefix) return;

    // Determine target language
    let targetLanguage = language;

    // First visit: detect from browser and persist
    const isFirstVisit = !localStorage.getItem(VISITED_KEY);
    if (isFirstVisit) {
      targetLanguage = detectBrowserLanguage();
      // Mark as visited and persist detected language
      localStorage.setItem(VISITED_KEY, 'true');
      if (targetLanguage !== language) {
        setLanguage(targetLanguage);
      }
    }

    // Redirect if target language is not English
    if (targetLanguage !== 'en') {
      const newPath = `/${targetLanguage}${location.pathname}`;
      window.location.href = newPath;
    }
  }, [location.pathname, language, setLanguage, _hasHydrated]);
}

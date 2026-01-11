import { useEffect } from 'react';
import { useAppStore, type SupportedLanguage } from '@/lib/store';
import i18n, { SUPPORTED_LANGUAGES, loadLanguage } from '@/locales';

const BASE_URL = 'https://instagram-unfollow-tracker.vercel.app';

/**
 * Detects the best matching language from browser preferences
 */
function detectBrowserLanguage(): SupportedLanguage {
  // Get browser languages (e.g., ['ru-RU', 'en-US', 'en'])
  const browserLanguages = navigator.languages ?? [navigator.language];

  for (const browserLang of browserLanguages) {
    // Extract base language code (e.g., 'ru-RU' -> 'ru')
    const baseLang = browserLang?.split('-')[0]?.toLowerCase();

    // Check if we support this language
    if (baseLang && SUPPORTED_LANGUAGES.includes(baseLang as SupportedLanguage)) {
      return baseLang as SupportedLanguage;
    }
  }

  // Default to English
  return 'en';
}

/**
 * Updates the HTML lang attribute
 */
function updateHtmlLang(lang: SupportedLanguage): void {
  document.documentElement.lang = lang;
}

/**
 * Updates or creates hreflang link tags for SEO
 * These help search engines understand language variants of the page
 */
function updateHreflangTags(currentLang: SupportedLanguage): void {
  // Remove existing hreflang tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

  const head = document.head;

  // Add hreflang for each supported language
  for (const lang of SUPPORTED_LANGUAGES) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    // Use hash-based language switching (SPA approach)
    link.href = `${BASE_URL}/?lang=${lang}`;
    head.appendChild(link);
  }

  // Add x-default (for users without language preference)
  const xDefault = document.createElement('link');
  xDefault.rel = 'alternate';
  xDefault.hreflang = 'x-default';
  xDefault.href = BASE_URL;
  head.appendChild(xDefault);

  // Update canonical to include language if not English
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute(
      'href',
      currentLang === 'en' ? BASE_URL + '/' : `${BASE_URL}/?lang=${currentLang}`
    );
  }
}

/**
 * Updates Open Graph locale meta tag
 */
function updateOgLocale(lang: SupportedLanguage): void {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en_US',
    es: 'es_ES',
    pt: 'pt_BR',
    hi: 'hi_IN',
    id: 'id_ID',
    tr: 'tr_TR',
    ja: 'ja_JP',
    ru: 'ru_RU',
    de: 'de_DE',
  };

  let ogLocale = document.querySelector('meta[property="og:locale"]');
  if (!ogLocale) {
    ogLocale = document.createElement('meta');
    ogLocale.setAttribute('property', 'og:locale');
    document.head.appendChild(ogLocale);
  }
  ogLocale.setAttribute('content', localeMap[lang]);
}

/**
 * Hook to synchronize language across the application
 *
 * Responsibilities:
 * 1. Detect browser language on first visit
 * 2. Sync Zustand store with i18next
 * 3. Update HTML lang attribute
 * 4. Manage hreflang tags for SEO
 * 5. Handle ?lang= URL parameter
 */
export function useLanguageSync(): void {
  const { language, setLanguage, _hasHydrated } = useAppStore();

  // Handle initial language detection and URL parameter
  useEffect(() => {
    if (!_hasHydrated) return;

    // Check for ?lang= URL parameter (allows direct linking to language)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') as SupportedLanguage | null;

    if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) {
      // URL parameter takes priority
      if (urlLang !== language) {
        setLanguage(urlLang);
      }
      // Clean up URL (remove ?lang= after applying)
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
      return;
    }

    // Check if this is first visit (language was never explicitly set)
    // We detect this by checking if localStorage has our store with language
    const storedData = localStorage.getItem('unfollow-radar-store');
    const isFirstVisit = !storedData || !JSON.parse(storedData).state?.language;

    if (isFirstVisit) {
      // Detect browser language and set it
      const browserLang = detectBrowserLanguage();
      if (browserLang !== 'en') {
        setLanguage(browserLang);
      }
    }
  }, [_hasHydrated, language, setLanguage]);

  // Sync HTML attributes and meta tags when language changes
  useEffect(() => {
    if (!_hasHydrated) return;

    // Update HTML lang attribute
    updateHtmlLang(language);

    // Update hreflang tags for SEO
    updateHreflangTags(language);

    // Update Open Graph locale
    updateOgLocale(language);

    // Ensure i18next is synced
    if (i18n.language !== language) {
      loadLanguage(language).then(() => {
        i18n.changeLanguage(language);
      });
    }
  }, [language, _hasHydrated]);
}

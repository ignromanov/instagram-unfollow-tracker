import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import i18n, { SUPPORTED_LANGUAGES, loadLanguage, type SupportedLanguage } from '@/locales';
import { NON_ENGLISH_LANGUAGES, getLocaleCode } from '@/config/languages';

const BASE_URL = 'https://safeunfollow.app';

/**
 * Updates the HTML lang attribute
 */
function updateHtmlLang(lang: SupportedLanguage): void {
  document.documentElement.lang = lang;
}

/**
 * Removes language prefix from path
 * E.g., /es/wizard -> /wizard, /ru/ -> /
 */
function getPathWithoutLang(pathname: string): string {
  for (const lang of NON_ENGLISH_LANGUAGES) {
    const prefix = `/${lang}`;
    if (pathname === prefix || pathname === `${prefix}/`) {
      return '/';
    }
    if (pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length);
    }
  }

  return pathname;
}

/**
 * Updates or creates hreflang link tags for SEO
 */
function updateHreflangTags(currentPath: string): void {
  // Remove existing hreflang tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

  const head = document.head;

  // Get base path without language prefix (dynamically from SUPPORTED_LANGUAGES)
  const pathWithoutLang = getPathWithoutLang(currentPath);

  // Add hreflang for each supported language
  for (const lang of SUPPORTED_LANGUAGES) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    // English uses root path, others use language prefix
    link.href =
      lang === 'en' ? `${BASE_URL}${pathWithoutLang}` : `${BASE_URL}/${lang}${pathWithoutLang}`;
    head.appendChild(link);
  }

  // Add x-default (for users without language preference)
  const xDefault = document.createElement('link');
  xDefault.rel = 'alternate';
  xDefault.hreflang = 'x-default';
  xDefault.href = `${BASE_URL}${pathWithoutLang}`;
  head.appendChild(xDefault);
}

/**
 * Updates Open Graph locale meta tag
 */
function updateOgLocale(lang: SupportedLanguage): void {
  let ogLocale = document.querySelector('meta[property="og:locale"]');
  if (!ogLocale) {
    ogLocale = document.createElement('meta');
    ogLocale.setAttribute('property', 'og:locale');
    document.head.appendChild(ogLocale);
  }
  ogLocale.setAttribute('content', getLocaleCode(lang));
}

/**
 * Updates canonical URL based on current path
 */
function updateCanonical(currentPath: string): void {
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', `${BASE_URL}${currentPath}`);
  }
}

/**
 * Hook to sync language from URL path prefix
 *
 * URL is the single source of truth for language.
 * This hook:
 * 1. Syncs Zustand store with URL language
 * 2. Updates HTML attributes (lang, dir)
 * 3. Updates SEO meta tags (hreflang, og:locale, canonical)
 *
 * URL structure:
 * - / (English, default)
 * - /es (Spanish)
 * - /ru (Russian)
 * - /es/wizard (Spanish wizard page)
 */
export function useLanguageFromPath(langFromRoute?: SupportedLanguage): void {
  const location = useLocation();
  const { language, setLanguage } = useAppStore();

  // Sync store with URL language
  useEffect(() => {
    let detectedLang: SupportedLanguage = 'en';

    if (langFromRoute) {
      detectedLang = langFromRoute;
    } else {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const firstSegment = pathSegments[0];

      if (firstSegment && SUPPORTED_LANGUAGES.includes(firstSegment as SupportedLanguage)) {
        detectedLang = firstSegment as SupportedLanguage;
      }
    }

    // Update store if language changed
    if (detectedLang !== language) {
      setLanguage(detectedLang);
    }
  }, [location.pathname, langFromRoute, language, setLanguage]);

  // Sync HTML attributes and meta tags
  useEffect(() => {
    // Update HTML lang attribute
    updateHtmlLang(language);

    // Update hreflang tags for SEO
    updateHreflangTags(location.pathname);

    // Update Open Graph locale
    updateOgLocale(language);

    // Update canonical URL
    updateCanonical(location.pathname);

    // Ensure i18next is synced
    if (i18n.language !== language) {
      loadLanguage(language);
    }
  }, [language, location.pathname]);
}

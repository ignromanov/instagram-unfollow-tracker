import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import i18n, { SUPPORTED_LANGUAGES, loadLanguage, type SupportedLanguage } from '@/locales';
import {
  NON_ENGLISH_LANGUAGES,
  getLocaleCode,
  detectLanguageFromPathname,
} from '@/config/languages';

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
 * URL is the SINGLE SOURCE OF TRUTH for language.
 *
 * This hook:
 * 1. Detects language from URL
 * 2. Updates store (for persistence/redirect on next visit)
 * 3. Syncs i18next with URL language
 * 4. Updates HTML attributes and SEO meta tags
 *
 * IMPORTANT: i18n syncs with URL, NOT with store.
 * Store is only used for persisting preference for future redirects.
 */
export function useLanguageFromPath(langFromRoute?: SupportedLanguage): void {
  const location = useLocation();
  const { setLanguage } = useAppStore();

  // Detect language from URL (single source of truth)
  const urlLang = langFromRoute ?? detectLanguageFromPathname(location.pathname);

  // Update store when URL language changes (for persistence only)
  useEffect(() => {
    setLanguage(urlLang);
  }, [urlLang, setLanguage]);

  // Sync HTML attributes, meta tags, and i18next with URL language
  useEffect(() => {
    // Update HTML lang attribute
    updateHtmlLang(urlLang);

    // Update hreflang tags for SEO
    updateHreflangTags(location.pathname);

    // Update Open Graph locale
    updateOgLocale(urlLang);

    // Update canonical URL
    updateCanonical(location.pathname);

    // Sync i18next with URL (NOT store!)
    if (i18n.language !== urlLang) {
      loadLanguage(urlLang);
    }
  }, [urlLang, location.pathname]);
}

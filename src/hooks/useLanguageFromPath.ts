import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import i18n, { SUPPORTED_LANGUAGES, loadLanguage, type SupportedLanguage } from '@/locales';

const BASE_URL = 'https://instagram-unfollow-tracker.vercel.app';

/**
 * Updates the HTML lang attribute
 */
function updateHtmlLang(lang: SupportedLanguage): void {
  document.documentElement.lang = lang;
}

/**
 * Updates or creates hreflang link tags for SEO
 */
function updateHreflangTags(currentPath: string): void {
  // Remove existing hreflang tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

  const head = document.head;

  // Get base path without language prefix
  const pathWithoutLang = currentPath.replace(/^\/(es|pt|hi|id|tr|ja|ru|de)/, '') || '/';

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
 * URL structure:
 * - / (English, default)
 * - /es (Spanish)
 * - /ru (Russian)
 * - /es/wizard (Spanish wizard page)
 * - etc.
 */
export function useLanguageFromPath(langFromRoute?: SupportedLanguage): void {
  const location = useLocation();
  const { language, setLanguage, _hasHydrated } = useAppStore();

  // Extract language from path or use route prop
  useEffect(() => {
    if (!_hasHydrated) return;

    let detectedLang: SupportedLanguage = 'en';

    if (langFromRoute) {
      // Language passed from route definition
      detectedLang = langFromRoute;
    } else {
      // Extract from path: /es/wizard -> 'es'
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
  }, [location.pathname, langFromRoute, language, setLanguage, _hasHydrated]);

  // Sync HTML attributes and meta tags when language or path changes
  useEffect(() => {
    if (!_hasHydrated) return;

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
      loadLanguage(language).then(() => {
        i18n.changeLanguage(language);
      });
    }
  }, [language, location.pathname, _hasHydrated]);
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Re-export from shared config (single source of truth)
export {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  RTL_LANGUAGES,
  DEFAULT_LANGUAGE,
  detectLanguageFromUrl,
  type SupportedLanguage,
} from '@/config/languages';

import { detectLanguageFromUrl, type SupportedLanguage } from '@/config/languages';

// Track initialization state
let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Load resources for a specific language
 */
async function loadLanguageResources(lang: SupportedLanguage) {
  const [common, hero, wizard, upload, results, faq, howto, meta] = await Promise.all([
    import(`./${lang}/common.json`),
    import(`./${lang}/hero.json`),
    import(`./${lang}/wizard.json`),
    import(`./${lang}/upload.json`),
    import(`./${lang}/results.json`),
    import(`./${lang}/faq.json`),
    import(`./${lang}/howto.json`),
    import(`./${lang}/meta.json`),
  ]);

  return {
    common: common.default,
    hero: hero.default,
    wizard: wizard.default,
    upload: upload.default,
    results: results.default,
    faq: faq.default,
    howto: howto.default,
    meta: meta.default,
  };
}

/**
 * Initialize i18next with language detected from URL
 *
 * Key behavior:
 * - Detects language from URL pathname (e.g., /es/wizard → 'es')
 * - Loads both English (fallback) and target language resources
 * - Sets i18n to target language immediately (no FOUC)
 */
export async function initI18n(): Promise<void> {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Detect language from URL - this is the source of truth
    const urlLang = detectLanguageFromUrl();

    // Always load English as fallback
    const enResources = await loadLanguageResources('en');

    // Build initial resources
    const resources: Record<string, typeof enResources> = {
      en: enResources,
    };

    // If URL specifies non-English language, load it too
    if (urlLang !== 'en') {
      try {
        resources[urlLang] = await loadLanguageResources(urlLang);
      } catch (error) {
        console.error(`Failed to load language: ${urlLang}`, error);
        // Fall back to English if loading fails
      }
    }

    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        lng: urlLang, // Set language immediately from URL
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: ['common', 'hero', 'wizard', 'upload', 'results', 'faq', 'howto', 'meta'],
        interpolation: {
          escapeValue: false,
        },
        detection: {
          // Disable detection - URL is source of truth
          order: [],
          caches: [],
        },
      });

    isInitialized = true;
  })();

  return initPromise;
}

/**
 * Dynamically load language resources (lazy-loaded for navigation)
 */
export async function loadLanguage(lang: SupportedLanguage): Promise<void> {
  // Ensure i18n is initialized
  await initI18n();

  // Check if language is already loaded
  if (i18n.hasResourceBundle(lang, 'common')) {
    await i18n.changeLanguage(lang);
    return;
  }

  try {
    const resources = await loadLanguageResources(lang);

    // Add resources to i18next
    i18n.addResourceBundle(lang, 'common', resources.common);
    i18n.addResourceBundle(lang, 'hero', resources.hero);
    i18n.addResourceBundle(lang, 'wizard', resources.wizard);
    i18n.addResourceBundle(lang, 'upload', resources.upload);
    i18n.addResourceBundle(lang, 'results', resources.results);
    i18n.addResourceBundle(lang, 'faq', resources.faq);
    i18n.addResourceBundle(lang, 'howto', resources.howto);
    i18n.addResourceBundle(lang, 'meta', resources.meta);

    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error(`Failed to load language: ${lang}`, error);
    await i18n.changeLanguage('en');
  }
}

export default i18n;

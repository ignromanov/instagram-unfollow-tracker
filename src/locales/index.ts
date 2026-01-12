import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import for local use
import type { SupportedLanguage } from '@/config/languages';

// Re-export from shared config (single source of truth)
export {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  RTL_LANGUAGES,
  DEFAULT_LANGUAGE,
  type SupportedLanguage,
} from '@/config/languages';

// Track initialization state
let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize i18next with dynamic English resources
 * All languages (including EN) use dynamic imports for optimal code splitting
 */
export async function initI18n(): Promise<void> {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Dynamic imports for English (creates separate chunk)
    const [common, hero, wizard, upload, results, faq, howto] = await Promise.all([
      import('./en/common.json'),
      import('./en/hero.json'),
      import('./en/wizard.json'),
      import('./en/upload.json'),
      import('./en/results.json'),
      import('./en/faq.json'),
      import('./en/howto.json'),
    ]);

    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources: {
          en: {
            common: common.default,
            hero: hero.default,
            wizard: wizard.default,
            upload: upload.default,
            results: results.default,
            faq: faq.default,
            howto: howto.default,
          },
        },
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: ['common', 'hero', 'wizard', 'upload', 'results', 'faq', 'howto'],
        interpolation: {
          escapeValue: false,
        },
        detection: {
          // Path-based routing is the source of truth for language
          // Navigator is used for initial detection when no path prefix
          order: ['navigator'],
          caches: [], // Don't cache - path handles persistence
        },
      });

    isInitialized = true;
  })();

  return initPromise;
}

/**
 * Dynamically load language resources (lazy-loaded for all non-English languages)
 */
export async function loadLanguage(lang: SupportedLanguage): Promise<void> {
  // Ensure i18n is initialized
  await initI18n();

  // English is loaded during init
  if (lang === 'en') {
    await i18n.changeLanguage('en');
    return;
  }

  // Check if language is already loaded
  if (i18n.hasResourceBundle(lang, 'common')) {
    await i18n.changeLanguage(lang);
    return;
  }

  try {
    // Dynamic imports for lazy loading
    const [common, hero, wizard, upload, results, faq, howto] = await Promise.all([
      import(`./${lang}/common.json`),
      import(`./${lang}/hero.json`),
      import(`./${lang}/wizard.json`),
      import(`./${lang}/upload.json`),
      import(`./${lang}/results.json`),
      import(`./${lang}/faq.json`),
      import(`./${lang}/howto.json`),
    ]);

    // Add resources to i18next
    i18n.addResourceBundle(lang, 'common', common.default);
    i18n.addResourceBundle(lang, 'hero', hero.default);
    i18n.addResourceBundle(lang, 'wizard', wizard.default);
    i18n.addResourceBundle(lang, 'upload', upload.default);
    i18n.addResourceBundle(lang, 'results', results.default);
    i18n.addResourceBundle(lang, 'faq', faq.default);
    i18n.addResourceBundle(lang, 'howto', howto.default);

    // Change language
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error(`Failed to load language: ${lang}`, error);
    // Fallback to English
    await i18n.changeLanguage('en');
  }
}

export default i18n;

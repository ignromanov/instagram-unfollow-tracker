import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English resources (bundled)
import commonEN from './en/common.json';
import heroEN from './en/hero.json';
import wizardEN from './en/wizard.json';
import uploadEN from './en/upload.json';
import resultsEN from './en/results.json';
import faqEN from './en/faq.json';
import howtoEN from './en/howto.json';

export const SUPPORTED_LANGUAGES = ['en', 'es', 'pt', 'hi', 'id', 'tr', 'ja', 'ru', 'de'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  hi: 'हिन्दी',
  id: 'Indonesia',
  tr: 'Türkçe',
  ja: '日本語',
  ru: 'Русский',
  de: 'Deutsch',
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEN,
        hero: heroEN,
        wizard: wizardEN,
        upload: uploadEN,
        results: resultsEN,
        faq: faqEN,
        howto: howtoEN,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'hero', 'wizard', 'upload', 'results', 'faq', 'howto'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'unfollow-radar-language',
    },
  });

/**
 * Dynamically load language resources (lazy-loaded for non-English languages)
 */
export async function loadLanguage(lang: SupportedLanguage): Promise<void> {
  // English is already bundled
  if (lang === 'en') {
    return;
  }

  // Check if language is already loaded
  if (i18n.hasResourceBundle(lang, 'common')) {
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

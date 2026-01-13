import { vi } from 'vitest';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '../src/config/languages.js';

// Import real translation files
import commonEN from '../src/locales/en/common.json';
import faqEN from '../src/locales/en/faq.json';
import heroEN from '../src/locales/en/hero.json';
import howtoEN from '../src/locales/en/howto.json';
import resultsEN from '../src/locales/en/results.json';
import uploadEN from '../src/locales/en/upload.json';
import wizardEN from '../src/locales/en/wizard.json';

/**
 * Flatten nested JSON objects into dot-notation keys
 * Example: { foo: { bar: "baz" } } -> { "foo.bar": "baz" }
 */
function flattenTranslations(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      result[newKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenTranslations(value as Record<string, unknown>, newKey));
    }
  }

  return result;
}

// Build translations map per namespace
const translationsByNamespace: Record<string, Record<string, string>> = {
  common: flattenTranslations(commonEN),
  results: flattenTranslations(resultsEN),
  hero: flattenTranslations(heroEN),
  wizard: flattenTranslations(wizardEN),
  upload: flattenTranslations(uploadEN),
  faq: flattenTranslations(faqEN),
  howto: flattenTranslations(howtoEN),
};

// Build combined translations for default namespace
const allTranslations: Record<string, string> = {
  ...translationsByNamespace.common,
  ...translationsByNamespace.results,
  ...translationsByNamespace.hero,
  ...translationsByNamespace.wizard,
  ...translationsByNamespace.upload,
  ...translationsByNamespace.faq,
  ...translationsByNamespace.howto,
};

/**
 * Setup i18n mocks for react-i18next and @/locales
 * Provides real translations from JSON files for accurate testing
 */
export function setupI18nMocks() {
  // Mock react-i18next with real translations
  vi.mock('react-i18next', () => ({
    useTranslation: (ns?: string) => {
      // Get translations for specific namespace or all translations
      const translations =
        ns && translationsByNamespace[ns] ? translationsByNamespace[ns] : allTranslations;

      return {
        t: (key: string, options?: Record<string, unknown>) => {
          let template = translations[key] || key;

          // Handle interpolation
          if (options && typeof options === 'object') {
            Object.entries(options).forEach(([k, v]) => {
              // Handle patterns like {{count, number}} - format with locale
              template = template.replace(
                new RegExp(`\\{\\{${k},\\s*number\\}\\}`, 'g'),
                typeof v === 'number' ? v.toLocaleString('en-US') : String(v)
              );
              // Handle simple {{key}} patterns
              template = template.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
            });
          }

          return template;
        },
        i18n: {
          language: 'en',
          changeLanguage: vi.fn().mockResolvedValue(undefined),
        },
      };
    },
    Trans: ({ children }: { children: React.ReactNode }) => children,
    initReactI18next: {
      type: '3rdParty',
      init: vi.fn(),
    },
  }));

  // Mock the locales module to prevent i18next initialization issues in tests
  // Uses real language constants from src/config/languages.ts
  vi.mock('@/locales', () => ({
    default: {
      language: 'en',
      changeLanguage: vi.fn().mockResolvedValue(undefined),
      hasResourceBundle: vi.fn().mockReturnValue(true),
      addResourceBundle: vi.fn(),
    },
    SUPPORTED_LANGUAGES,
    LANGUAGE_NAMES,
    initI18n: vi.fn().mockResolvedValue(undefined),
    loadLanguage: vi.fn().mockResolvedValue(undefined),
  }));
}

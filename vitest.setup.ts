import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Import real translation files
import commonEN from './src/locales/en/common.json';
import resultsEN from './src/locales/en/results.json';
import heroEN from './src/locales/en/hero.json';
import wizardEN from './src/locales/en/wizard.json';
import uploadEN from './src/locales/en/upload.json';
import faqEN from './src/locales/en/faq.json';
import howtoEN from './src/locales/en/howto.json';

// Flatten nested JSON objects into dot-notation keys
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

// Build translations map from imported JSON files
const translations: Record<string, string> = {
  ...flattenTranslations(commonEN),
  ...flattenTranslations(resultsEN),
  ...flattenTranslations(heroEN),
  ...flattenTranslations(wizardEN),
  ...flattenTranslations(uploadEN),
  ...flattenTranslations(faqEN),
  ...flattenTranslations(howtoEN),
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
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
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock the locales module to prevent i18next initialization issues in tests
vi.mock('@/locales', () => ({
  default: {
    language: 'en',
    changeLanguage: vi.fn().mockResolvedValue(undefined),
    hasResourceBundle: vi.fn().mockReturnValue(true),
    addResourceBundle: vi.fn(),
  },
  SUPPORTED_LANGUAGES: ['en', 'es', 'pt', 'hi', 'id', 'tr', 'ja', 'ru', 'de'],
  LANGUAGE_NAMES: {
    en: 'English',
    es: 'Español',
    pt: 'Português',
    hi: 'हिन्दी',
    id: 'Indonesia',
    tr: 'Türkçe',
    ja: '日本語',
    ru: 'Русский',
    de: 'Deutsch',
  },
  initI18n: vi.fn().mockResolvedValue(undefined),
  loadLanguage: vi.fn().mockResolvedValue(undefined),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Fix for setimmediate package in test environment
if (typeof global.attachEvent === 'undefined') {
  global.attachEvent = () => {};
}

// Mock File with arrayBuffer method
global.File = class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content: string;

  constructor(chunks: string[], name: string, options: { type?: string } = {}) {
    this.name = name;
    this.size = chunks.join('').length;
    this.type = options.type || '';
    this.lastModified = Date.now();
    this.content = chunks.join('');
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    return encoder.encode(this.content).buffer;
  }

  async text(): Promise<string> {
    return this.content;
  }

  stream(): ReadableStream {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(this.content));
        controller.close();
      },
    });
  }
} as any;

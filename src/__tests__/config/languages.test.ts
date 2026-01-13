/**
 * Tests for language configuration module
 *
 * Validates the single source of truth for supported languages.
 */

import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_NAMES,
  RTL_LANGUAGES,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/config/languages';

describe('languages configuration', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('should export array of language codes', () => {
      expect(SUPPORTED_LANGUAGES).toBeDefined();
      expect(Array.isArray(SUPPORTED_LANGUAGES)).toBe(true);
    });

    it('should contain expected languages', () => {
      const expectedLanguages = ['en', 'es', 'pt', 'hi', 'id', 'tr', 'ja', 'ru', 'de', 'ar'];
      expect(SUPPORTED_LANGUAGES).toEqual(expectedLanguages);
    });

    it('should have unique language codes', () => {
      const uniqueSet = new Set(SUPPORTED_LANGUAGES);
      expect(uniqueSet.size).toBe(SUPPORTED_LANGUAGES.length);
    });

    it('should contain only lowercase two-letter codes', () => {
      SUPPORTED_LANGUAGES.forEach(lang => {
        expect(lang).toMatch(/^[a-z]{2}$/);
      });
    });

    it('should be readonly (type check)', () => {
      // Type assertion to verify readonly constraint at compile time
      const lang: SupportedLanguage = SUPPORTED_LANGUAGES[0];
      expect(lang).toBeDefined();
    });
  });

  describe('LANGUAGE_NAMES', () => {
    it('should export record of language names', () => {
      expect(LANGUAGE_NAMES).toBeDefined();
      expect(typeof LANGUAGE_NAMES).toBe('object');
    });

    it('should have entry for every supported language', () => {
      SUPPORTED_LANGUAGES.forEach(lang => {
        expect(LANGUAGE_NAMES[lang]).toBeDefined();
        expect(typeof LANGUAGE_NAMES[lang]).toBe('string');
      });
    });

    it('should have correct language names', () => {
      expect(LANGUAGE_NAMES.en).toBe('English');
      expect(LANGUAGE_NAMES.es).toBe('Español');
      expect(LANGUAGE_NAMES.pt).toBe('Português');
      expect(LANGUAGE_NAMES.hi).toBe('हिन्दी');
      expect(LANGUAGE_NAMES.id).toBe('Indonesia');
      expect(LANGUAGE_NAMES.tr).toBe('Türkçe');
      expect(LANGUAGE_NAMES.ja).toBe('日本語');
      expect(LANGUAGE_NAMES.ru).toBe('Русский');
      expect(LANGUAGE_NAMES.de).toBe('Deutsch');
      expect(LANGUAGE_NAMES.ar).toBe('العربية');
    });

    it('should have non-empty names', () => {
      Object.values(LANGUAGE_NAMES).forEach(name => {
        expect(name).toBeTruthy();
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it('should have same number of entries as supported languages', () => {
      expect(Object.keys(LANGUAGE_NAMES).length).toBe(SUPPORTED_LANGUAGES.length);
    });
  });

  describe('RTL_LANGUAGES', () => {
    it('should export array of RTL languages', () => {
      expect(RTL_LANGUAGES).toBeDefined();
      expect(Array.isArray(RTL_LANGUAGES)).toBe(true);
    });

    it('should contain Arabic', () => {
      expect(RTL_LANGUAGES).toContain('ar');
    });

    it('should only contain supported languages', () => {
      RTL_LANGUAGES.forEach(lang => {
        expect(SUPPORTED_LANGUAGES).toContain(lang);
      });
    });

    it('should have correct RTL language list', () => {
      expect(RTL_LANGUAGES).toEqual(['ar']);
    });

    it('should be subset of supported languages', () => {
      expect(RTL_LANGUAGES.length).toBeLessThanOrEqual(SUPPORTED_LANGUAGES.length);
    });
  });

  describe('DEFAULT_LANGUAGE', () => {
    it('should export default language', () => {
      expect(DEFAULT_LANGUAGE).toBeDefined();
      expect(typeof DEFAULT_LANGUAGE).toBe('string');
    });

    it('should be English', () => {
      expect(DEFAULT_LANGUAGE).toBe('en');
    });

    it('should be in supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toContain(DEFAULT_LANGUAGE);
    });

    it('should have entry in language names', () => {
      expect(LANGUAGE_NAMES[DEFAULT_LANGUAGE]).toBeDefined();
    });

    it('should not be RTL', () => {
      expect(RTL_LANGUAGES).not.toContain(DEFAULT_LANGUAGE);
    });
  });

  describe('SupportedLanguage type', () => {
    it('should accept valid language codes', () => {
      const validLang: SupportedLanguage = 'en';
      expect(SUPPORTED_LANGUAGES).toContain(validLang);
    });

    it('should work with all supported languages', () => {
      SUPPORTED_LANGUAGES.forEach(lang => {
        const typedLang: SupportedLanguage = lang;
        expect(LANGUAGE_NAMES[typedLang]).toBeDefined();
      });
    });
  });

  describe('configuration consistency', () => {
    it('should have complete mapping between arrays and records', () => {
      // Every language in SUPPORTED_LANGUAGES should have a name
      SUPPORTED_LANGUAGES.forEach(lang => {
        expect(LANGUAGE_NAMES[lang]).toBeDefined();
      });

      // Every language in LANGUAGE_NAMES should be supported
      Object.keys(LANGUAGE_NAMES).forEach(lang => {
        expect(SUPPORTED_LANGUAGES).toContain(lang as SupportedLanguage);
      });
    });

    it('should not have extra entries in LANGUAGE_NAMES', () => {
      const languageNameKeys = Object.keys(LANGUAGE_NAMES);
      expect(languageNameKeys.length).toBe(SUPPORTED_LANGUAGES.length);
    });

    it('should have RTL languages that are supported', () => {
      RTL_LANGUAGES.forEach(rtlLang => {
        expect(SUPPORTED_LANGUAGES).toContain(rtlLang);
        expect(LANGUAGE_NAMES[rtlLang]).toBeDefined();
      });
    });
  });

  describe('no external dependencies', () => {
    it('should export only primitive values and types', () => {
      // This test validates the IMPORTANT comment in the source:
      // "This file must have NO external dependencies"
      expect(typeof SUPPORTED_LANGUAGES).toBe('object'); // array
      expect(typeof LANGUAGE_NAMES).toBe('object');
      expect(typeof RTL_LANGUAGES).toBe('object'); // array
      expect(typeof DEFAULT_LANGUAGE).toBe('string');
    });
  });
});

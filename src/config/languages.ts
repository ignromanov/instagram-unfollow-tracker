/**
 * Shared language configuration
 *
 * Single source of truth for supported languages.
 * Used by: locales/index.ts, scripts/generate-sitemap.ts, routes.tsx
 *
 * IMPORTANT: This file must have NO external dependencies
 * to be importable from both src/ and scripts/
 */

export const SUPPORTED_LANGUAGES = [
  'en',
  'es',
  'pt',
  'hi',
  'id',
  'tr',
  'ja',
  'ru',
  'de',
  'ar',
] as const;

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
  ar: 'العربية',
};

/** RTL languages that require dir="rtl" attribute */
export const RTL_LANGUAGES: SupportedLanguage[] = ['ar'];

/** Default/fallback language */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * OpenGraph locale codes for each language
 * Format: language_COUNTRY (ISO 639-1 + ISO 3166-1 alpha-2)
 * Used for og:locale meta tags in SSG
 */
export const LOCALE_CODES: Record<SupportedLanguage, string> = {
  en: 'en_US',
  es: 'es_ES',
  pt: 'pt_BR',
  ru: 'ru_RU',
  de: 'de_DE',
  hi: 'hi_IN',
  ja: 'ja_JP',
  tr: 'tr_TR',
  id: 'id_ID',
  ar: 'ar_SA',
};

/**
 * Get locale code for a language
 * @param lang - Language code (e.g., 'es', 'ru')
 * @returns Locale code (e.g., 'es_ES', 'ru_RU')
 */
export function getLocaleCode(lang: string): string {
  return LOCALE_CODES[lang as SupportedLanguage] || 'en_US';
}

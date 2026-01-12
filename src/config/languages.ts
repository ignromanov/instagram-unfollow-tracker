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

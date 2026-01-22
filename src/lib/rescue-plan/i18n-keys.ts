import type { LossSeverity, AccountSize } from './types';

/**
 * i18n Key Generators for Rescue Plan Banner
 *
 * Generates translation keys based on severity and size segments.
 */

/** Get i18n key for title based on severity */
export function getTitleKey(severity: LossSeverity): string {
  return `rescue.${severity}.title`;
}

/** Get i18n key for subtitle based on severity and size */
export function getSubtitleKey(severity: LossSeverity, size: AccountSize): string {
  return `rescue.${severity}.subtitle.${size}`;
}

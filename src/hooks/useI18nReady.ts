import { useSyncExternalStore } from 'react';

import { isI18nReady, subscribeToI18nInit } from '@/locales';

/**
 * Hook to check if i18n is initialized and ready
 *
 * Uses useSyncExternalStore for proper React 18 concurrent mode support.
 * Returns true when i18n has loaded the correct language resources.
 */
export function useI18nReady(): boolean {
  return useSyncExternalStore(subscribeToI18nInit, isI18nReady, () => true);
}

/**
 * Environment-aware logger
 *
 * - error: Always logs (needed for production debugging)
 * - warn/info/debug: Dev mode only (keeps production clean)
 */

/* eslint-disable no-console */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log error messages (always, even in production)
   * Errors are critical for debugging user-reported issues
   */
  error: (...args: unknown[]) => {
    console.error('[App]', ...args);
  },

  /**
   * Log warning messages (only in dev mode)
   */
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('[App]', ...args);
  },

  /**
   * Log info messages (only in dev mode)
   */
  info: (...args: unknown[]) => {
    if (isDev) console.log('[App]', ...args);
  },

  /**
   * Log debug messages (only in dev mode)
   */
  debug: (...args: unknown[]) => {
    if (isDev) console.debug('[App]', ...args);
  },
};

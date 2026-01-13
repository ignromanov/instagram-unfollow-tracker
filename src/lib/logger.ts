/**
 * Environment-aware logger
 * Only logs in development mode to keep production builds clean
 */

/* eslint-disable no-console */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log error messages (only in dev mode)
   */
  error: (...args: unknown[]) => {
    if (isDev) console.error('[App]', ...args);
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

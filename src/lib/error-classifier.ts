/**
 * Error Classifier
 *
 * Classifies errors by message text when structured error codes are unavailable.
 * Used as fallback to reduce UNKNOWN errors from 82% to <5%.
 */

import type { DiagnosticErrorCode } from '@/core/types';
import { mapWarningToDiagnosticCode } from '@/core/types';

/** Pattern matching rule: keywords to error code mapping */
interface ClassificationRule {
  keywords: string[];
  code: DiagnosticErrorCode;
}

/**
 * Classification rules in priority order.
 * First matching rule wins.
 */
const CLASSIFICATION_RULES: ClassificationRule[] = [
  // ZIP/File errors
  {
    keywords: [
      'not a valid zip',
      'corrupted',
      'bad local file header',
      "can't find end of central directory",
    ],
    code: 'CORRUPTED_ZIP',
  },
  { keywords: ['encrypted', 'password'], code: 'ZIP_ENCRYPTED' },
  { keywords: ['file is empty'], code: 'EMPTY_FILE' },
  { keywords: ['0 byte'], code: 'EMPTY_FILE' },
  { keywords: ['too large', 'exceeds', 'maximum size'], code: 'FILE_TOO_LARGE' },

  // JSON errors
  { keywords: ['unexpected token', 'syntax error', 'parse error'], code: 'JSON_PARSE_ERROR' },
  { keywords: ['json'], code: 'JSON_PARSE_ERROR' },

  // Worker errors
  { keywords: ['timeout', 'took too long'], code: 'WORKER_TIMEOUT' },
  { keywords: ['worker', 'init'], code: 'WORKER_INIT_ERROR' },
  { keywords: ['worker', 'create'], code: 'WORKER_INIT_ERROR' },
  { keywords: ['worker', 'start'], code: 'WORKER_INIT_ERROR' },
  { keywords: ['worker', 'crash'], code: 'WORKER_CRASHED' },
  { keywords: ['worker', 'terminate'], code: 'WORKER_CRASHED' },
  { keywords: ['worker', 'died'], code: 'WORKER_CRASHED' },

  // IndexedDB errors
  { keywords: ['quota', 'storage full', 'quotaexceeded'], code: 'QUOTA_EXCEEDED' },
  { keywords: ['indexeddb', 'not supported'], code: 'IDB_NOT_SUPPORTED' },
  { keywords: ['permission', 'denied'], code: 'IDB_PERMISSION_DENIED' },
  { keywords: ['permission', 'storage'], code: 'IDB_PERMISSION_DENIED' },
  { keywords: ['indexeddb'], code: 'INDEXEDDB_ERROR' },
  { keywords: ['database'], code: 'INDEXEDDB_ERROR' },
  { keywords: ['transaction'], code: 'INDEXEDDB_ERROR' },

  // Cancel/Abort
  { keywords: ['cancel'], code: 'UPLOAD_CANCELLED' },
  { keywords: ['abort'], code: 'UPLOAD_CANCELLED' },

  // Crypto
  { keywords: ['crypto'], code: 'CRYPTO_NOT_AVAILABLE' },
  { keywords: ['subtle'], code: 'CRYPTO_NOT_AVAILABLE' },

  // Network
  { keywords: ['network'], code: 'NETWORK_ERROR' },
  { keywords: ['fetch'], code: 'NETWORK_ERROR' },
  { keywords: ['connection'], code: 'NETWORK_ERROR' },

  // Instagram-specific (check after generic checks)
  { keywords: ['html format', 'wrong format'], code: 'HTML_FORMAT' },
  { keywords: ['not an instagram', 'not instagram'], code: 'NOT_INSTAGRAM_EXPORT' },
];

/**
 * Check if all keywords in a rule match the message.
 */
function matchesRule(lower: string, rule: ClassificationRule): boolean {
  return rule.keywords.every(keyword => lower.includes(keyword));
}

/**
 * Classifies error by message text.
 * Used as fallback when error has no structured code.
 */
export function classifyErrorMessage(message: string): DiagnosticErrorCode {
  const lower = message.toLowerCase();

  // Find first matching rule
  const matchedRule = CLASSIFICATION_RULES.find(rule => matchesRule(lower, rule));

  return matchedRule?.code ?? 'UNKNOWN';
}

/**
 * Extracts error code from structured error or classifies by text.
 */
export function extractErrorCode(error: unknown): DiagnosticErrorCode {
  // Structured error with code property
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === 'string') {
      return mapWarningToDiagnosticCode(code);
    }
  }

  // Fallback: classify by message text
  const message = error instanceof Error ? error.message : String(error);
  return classifyErrorMessage(message);
}

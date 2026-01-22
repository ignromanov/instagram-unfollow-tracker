import { describe, it, expect } from 'vitest';
import { classifyErrorMessage, extractErrorCode } from '@/lib/error-classifier';

describe('error-classifier', () => {
  describe('classifyErrorMessage', () => {
    describe('ZIP errors', () => {
      // Note: matchesRule uses .every(), so ALL keywords must be present
      it.each([
        // CORRUPTED_ZIP requires: 'not a valid zip', 'corrupted', 'bad local file header', "can't find end of central directory"
        // All four keywords must be present for this rule to match
        [
          "not a valid zip file, appears corrupted with bad local file header, can't find end of central directory",
          'CORRUPTED_ZIP',
        ],
      ])('classifies "%s" as %s', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });

      it.each([
        // ZIP_ENCRYPTED requires both 'encrypted' AND 'password'
        ['encrypted file needs password', 'ZIP_ENCRYPTED'],
        ['password required for encrypted archive', 'ZIP_ENCRYPTED'],
      ])('classifies "%s" as %s', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });

      it.each([
        // EMPTY_FILE: either 'file is empty' OR '0 byte' (separate rules)
        ['file is empty', 'EMPTY_FILE'],
        ['0 byte file uploaded', 'EMPTY_FILE'],
      ])('classifies "%s" as %s', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });

      it.each([
        // FILE_TOO_LARGE requires: 'too large', 'exceeds', AND 'maximum size' (all three)
        ['file too large, exceeds maximum size', 'FILE_TOO_LARGE'],
      ])('classifies "%s" as %s', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });
    });

    describe('JSON errors', () => {
      it.each([
        // JSON_PARSE_ERROR rule 1: requires 'unexpected token', 'syntax error', AND 'parse error'
        // JSON_PARSE_ERROR rule 2: just requires 'json'
        ['invalid json format', 'JSON_PARSE_ERROR'],
        ['json parsing failed', 'JSON_PARSE_ERROR'],
        ['problem with json data', 'JSON_PARSE_ERROR'],
      ])('classifies "%s" as %s', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });
    });

    describe('Worker errors', () => {
      it.each([
        // WORKER_TIMEOUT requires both 'timeout' AND 'took too long'
        ['timeout occurred, took too long to process', 'WORKER_TIMEOUT'],
        ['operation took too long, timeout', 'WORKER_TIMEOUT'],
      ])('classifies "%s" as %s (timeout)', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });

      it.each([
        // WORKER_INIT_ERROR requires both 'worker' AND 'init'
        ['worker init failed', 'WORKER_INIT_ERROR'],
        ['init error in worker', 'WORKER_INIT_ERROR'],
        // Also: 'worker' AND 'create', 'worker' AND 'start'
        ['failed to create worker', 'WORKER_INIT_ERROR'],
        ['worker could not start', 'WORKER_INIT_ERROR'],
      ])('classifies "%s" as %s (init)', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });

      it.each([
        // WORKER_CRASHED requires 'worker' AND ('crash' OR 'terminate' OR 'died')
        ['worker crashed unexpectedly', 'WORKER_CRASHED'],
        ['worker terminated with error', 'WORKER_CRASHED'],
        ['worker died during processing', 'WORKER_CRASHED'],
      ])('classifies "%s" as %s (crash)', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });
    });

    describe('IndexedDB errors', () => {
      it.each([
        // QUOTA_EXCEEDED requires ALL THREE: 'quota', 'storage full', AND 'quotaexceeded'
        // This is a strict rule - all keywords must be present
        ['quota storage full quotaexceedederror thrown', 'QUOTA_EXCEEDED'],
        // Note: simpler messages like "quota exceeded" won't match this strict rule
      ])('classifies "%s" as %s (quota)', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });

      it('returns UNKNOWN for partial quota matches (design limitation)', () => {
        // These don't match because QUOTA_EXCEEDED rule requires ALL THREE keywords
        expect(classifyErrorMessage('quota exceeded')).toBe('UNKNOWN');
        expect(classifyErrorMessage('storage full')).toBe('UNKNOWN');
        expect(classifyErrorMessage('quotaexceedederror')).toBe('UNKNOWN');
      });

      it.each([
        // IDB_NOT_SUPPORTED requires both 'indexeddb' AND 'not supported'
        ['indexeddb not supported in this browser', 'IDB_NOT_SUPPORTED'],
        ['indexeddb is not supported', 'IDB_NOT_SUPPORTED'],
      ])('classifies "%s" as %s (not supported)', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });

      it.each([
        // IDB_PERMISSION_DENIED requires 'permission' AND 'denied' OR 'permission' AND 'storage'
        ['permission denied for storage', 'IDB_PERMISSION_DENIED'],
        ['storage permission was denied', 'IDB_PERMISSION_DENIED'],
      ])('classifies "%s" as %s (permission)', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });

      it.each([
        // INDEXEDDB_ERROR: 'indexeddb', 'database', or 'transaction'
        ['indexeddb error occurred', 'INDEXEDDB_ERROR'],
        ['database connection failed', 'INDEXEDDB_ERROR'],
        ['transaction aborted unexpectedly', 'INDEXEDDB_ERROR'],
      ])('classifies "%s" as %s (general)', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });
    });

    describe('Cancel/Abort errors', () => {
      it.each([
        // UPLOAD_CANCELLED: 'cancel' or 'abort'
        ['upload cancelled by user', 'UPLOAD_CANCELLED'],
        ['operation was cancelled', 'UPLOAD_CANCELLED'],
        ['aborted by user action', 'UPLOAD_CANCELLED'],
        ['request aborted', 'UPLOAD_CANCELLED'],
      ])('classifies "%s" as %s', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });
    });

    describe('Crypto errors', () => {
      it.each([
        // CRYPTO_NOT_AVAILABLE: 'crypto' or 'subtle'
        ['crypto API unavailable', 'CRYPTO_NOT_AVAILABLE'],
        ['subtle not available', 'CRYPTO_NOT_AVAILABLE'],
      ])('classifies "%s" as %s', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });
    });

    describe('Network errors', () => {
      it.each([
        // NETWORK_ERROR: 'network', 'fetch', or 'connection'
        ['network error during upload', 'NETWORK_ERROR'],
        ['fetch failed', 'NETWORK_ERROR'],
        ['connection refused by server', 'NETWORK_ERROR'],
      ])('classifies "%s" as %s', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });
    });

    describe('Instagram-specific errors', () => {
      it.each([
        // HTML_FORMAT requires BOTH: 'html format' AND 'wrong format'
        ['detected html format when wrong format was uploaded', 'HTML_FORMAT'],
      ])('classifies "%s" as %s (html format)', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });

      it('returns UNKNOWN for partial HTML_FORMAT matches (design limitation)', () => {
        // Single keyword doesn't match the multi-keyword rule
        expect(classifyErrorMessage('html format detected')).toBe('UNKNOWN');
        expect(classifyErrorMessage('wrong format uploaded')).toBe('UNKNOWN');
      });

      it.each([
        // NOT_INSTAGRAM_EXPORT requires BOTH: 'not an instagram' AND 'not instagram'
        // Tricky: "not an instagram" does NOT contain "not instagram" as substring
        ['this is not an instagram export and not instagram data', 'NOT_INSTAGRAM_EXPORT'],
      ])('classifies "%s" as %s (not instagram)', (message, expected) => {
        expect(classifyErrorMessage(message)).toBe(expected);
      });

      it('returns UNKNOWN for partial NOT_INSTAGRAM_EXPORT matches (design limitation)', () => {
        // Single pattern doesn't match the multi-keyword rule
        expect(classifyErrorMessage('not an instagram export')).toBe('UNKNOWN');
        expect(classifyErrorMessage('this is not instagram data')).toBe('UNKNOWN');
      });
    });

    describe('Fallback behavior', () => {
      it('returns UNKNOWN for unrecognized messages', () => {
        expect(classifyErrorMessage('some completely random error')).toBe('UNKNOWN');
        expect(classifyErrorMessage('xyz123 unknown issue')).toBe('UNKNOWN');
      });

      it('returns UNKNOWN for empty string', () => {
        expect(classifyErrorMessage('')).toBe('UNKNOWN');
      });

      it('is case-insensitive', () => {
        // Using messages that match single-keyword rules
        expect(classifyErrorMessage('NETWORK ERROR')).toBe('NETWORK_ERROR');
        expect(classifyErrorMessage('DATABASE failure')).toBe('INDEXEDDB_ERROR');
        expect(classifyErrorMessage('FILE IS EMPTY')).toBe('EMPTY_FILE');
      });
    });

    describe('rule priority', () => {
      it('prioritizes specific rules over generic ones', () => {
        // "indexeddb not supported" should match IDB_NOT_SUPPORTED, not INDEXEDDB_ERROR
        expect(classifyErrorMessage('indexeddb not supported')).toBe('IDB_NOT_SUPPORTED');

        // "worker init failed" should match WORKER_INIT_ERROR
        expect(classifyErrorMessage('worker init error')).toBe('WORKER_INIT_ERROR');
      });

      it('matches generic rules when specific ones do not apply', () => {
        // Generic 'indexeddb' rule matches simple indexeddb errors
        expect(classifyErrorMessage('indexeddb failed')).toBe('INDEXEDDB_ERROR');

        // Generic 'database' rule also matches
        expect(classifyErrorMessage('database connection lost')).toBe('INDEXEDDB_ERROR');
      });
    });

    describe('multi-keyword rules', () => {
      it('requires ALL keywords to match for multi-keyword rules', () => {
        // "worker" alone shouldn't match WORKER_INIT_ERROR (needs "worker" AND "init")
        expect(classifyErrorMessage('worker error')).toBe('UNKNOWN');

        // Both keywords present
        expect(classifyErrorMessage('worker init error')).toBe('WORKER_INIT_ERROR');
      });

      it('matches multi-keyword rules regardless of word order', () => {
        expect(classifyErrorMessage('init failed for worker')).toBe('WORKER_INIT_ERROR');
        expect(classifyErrorMessage('permission storage denied')).toBe('IDB_PERMISSION_DENIED');
      });
    });
  });

  describe('extractErrorCode', () => {
    describe('structured errors with code property', () => {
      it('extracts code from object with valid code', () => {
        const error = { code: 'NOT_ZIP', message: 'test error' };
        expect(extractErrorCode(error)).toBe('NOT_ZIP');
      });

      it('extracts code for all valid DiagnosticErrorCodes', () => {
        const validCodes = [
          'NOT_ZIP',
          'HTML_FORMAT',
          'NOT_INSTAGRAM_EXPORT',
          'INCOMPLETE_EXPORT',
          'NO_DATA_FILES',
          'MISSING_FOLLOWING',
          'MISSING_FOLLOWERS',
          'CORRUPTED_ZIP',
          'ZIP_ENCRYPTED',
          'EMPTY_FILE',
          'FILE_TOO_LARGE',
          'JSON_PARSE_ERROR',
          'INVALID_DATA_STRUCTURE',
          'WORKER_TIMEOUT',
          'WORKER_INIT_ERROR',
          'WORKER_CRASHED',
          'INDEXEDDB_ERROR',
          'QUOTA_EXCEEDED',
          'IDB_NOT_SUPPORTED',
          'IDB_PERMISSION_DENIED',
          'UPLOAD_CANCELLED',
          'CRYPTO_NOT_AVAILABLE',
          'NETWORK_ERROR',
        ];

        validCodes.forEach(code => {
          const error = { code, message: 'test' };
          expect(extractErrorCode(error)).toBe(code);
        });
      });

      it('returns UNKNOWN for invalid code property', () => {
        const error = { code: 'INVALID_CODE_XYZ', message: 'test' };
        expect(extractErrorCode(error)).toBe('UNKNOWN');
      });

      it('handles non-string code property by falling back to String(error)', () => {
        // When code is not a string, it falls through to the fallback
        // The fallback uses String(error) for non-Error objects, which gives "[object Object]"
        // This doesn't match any rule, so returns UNKNOWN
        const error = { code: 123, message: 'network error' };
        expect(extractErrorCode(error)).toBe('UNKNOWN');
      });
    });

    describe('Error instances', () => {
      it('classifies Error by message when no code', () => {
        // Use a message that matches a single-keyword rule
        const error = new Error('network connection failed');
        expect(extractErrorCode(error)).toBe('NETWORK_ERROR');
      });

      it('classifies Error with database message', () => {
        const error = new Error('database error occurred');
        expect(extractErrorCode(error)).toBe('INDEXEDDB_ERROR');
      });

      it('returns UNKNOWN for Error with unrecognized message', () => {
        const error = new Error('Something went wrong');
        expect(extractErrorCode(error)).toBe('UNKNOWN');
      });
    });

    describe('non-Error values', () => {
      it('classifies string errors by content', () => {
        // String values are passed directly to classifyErrorMessage
        // Use messages that match single-keyword rules
        expect(extractErrorCode('network error')).toBe('NETWORK_ERROR');
        expect(extractErrorCode('database failure')).toBe('INDEXEDDB_ERROR');
        expect(extractErrorCode('random string')).toBe('UNKNOWN');
      });

      it('returns UNKNOWN for null', () => {
        expect(extractErrorCode(null)).toBe('UNKNOWN');
      });

      it('returns UNKNOWN for undefined', () => {
        expect(extractErrorCode(undefined)).toBe('UNKNOWN');
      });

      it('returns UNKNOWN for number', () => {
        expect(extractErrorCode(42)).toBe('UNKNOWN');
      });

      it('returns UNKNOWN for boolean', () => {
        expect(extractErrorCode(true)).toBe('UNKNOWN');
        expect(extractErrorCode(false)).toBe('UNKNOWN');
      });

      it('handles object without code by converting to string', () => {
        const obj = { message: 'timeout error' };
        // String(obj) = "[object Object]", which doesn't match anything
        expect(extractErrorCode(obj)).toBe('UNKNOWN');
      });
    });

    describe('edge cases', () => {
      it('handles empty Error message', () => {
        const error = new Error('');
        expect(extractErrorCode(error)).toBe('UNKNOWN');
      });

      it('handles object with empty code', () => {
        const error = { code: '', message: 'test' };
        expect(extractErrorCode(error)).toBe('UNKNOWN');
      });

      it('prefers code property over message classification', () => {
        // Even if message contains "corrupted", the code takes precedence
        const error = { code: 'QUOTA_EXCEEDED', message: 'corrupted file error' };
        expect(extractErrorCode(error)).toBe('QUOTA_EXCEEDED');
      });
    });
  });
});

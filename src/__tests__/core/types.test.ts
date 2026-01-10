import { describe, it, expect } from 'vitest';
import {
  isTimeBadge,
  isBoolBadge,
  getTimestamp,
  hasBoolBadge,
  createUploadState,
  mapWarningToDiagnosticCode,
  createDiagnosticError,
  unixToISO,
  formatUnixHuman,
  type BadgeKey,
  type BadgeMap,
  type TimeBasedBadgeKey,
  type BooleanBadgeKey,
} from '@/core/types';

describe('types.ts utility functions', () => {
  describe('unixToISO', () => {
    it('should convert valid unix timestamp to ISO string', () => {
      const timestamp = 1700000000; // 2023-11-14T22:13:20.000Z
      const result = unixToISO(timestamp);

      expect(result).toBe('2023-11-14T22:13:20.000Z');
    });

    it('should return null for undefined input', () => {
      const result = unixToISO(undefined);
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = unixToISO(null as any);
      expect(result).toBeNull();
    });

    it('should return null for zero timestamp', () => {
      const result = unixToISO(0);
      expect(result).toBeNull();
    });

    it('should handle negative timestamps', () => {
      const timestamp = -1000;
      const result = unixToISO(timestamp);

      expect(result).toBe('1969-12-31T23:43:20.000Z');
    });

    it('should handle very large timestamps', () => {
      const timestamp = 4102444800; // Year 2100
      const result = unixToISO(timestamp);

      expect(result).toBe('2100-01-01T00:00:00.000Z');
    });

    it('should return null for invalid timestamp that causes Date error', () => {
      // Mock Date constructor to throw error
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args[0] === 999999999999999 * 1000) {
            throw new Error('Invalid date');
          }
          super(...(args as []));
        }
      } as any;

      const result = unixToISO(999999999999999);
      expect(result).toBeNull();

      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('formatUnixHuman', () => {
    it('should convert valid unix timestamp to human readable string', () => {
      const timestamp = 1700000000; // 2023-11-14T22:13:20.000Z
      const result = formatUnixHuman(timestamp);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('2023'); // Should contain year
    });

    it('should return null for undefined input', () => {
      const result = formatUnixHuman(undefined);
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = formatUnixHuman(null as any);
      expect(result).toBeNull();
    });

    it('should return null for zero timestamp', () => {
      const result = formatUnixHuman(0);
      expect(result).toBeNull();
    });

    it('should handle negative timestamps', () => {
      const timestamp = -1000;
      const result = formatUnixHuman(timestamp);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle very large timestamps', () => {
      const timestamp = 4102444800; // Year 2100
      const result = formatUnixHuman(timestamp);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // The exact format depends on locale, so just check it's a valid string
      expect(result).toMatch(/\d{4}/); // Should contain a 4-digit year
    });

    it('should return null for invalid timestamp that causes Date error', () => {
      // Mock Date constructor to throw error
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args[0] === 999999999999999 * 1000) {
            throw new Error('Invalid date');
          }
          super(...(args as []));
        }
      } as any;

      const result = formatUnixHuman(999999999999999);
      expect(result).toBeNull();

      // Restore original Date
      global.Date = originalDate;
    });

    it('should return null for invalid timestamp that causes toLocaleString error', () => {
      // Mock toLocaleString to throw error
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        toLocaleString(): string {
          throw new Error('Invalid locale');
        }
      } as any;

      const result = formatUnixHuman(1700000000);
      expect(result).toBeNull();

      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('edge cases', () => {
    it('should handle fractional timestamps', () => {
      const timestamp = 1700000000.5;
      const isoResult = unixToISO(timestamp);
      const humanResult = formatUnixHuman(timestamp);

      expect(isoResult).toBeTruthy();
      expect(humanResult).toBeTruthy();
    });

    it('should handle very small positive timestamps', () => {
      const timestamp = 1;
      const isoResult = unixToISO(timestamp);
      const humanResult = formatUnixHuman(timestamp);

      expect(isoResult).toBe('1970-01-01T00:00:01.000Z');
      expect(humanResult).toBeTruthy();
    });
  });
});

describe('Badge Type Guards', () => {
  describe('isTimeBadge', () => {
    const timeBadges: BadgeKey[] = [
      'following',
      'followers',
      'pending',
      'permanent',
      'restricted',
      'close',
      'unfollowed',
      'dismissed',
    ];

    it.each(timeBadges)('should return true for time badge: %s', badge => {
      expect(isTimeBadge(badge)).toBe(true);
    });

    const boolBadges: BadgeKey[] = ['notFollowingBack', 'notFollowedBack', 'mutuals'];

    it.each(boolBadges)('should return false for bool badge: %s', badge => {
      expect(isTimeBadge(badge)).toBe(false);
    });

    it('should narrow type correctly', () => {
      const badge: BadgeKey = 'following';
      if (isTimeBadge(badge)) {
        const timeBadge: TimeBasedBadgeKey = badge;
        expect(timeBadge).toBe('following');
      }
    });
  });

  describe('isBoolBadge', () => {
    const boolBadges: BadgeKey[] = ['notFollowingBack', 'notFollowedBack', 'mutuals'];

    it.each(boolBadges)('should return true for bool badge: %s', badge => {
      expect(isBoolBadge(badge)).toBe(true);
    });

    const timeBadges: BadgeKey[] = [
      'following',
      'followers',
      'pending',
      'permanent',
      'restricted',
      'close',
      'unfollowed',
      'dismissed',
    ];

    it.each(timeBadges)('should return false for time badge: %s', badge => {
      expect(isBoolBadge(badge)).toBe(false);
    });

    it('should narrow type correctly', () => {
      const badge: BadgeKey = 'mutuals';
      if (isBoolBadge(badge)) {
        const boolBadge: BooleanBadgeKey = badge;
        expect(boolBadge).toBe('mutuals');
      }
    });
  });

  describe('type guard completeness', () => {
    it('should cover all BadgeKey types', () => {
      const allBadges: BadgeKey[] = [
        'following',
        'followers',
        'pending',
        'permanent',
        'restricted',
        'close',
        'unfollowed',
        'dismissed',
        'notFollowingBack',
        'notFollowedBack',
        'mutuals',
      ];

      allBadges.forEach(badge => {
        const isTime = isTimeBadge(badge);
        const isBool = isBoolBadge(badge);
        expect(isTime !== isBool).toBe(true);
      });
    });
  });
});

describe('Badge Value Accessors', () => {
  describe('getTimestamp', () => {
    it('should return timestamp for existing time badge', () => {
      const badges: BadgeMap = {
        following: 1704067200,
        followers: 1704063600,
      };

      expect(getTimestamp(badges, 'following')).toBe(1704067200);
      expect(getTimestamp(badges, 'followers')).toBe(1704063600);
    });

    it('should return undefined for missing time badge', () => {
      const badges: BadgeMap = {
        following: 1704067200,
      };

      expect(getTimestamp(badges, 'pending')).toBeUndefined();
    });

    it('should handle all time badge types', () => {
      const badges: BadgeMap = {
        following: 1704067200,
        followers: 1704063600,
        pending: 1704060000,
        permanent: 1704056400,
        restricted: 1704052800,
        close: 1704049200,
        unfollowed: 1704045600,
        dismissed: 1704042000,
      };

      expect(getTimestamp(badges, 'following')).toBe(1704067200);
      expect(getTimestamp(badges, 'followers')).toBe(1704063600);
      expect(getTimestamp(badges, 'pending')).toBe(1704060000);
      expect(getTimestamp(badges, 'permanent')).toBe(1704056400);
      expect(getTimestamp(badges, 'restricted')).toBe(1704052800);
      expect(getTimestamp(badges, 'close')).toBe(1704049200);
      expect(getTimestamp(badges, 'unfollowed')).toBe(1704045600);
      expect(getTimestamp(badges, 'dismissed')).toBe(1704042000);
    });

    it('should return undefined for empty badges', () => {
      const badges: BadgeMap = {};
      expect(getTimestamp(badges, 'following')).toBeUndefined();
    });
  });

  describe('hasBoolBadge', () => {
    it('should return true for existing bool badge', () => {
      const badges: BadgeMap = {
        mutuals: true,
        notFollowingBack: true,
      };

      expect(hasBoolBadge(badges, 'mutuals')).toBe(true);
      expect(hasBoolBadge(badges, 'notFollowingBack')).toBe(true);
    });

    it('should return false for missing bool badge', () => {
      const badges: BadgeMap = {
        mutuals: true,
      };

      expect(hasBoolBadge(badges, 'notFollowingBack')).toBe(false);
    });

    it('should handle all bool badge types', () => {
      const badges: BadgeMap = {
        mutuals: true,
        notFollowingBack: true,
        notFollowedBack: true,
      };

      expect(hasBoolBadge(badges, 'mutuals')).toBe(true);
      expect(hasBoolBadge(badges, 'notFollowingBack')).toBe(true);
      expect(hasBoolBadge(badges, 'notFollowedBack')).toBe(true);
    });

    it('should return false for empty badges', () => {
      const badges: BadgeMap = {};
      expect(hasBoolBadge(badges, 'mutuals')).toBe(false);
    });
  });

  describe('mixed badge maps', () => {
    it('should handle badges with both time and bool values', () => {
      const badges: BadgeMap = {
        following: 1704067200,
        followers: 1704063600,
        mutuals: true,
        notFollowingBack: true,
      };

      expect(getTimestamp(badges, 'following')).toBe(1704067200);
      expect(getTimestamp(badges, 'followers')).toBe(1704063600);
      expect(hasBoolBadge(badges, 'mutuals')).toBe(true);
      expect(hasBoolBadge(badges, 'notFollowingBack')).toBe(true);
    });
  });
});

describe('UploadState Factory', () => {
  describe('createUploadState', () => {
    it('should create idle state', () => {
      const state = createUploadState('idle', null, null);

      expect(state).toEqual({
        status: 'idle',
        error: null,
        fileName: null,
      });
    });

    it('should create loading state with fileName', () => {
      const state = createUploadState('loading', 'test.zip', null);

      expect(state).toEqual({
        status: 'loading',
        error: null,
        fileName: 'test.zip',
      });
    });

    it('should create loading state with empty string if fileName is null', () => {
      const state = createUploadState('loading', null, null);

      expect(state).toEqual({
        status: 'loading',
        error: null,
        fileName: '',
      });
    });

    it('should create success state', () => {
      const state = createUploadState('success', 'test.zip', null);

      expect(state).toEqual({
        status: 'success',
        error: null,
        fileName: 'test.zip',
      });
    });

    it('should create success state with empty string if fileName is null', () => {
      const state = createUploadState('success', null, null);

      expect(state).toEqual({
        status: 'success',
        error: null,
        fileName: '',
      });
    });

    it('should create error state with message', () => {
      const state = createUploadState('error', 'test.zip', 'Invalid file');

      expect(state).toEqual({
        status: 'error',
        error: 'Invalid file',
        fileName: 'test.zip',
      });
    });

    it('should create error state with null fileName', () => {
      const state = createUploadState('error', null, 'Invalid file');

      expect(state).toEqual({
        status: 'error',
        error: 'Invalid file',
        fileName: null,
      });
    });

    it('should use default error message if null', () => {
      const state = createUploadState('error', null, null);

      expect(state).toEqual({
        status: 'error',
        error: 'Unknown error',
        fileName: null,
      });
    });
  });
});

describe('Diagnostic Error Mapping', () => {
  describe('mapWarningToDiagnosticCode', () => {
    it('should map known warning codes', () => {
      expect(mapWarningToDiagnosticCode('HTML_FORMAT')).toBe('HTML_FORMAT');
      expect(mapWarningToDiagnosticCode('NOT_INSTAGRAM_EXPORT')).toBe('NOT_INSTAGRAM_EXPORT');
      expect(mapWarningToDiagnosticCode('INCOMPLETE_EXPORT')).toBe('INCOMPLETE_EXPORT');
      expect(mapWarningToDiagnosticCode('NO_DATA_FILES')).toBe('NO_DATA_FILES');
      expect(mapWarningToDiagnosticCode('MISSING_FOLLOWING')).toBe('MISSING_FOLLOWING');
      expect(mapWarningToDiagnosticCode('MISSING_FOLLOWERS')).toBe('MISSING_FOLLOWERS');
    });

    it('should return UNKNOWN for unmapped codes', () => {
      expect(mapWarningToDiagnosticCode('SOME_RANDOM_CODE')).toBe('UNKNOWN');
      expect(mapWarningToDiagnosticCode('NOT_MAPPED')).toBe('UNKNOWN');
      expect(mapWarningToDiagnosticCode('')).toBe('UNKNOWN');
    });
  });

  describe('createDiagnosticError', () => {
    it('should create NOT_ZIP error', () => {
      const error = createDiagnosticError('NOT_ZIP');

      expect(error.code).toBe('NOT_ZIP');
      expect(error.title).toBe('Not a ZIP File');
      expect(error.icon).toBe('zip');
      expect(error.severity).toBe('error');
      expect(error.message).toContain('ZIP archive');
      expect(error.fix).toContain('.zip');
    });

    it('should create HTML_FORMAT error', () => {
      const error = createDiagnosticError('HTML_FORMAT');

      expect(error.code).toBe('HTML_FORMAT');
      expect(error.title).toBe('Wrong Format: HTML');
      expect(error.icon).toBe('html');
      expect(error.message).toContain('HTML format');
      expect(error.fix).toContain('JSON');
    });

    it('should create NOT_INSTAGRAM_EXPORT error', () => {
      const error = createDiagnosticError('NOT_INSTAGRAM_EXPORT');

      expect(error.code).toBe('NOT_INSTAGRAM_EXPORT');
      expect(error.title).toBe('Not an Instagram Export');
      expect(error.icon).toBe('folder');
      expect(error.message).toContain('Instagram data export');
    });

    it('should create INCOMPLETE_EXPORT error', () => {
      const error = createDiagnosticError('INCOMPLETE_EXPORT');

      expect(error.code).toBe('INCOMPLETE_EXPORT');
      expect(error.title).toBe('Incomplete Export');
      expect(error.severity).toBe('error');
      expect(error.message).toContain('Followers and following');
    });

    it('should create NO_DATA_FILES error', () => {
      const error = createDiagnosticError('NO_DATA_FILES');

      expect(error.code).toBe('NO_DATA_FILES');
      expect(error.title).toBe('No Follower Data Found');
      expect(error.icon).toBe('file');
    });

    it('should create MISSING_FOLLOWING warning', () => {
      const error = createDiagnosticError('MISSING_FOLLOWING');

      expect(error.code).toBe('MISSING_FOLLOWING');
      expect(error.severity).toBe('warning');
      expect(error.message).toContain('following.json');
    });

    it('should create MISSING_FOLLOWERS warning', () => {
      const error = createDiagnosticError('MISSING_FOLLOWERS');

      expect(error.code).toBe('MISSING_FOLLOWERS');
      expect(error.severity).toBe('warning');
      expect(error.message).toContain('followers_*.json');
    });

    it('should create UNKNOWN error', () => {
      const error = createDiagnosticError('UNKNOWN');

      expect(error.code).toBe('UNKNOWN');
      expect(error.title).toBe('Upload Error');
      expect(error.icon).toBe('unknown');
      expect(error.message).toContain('unexpected error');
    });

    it('should use custom message when provided', () => {
      const customMessage = 'Custom error message';
      const error = createDiagnosticError('NOT_ZIP', customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.title).toBe('Not a ZIP File');
    });

    it('should use custom message for UNKNOWN error', () => {
      const customMessage = 'Network timeout';
      const error = createDiagnosticError('UNKNOWN', customMessage);

      expect(error.message).toBe(customMessage);
    });

    it('should fall back to default message for UNKNOWN without custom message', () => {
      const error = createDiagnosticError('UNKNOWN');

      expect(error.message).toBe('An unexpected error occurred while processing your file.');
    });
  });
});

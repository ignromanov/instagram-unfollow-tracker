import { describe, it, expect } from 'vitest';
import { unixToISO, formatUnixHuman } from '@/core/types';

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

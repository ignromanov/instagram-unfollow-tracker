/**
 * Session Store Tests
 *
 * Tests for session-only state management (non-persisted transient state)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from '@/lib/session-store';
import type { ParseWarning, FileDiscovery } from '@/core/types';

describe('useSessionStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    const { clearSession } = useSessionStore.getState();
    clearSession();
  });

  describe('initial state', () => {
    it('should have empty parseWarnings array', () => {
      const { parseWarnings } = useSessionStore.getState();
      expect(parseWarnings).toEqual([]);
    });

    it('should have null fileDiscovery', () => {
      const { fileDiscovery } = useSessionStore.getState();
      expect(fileDiscovery).toBeNull();
    });

    it('should have zero upload progress', () => {
      const { uploadProgress, processedCount, totalCount } = useSessionStore.getState();
      expect(uploadProgress).toBe(0);
      expect(processedCount).toBe(0);
      expect(totalCount).toBe(0);
    });
  });

  describe('setParseWarnings', () => {
    it('should update parseWarnings array', () => {
      const warnings: ParseWarning[] = [
        {
          code: 'MISSING_FOLLOWING',
          message: 'following.json not found',
          severity: 'warning',
          fix: 'Re-request data',
        },
      ];

      const { setParseWarnings } = useSessionStore.getState();
      setParseWarnings(warnings);

      const { parseWarnings } = useSessionStore.getState();
      expect(parseWarnings).toEqual(warnings);
    });

    it('should handle multiple warnings', () => {
      const warnings: ParseWarning[] = [
        {
          code: 'MISSING_FOLLOWING',
          message: 'following.json not found',
          severity: 'warning',
        },
        {
          code: 'MISSING_FOLLOWERS',
          message: 'followers_*.json not found',
          severity: 'error',
        },
      ];

      const { setParseWarnings } = useSessionStore.getState();
      setParseWarnings(warnings);

      const { parseWarnings } = useSessionStore.getState();
      expect(parseWarnings).toHaveLength(2);
      expect(parseWarnings[0].code).toBe('MISSING_FOLLOWING');
      expect(parseWarnings[1].code).toBe('MISSING_FOLLOWERS');
    });

    it('should replace previous warnings', () => {
      const { setParseWarnings } = useSessionStore.getState();

      setParseWarnings([{ code: 'OLD', message: 'Old warning', severity: 'info' }]);

      const newWarnings: ParseWarning[] = [
        { code: 'NEW', message: 'New warning', severity: 'warning' },
      ];

      setParseWarnings(newWarnings);

      const { parseWarnings } = useSessionStore.getState();
      expect(parseWarnings).toHaveLength(1);
      expect(parseWarnings[0].code).toBe('NEW');
    });

    it('should handle empty array', () => {
      const { setParseWarnings } = useSessionStore.getState();

      setParseWarnings([{ code: 'TEST', message: 'Test', severity: 'info' }]);

      setParseWarnings([]);

      const { parseWarnings } = useSessionStore.getState();
      expect(parseWarnings).toEqual([]);
    });
  });

  describe('setFileDiscovery', () => {
    it('should update fileDiscovery object', () => {
      const discovery: FileDiscovery = {
        format: 'json',
        isInstagramExport: true,
        basePath: 'followers_and_following',
        files: [
          {
            name: 'following.json',
            description: 'Accounts you follow',
            required: true,
            found: true,
            itemCount: 100,
            foundPath: 'followers_and_following/following.json',
          },
        ],
      };

      const { setFileDiscovery } = useSessionStore.getState();
      setFileDiscovery(discovery);

      const { fileDiscovery } = useSessionStore.getState();
      expect(fileDiscovery).toEqual(discovery);
    });

    it('should handle HTML format discovery', () => {
      const discovery: FileDiscovery = {
        format: 'html',
        isInstagramExport: false,
        files: [],
      };

      const { setFileDiscovery } = useSessionStore.getState();
      setFileDiscovery(discovery);

      const { fileDiscovery } = useSessionStore.getState();
      expect(fileDiscovery?.format).toBe('html');
      expect(fileDiscovery?.isInstagramExport).toBe(false);
    });

    it('should handle unknown format', () => {
      const discovery: FileDiscovery = {
        format: 'unknown',
        isInstagramExport: false,
        files: [],
      };

      const { setFileDiscovery } = useSessionStore.getState();
      setFileDiscovery(discovery);

      const { fileDiscovery } = useSessionStore.getState();
      expect(fileDiscovery?.format).toBe('unknown');
    });

    it('should set to null', () => {
      const { setFileDiscovery } = useSessionStore.getState();

      setFileDiscovery({
        format: 'json',
        isInstagramExport: true,
        files: [],
      });

      setFileDiscovery(null);

      const { fileDiscovery } = useSessionStore.getState();
      expect(fileDiscovery).toBeNull();
    });
  });

  describe('setUploadProgress', () => {
    it('should update all progress fields', () => {
      const { setUploadProgress } = useSessionStore.getState();

      setUploadProgress(50, 5000, 10000);

      const { uploadProgress, processedCount, totalCount } = useSessionStore.getState();
      expect(uploadProgress).toBe(50);
      expect(processedCount).toBe(5000);
      expect(totalCount).toBe(10000);
    });

    it('should update progress from 0 to 100', () => {
      const { setUploadProgress } = useSessionStore.getState();

      setUploadProgress(0, 0, 10000);
      expect(useSessionStore.getState().uploadProgress).toBe(0);

      setUploadProgress(25, 2500, 10000);
      expect(useSessionStore.getState().uploadProgress).toBe(25);

      setUploadProgress(50, 5000, 10000);
      expect(useSessionStore.getState().uploadProgress).toBe(50);

      setUploadProgress(75, 7500, 10000);
      expect(useSessionStore.getState().uploadProgress).toBe(75);

      setUploadProgress(100, 10000, 10000);
      expect(useSessionStore.getState().uploadProgress).toBe(100);
    });

    it('should handle large account counts', () => {
      const { setUploadProgress } = useSessionStore.getState();

      setUploadProgress(45, 450000, 1000000);

      const { processedCount, totalCount } = useSessionStore.getState();
      expect(processedCount).toBe(450000);
      expect(totalCount).toBe(1000000);
    });

    it('should handle decimal progress values', () => {
      const { setUploadProgress } = useSessionStore.getState();

      setUploadProgress(33.33, 3333, 10000);

      const { uploadProgress } = useSessionStore.getState();
      expect(uploadProgress).toBe(33.33);
    });
  });

  describe('clearSession', () => {
    it('should reset all fields to initial state', () => {
      const { setParseWarnings, setFileDiscovery, setUploadProgress, clearSession } =
        useSessionStore.getState();

      // Set some state
      setParseWarnings([{ code: 'TEST', message: 'Test', severity: 'warning' }]);
      setFileDiscovery({
        format: 'json',
        isInstagramExport: true,
        files: [],
      });
      setUploadProgress(75, 7500, 10000);

      // Clear
      clearSession();

      // Verify reset
      const state = useSessionStore.getState();
      expect(state.parseWarnings).toEqual([]);
      expect(state.fileDiscovery).toBeNull();
      expect(state.uploadProgress).toBe(0);
      expect(state.processedCount).toBe(0);
      expect(state.totalCount).toBe(0);
    });

    it('should be idempotent', () => {
      const { clearSession } = useSessionStore.getState();

      clearSession();
      const state1 = useSessionStore.getState();

      clearSession();
      const state2 = useSessionStore.getState();

      expect(state1).toEqual(state2);
    });
  });

  describe('session isolation', () => {
    it('should not persist across page refresh (by design)', () => {
      // This test documents that session store doesn't use localStorage
      // The actual persistence behavior is tested in integration tests

      const { setParseWarnings, setUploadProgress } = useSessionStore.getState();

      setParseWarnings([{ code: 'TEST', message: 'Test', severity: 'info' }]);
      setUploadProgress(50, 5000, 10000);

      // Session store doesn't have persist middleware, so data lives in memory only
      // This is intentional - see session-store.ts comments
      expect(useSessionStore.persist).toBeUndefined();
    });
  });

  describe('concurrent updates', () => {
    it('should handle rapid progress updates', () => {
      const { setUploadProgress } = useSessionStore.getState();

      // Simulate rapid progress updates
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i, i * 100, 10000);
      }

      const { uploadProgress, processedCount, totalCount } = useSessionStore.getState();
      expect(uploadProgress).toBe(100);
      expect(processedCount).toBe(10000);
      expect(totalCount).toBe(10000);
    });

    it('should handle interleaved updates', () => {
      const { setParseWarnings, setUploadProgress, setFileDiscovery } = useSessionStore.getState();

      setUploadProgress(10, 1000, 10000);
      setParseWarnings([{ code: 'WARN1', message: 'Warning 1', severity: 'warning' }]);
      setUploadProgress(20, 2000, 10000);
      setFileDiscovery({
        format: 'json',
        isInstagramExport: true,
        files: [],
      });
      setUploadProgress(30, 3000, 10000);

      const state = useSessionStore.getState();
      expect(state.uploadProgress).toBe(30);
      expect(state.parseWarnings).toHaveLength(1);
      expect(state.fileDiscovery?.format).toBe('json');
    });
  });
});

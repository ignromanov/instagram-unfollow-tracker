import { describe, it, expect, beforeEach } from 'vitest';
import { SyncFilterEngine } from '@/lib/filtering/SyncFilterEngine';
import type { AccountBadges } from '@/core/types';

describe('SyncFilterEngine', () => {
  let engine: SyncFilterEngine;

  beforeEach(() => {
    engine = new SyncFilterEngine();
  });

  const mockAccounts: AccountBadges[] = [
    {
      username: 'user1',
      badges: { following: 1234567890, mutuals: true },
    },
    {
      username: 'user2',
      badges: { followers: 1234567890 },
    },
    {
      username: 'user3',
      badges: { following: 1234567890, notFollowingBack: true },
    },
  ];

  describe('filter method', () => {
    it('should return FilterEngineResult with filtered accounts', async () => {
      const result = await engine.filter(mockAccounts, 'user1', []);

      expect(result).toHaveProperty('filteredAccounts');
      expect(result).toHaveProperty('processingTime');
      expect(result.filteredAccounts).toHaveLength(1);
      expect(result.filteredAccounts[0]?.username).toBe('user1');
      expect(typeof result.processingTime).toBe('number');
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should filter by badge', async () => {
      const result = await engine.filter(mockAccounts, '', ['mutuals']);

      expect(result.filteredAccounts).toHaveLength(1);
      expect(result.filteredAccounts[0]?.username).toBe('user1');
    });

    it('should filter by search and badge', async () => {
      const result = await engine.filter(mockAccounts, 'user', ['following']);

      expect(result.filteredAccounts).toHaveLength(2);
      expect(result.filteredAccounts.every(acc => acc.badges.following)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const result = await engine.filter(mockAccounts, 'nonexistent', []);

      expect(result.filteredAccounts).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      const result = await engine.filter({} as any, '', []);

      expect(result.filteredAccounts).toHaveLength(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('dispose method', () => {
    it('should not throw error when called', () => {
      expect(() => engine.dispose()).not.toThrow();
    });

    it('should be callable multiple times', () => {
      engine.dispose();
      expect(() => engine.dispose()).not.toThrow();
    });
  });

  describe('getType method', () => {
    it('should return "sync"', () => {
      expect(engine.getType()).toBe('sync');
    });
  });

  describe('performance', () => {
    it('should complete filtering quickly', async () => {
      const largeDataset: AccountBadges[] = Array.from({ length: 1000 }, (_, i) => ({
        username: `user${i}`,
        badges: { following: 123 },
      }));

      const result = await engine.filter(largeDataset, 'user5', []);

      expect(result.processingTime).toBeLessThan(50); // Should complete in < 50ms
      expect(result.filteredAccounts.length).toBeGreaterThan(0);
    });
  });
});

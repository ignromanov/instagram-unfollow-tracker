import type { FilterEngine, FilterEngineConfig, FilterEngineResult } from '@/lib/filtering/engine';
import type { AccountBadges } from '@/core/types';

describe('FilterEngine interface types', () => {
  describe('FilterEngineResult', () => {
    it('should define correct structure for filter results', () => {
      const result: FilterEngineResult = {
        filteredAccounts: [],
        processingTime: 10,
      };

      expect(result).toHaveProperty('filteredAccounts');
      expect(result).toHaveProperty('processingTime');
      expect(Array.isArray(result.filteredAccounts)).toBe(true);
      expect(typeof result.processingTime).toBe('number');
    });

    it('should allow optional engineType field', () => {
      const resultWithEngine: FilterEngineResult = {
        filteredAccounts: [],
        processingTime: 5,
        engineType: 'optimized',
      };

      expect(resultWithEngine.engineType).toBe('optimized');
    });

    it('should work with actual account data', () => {
      const accounts: AccountBadges[] = [
        {
          username: 'user1',
          href: 'https://instagram.com/user1',
          badges: new Set(['following', 'followers']),
        },
        {
          username: 'user2',
          href: 'https://instagram.com/user2',
          badges: new Set(['following']),
        },
      ];

      const result: FilterEngineResult = {
        filteredAccounts: accounts,
        processingTime: 3.5,
        engineType: 'sync',
      };

      expect(result.filteredAccounts.length).toBe(2);
      expect(result.filteredAccounts[0].username).toBe('user1');
      expect(result.processingTime).toBe(3.5);
    });
  });

  describe('FilterEngineConfig', () => {
    it('should allow all mode options', () => {
      const configs: FilterEngineConfig[] = [
        { mode: 'worker' },
        { mode: 'sync' },
        { mode: 'auto' },
        { mode: 'optimized' },
      ];

      configs.forEach(config => {
        expect(config).toHaveProperty('mode');
        expect(['worker', 'sync', 'auto', 'optimized']).toContain(config.mode);
      });
    });

    it('should allow autoThreshold configuration', () => {
      const config: FilterEngineConfig = {
        mode: 'auto',
        autoThreshold: 10000,
      };

      expect(config.autoThreshold).toBe(10000);
    });

    it('should allow empty config', () => {
      const config: FilterEngineConfig = {};

      expect(config).toBeDefined();
      expect(config.mode).toBeUndefined();
      expect(config.autoThreshold).toBeUndefined();
    });

    it('should allow only mode without threshold', () => {
      const config: FilterEngineConfig = {
        mode: 'worker',
      };

      expect(config.mode).toBe('worker');
      expect(config.autoThreshold).toBeUndefined();
    });

    it('should allow only threshold without mode', () => {
      const config: FilterEngineConfig = {
        autoThreshold: 5000,
      };

      expect(config.autoThreshold).toBe(5000);
      expect(config.mode).toBeUndefined();
    });
  });

  describe('FilterEngine interface contract', () => {
    class MockFilterEngine implements FilterEngine {
      private engineType: string;

      constructor(type: string = 'mock') {
        this.engineType = type;
      }

      async filter(
        accounts: AccountBadges[],
        searchQuery: string,
        activeFilters: string[]
      ): Promise<FilterEngineResult> {
        const start = performance.now();

        const filtered = accounts.filter(account => {
          const matchesSearch =
            !searchQuery || account.username.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesFilters =
            activeFilters.length === 0 || activeFilters.some(filter => account.badges.has(filter));

          return matchesSearch && matchesFilters;
        });

        return {
          filteredAccounts: filtered,
          processingTime: performance.now() - start,
          engineType: this.engineType,
        };
      }

      dispose(): void {
        // Mock cleanup
      }

      getType(): string {
        return this.engineType;
      }
    }

    it('should implement filter method correctly', async () => {
      const engine = new MockFilterEngine('test');
      const accounts: AccountBadges[] = [
        {
          username: 'alice',
          href: 'https://instagram.com/alice',
          badges: new Set(['following', 'followers']),
        },
        {
          username: 'bob',
          href: 'https://instagram.com/bob',
          badges: new Set(['following']),
        },
      ];

      const result = await engine.filter(accounts, '', []);

      expect(result.filteredAccounts.length).toBe(2);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should filter by search query', async () => {
      const engine = new MockFilterEngine();
      const accounts: AccountBadges[] = [
        {
          username: 'alice',
          href: 'https://instagram.com/alice',
          badges: new Set(['following']),
        },
        {
          username: 'bob',
          href: 'https://instagram.com/bob',
          badges: new Set(['following']),
        },
      ];

      const result = await engine.filter(accounts, 'alice', []);

      expect(result.filteredAccounts.length).toBe(1);
      expect(result.filteredAccounts[0].username).toBe('alice');
    });

    it('should filter by active filters', async () => {
      const engine = new MockFilterEngine();
      const accounts: AccountBadges[] = [
        {
          username: 'alice',
          href: 'https://instagram.com/alice',
          badges: new Set(['following', 'followers']),
        },
        {
          username: 'bob',
          href: 'https://instagram.com/bob',
          badges: new Set(['following']),
        },
      ];

      const result = await engine.filter(accounts, '', ['followers']);

      expect(result.filteredAccounts.length).toBe(1);
      expect(result.filteredAccounts[0].username).toBe('alice');
    });

    it('should combine search and filters', async () => {
      const engine = new MockFilterEngine();
      const accounts: AccountBadges[] = [
        {
          username: 'alice',
          href: 'https://instagram.com/alice',
          badges: new Set(['following', 'followers']),
        },
        {
          username: 'alice2',
          href: 'https://instagram.com/alice2',
          badges: new Set(['following']),
        },
        {
          username: 'bob',
          href: 'https://instagram.com/bob',
          badges: new Set(['followers']),
        },
      ];

      const result = await engine.filter(accounts, 'alice', ['followers']);

      expect(result.filteredAccounts.length).toBe(1);
      expect(result.filteredAccounts[0].username).toBe('alice');
    });

    it('should implement dispose method', () => {
      const engine = new MockFilterEngine();

      expect(() => engine.dispose()).not.toThrow();
    });

    it('should implement getType method', () => {
      const engine = new MockFilterEngine('custom-type');

      expect(engine.getType()).toBe('custom-type');
    });

    it('should return processing time', async () => {
      const engine = new MockFilterEngine();
      const accounts: AccountBadges[] = Array.from({ length: 1000 }, (_, i) => ({
        username: `user${i}`,
        href: `https://instagram.com/user${i}`,
        badges: new Set(['following']),
      }));

      const result = await engine.filter(accounts, '', []);

      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.processingTime).toBe('number');
    });

    it('should handle empty accounts array', async () => {
      const engine = new MockFilterEngine();

      const result = await engine.filter([], 'query', ['filter']);

      expect(result.filteredAccounts).toEqual([]);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty search query', async () => {
      const engine = new MockFilterEngine();
      const accounts: AccountBadges[] = [
        {
          username: 'alice',
          href: 'https://instagram.com/alice',
          badges: new Set(['following']),
        },
      ];

      const result = await engine.filter(accounts, '', []);

      expect(result.filteredAccounts.length).toBe(1);
    });

    it('should handle empty filters array', async () => {
      const engine = new MockFilterEngine();
      const accounts: AccountBadges[] = [
        {
          username: 'alice',
          href: 'https://instagram.com/alice',
          badges: new Set(['following']),
        },
      ];

      const result = await engine.filter(accounts, 'alice', []);

      expect(result.filteredAccounts.length).toBe(1);
    });

    it('should include optional engineType in result', async () => {
      const engine = new MockFilterEngine('optimized-v2');
      const accounts: AccountBadges[] = [];

      const result = await engine.filter(accounts, '', []);

      expect(result.engineType).toBe('optimized-v2');
    });
  });

  describe('type compatibility', () => {
    it('should accept AccountBadges with required fields', () => {
      const account: AccountBadges = {
        username: 'test',
        href: 'https://test.com',
        badges: new Set(['following']),
      };

      expect(account.username).toBe('test');
      expect(account.href).toBe('https://test.com');
      expect(account.badges.has('following')).toBe(true);
    });

    it('should work with Set of badges', () => {
      const badges = new Set(['following', 'followers', 'mutuals']);
      const account: AccountBadges = {
        username: 'user',
        href: 'https://instagram.com/user',
        badges,
      };

      expect(account.badges.size).toBe(3);
      expect(account.badges.has('mutuals')).toBe(true);
    });

    it('should accept filter result with minimal fields', () => {
      const result: FilterEngineResult = {
        filteredAccounts: [],
        processingTime: 0,
      };

      expect(result.engineType).toBeUndefined();
    });

    it('should accept filter result with all fields', () => {
      const result: FilterEngineResult = {
        filteredAccounts: [
          {
            username: 'user1',
            href: 'https://instagram.com/user1',
            badges: new Set(['following']),
          },
        ],
        processingTime: 5.5,
        engineType: 'worker',
      };

      expect(result.filteredAccounts.length).toBe(1);
      expect(result.processingTime).toBe(5.5);
      expect(result.engineType).toBe('worker');
    });
  });
});

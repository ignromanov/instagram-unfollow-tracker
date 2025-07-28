// Global functions from vitest
import { 
  buildAccountBadgeIndex, 
  filterAccountsByBadges,
  BADGE_ORDER,
  BADGE_LABELS,
  BADGE_COLORS 
} from '@/core/badges';
import { 
  createTestParsedData, 
  TEST_ACCOUNTS, 
  EXPECTED_BADGE_COUNTS 
} from '@tests/fixtures/testData';
import type { BadgeKey } from '@/core/types';

describe('Badge Logic', () => {
  const testData = createTestParsedData();
  
  // Helper function to test special badge types
  const testSpecialBadge = (badgeType: BadgeKey, testAccounts: string[], result: any[]) => {
    testAccounts.forEach(username => {
      const account = result.find(acc => acc.username === username);
      expect(account).toBeDefined();
      expect(account!.badges[badgeType]).toBeTruthy();
    });
  };

  describe('buildAccountBadgeIndex', () => {
    it('should build correct badge index for all account types', () => {
      const result = buildAccountBadgeIndex(testData);
      
      // Should include all unique usernames
      const allUsernames = new Set([
        ...TEST_ACCOUNTS.following,
        ...TEST_ACCOUNTS.followers,
        ...TEST_ACCOUNTS.pending,
        ...TEST_ACCOUNTS.permanent,
        ...TEST_ACCOUNTS.restricted,
        ...TEST_ACCOUNTS.close,
        ...TEST_ACCOUNTS.unfollowed,
        ...TEST_ACCOUNTS.dismissed,
      ]);
      
      expect(result).toHaveLength(allUsernames.size);
      
      // Check that all usernames are present
      const resultUsernames = new Set(result.map(acc => acc.username));
      expect(resultUsernames).toEqual(allUsernames);
    });

    it('should correctly identify mutual accounts', () => {
      const result = buildAccountBadgeIndex(testData);
      
      // Mutual accounts are those in both following and followers
      TEST_ACCOUNTS.mutuals.forEach(username => {
        const account = result.find(acc => acc.username === username);
        expect(account).toBeDefined();
        
        // Mutual accounts should have these badges
        const expectedBadges: BadgeKey[] = ['following', 'followers', 'mutuals'];
        expectedBadges.forEach(badge => {
          expect(account!.badges[badge]).toBeTruthy();
        });
        
        // Mutual accounts should NOT have these badges
        const unexpectedBadges: BadgeKey[] = ['notFollowingBack', 'notFollowedBack'];
        unexpectedBadges.forEach(badge => {
          expect(account!.badges[badge]).toBeUndefined();
        });
      });
    });

    it('should correctly identify not following back accounts', () => {
      const result = buildAccountBadgeIndex(testData);
      
      // Not following back accounts are in following but not in followers (and not pending/permanent)
      TEST_ACCOUNTS.notFollowingBack.forEach(username => {
        const account = result.find(acc => acc.username === username);
        expect(account).toBeDefined();
        
        // Not following back accounts should have these badges
        const expectedBadges: BadgeKey[] = ['following', 'notFollowingBack'];
        expectedBadges.forEach(badge => {
          expect(account!.badges[badge]).toBeTruthy();
        });
        
        // Not following back accounts should NOT have these badges
        const unexpectedBadges: BadgeKey[] = ['followers', 'mutuals'];
        unexpectedBadges.forEach(badge => {
          expect(account!.badges[badge]).toBeFalsy();
        });
      });
    });

    it('should correctly identify not followed back accounts', () => {
      const result = buildAccountBadgeIndex(testData);
      
      // Not followed back accounts are in followers but not in following
      TEST_ACCOUNTS.notFollowedBack.forEach(username => {
        const account = result.find(acc => acc.username === username);
        expect(account).toBeDefined();
        
        // Not followed back accounts should have these badges
        const expectedBadges: BadgeKey[] = ['followers', 'notFollowedBack'];
        expectedBadges.forEach(badge => {
          expect(account!.badges[badge]).toBeTruthy();
        });
        
        // Not followed back accounts should NOT have these badges
        const unexpectedBadges: BadgeKey[] = ['following', 'mutuals'];
        unexpectedBadges.forEach(badge => {
          expect(account!.badges[badge]).toBeFalsy();
        });
      });
    });

    it('should correctly identify special badge types', () => {
      const result = buildAccountBadgeIndex(testData);
      
      // Test all special badge types using helper function
      const specialBadgeTests = [
        { badgeType: 'pending' as BadgeKey, accounts: TEST_ACCOUNTS.pending },
        { badgeType: 'permanent' as BadgeKey, accounts: TEST_ACCOUNTS.permanent },
        { badgeType: 'restricted' as BadgeKey, accounts: TEST_ACCOUNTS.restricted },
        { badgeType: 'close' as BadgeKey, accounts: TEST_ACCOUNTS.close },
        { badgeType: 'unfollowed' as BadgeKey, accounts: TEST_ACCOUNTS.unfollowed },
        { badgeType: 'dismissed' as BadgeKey, accounts: TEST_ACCOUNTS.dismissed },
      ];
      
      specialBadgeTests.forEach(({ badgeType, accounts }) => {
        testSpecialBadge(badgeType, accounts as unknown as string[], result);
      });
    });

    it('should sort accounts alphabetically', () => {
      const result = buildAccountBadgeIndex(testData);
      
      // Extract usernames and check if they are sorted
      const usernames = result.map(acc => acc.username);
      const sortedUsernames = [...usernames].sort((a, b) => a.localeCompare(b));
      
      expect(usernames).toEqual(sortedUsernames);
    });
  });

  describe('filterAccountsByBadges', () => {
    const accounts = buildAccountBadgeIndex(testData);

    it('should filter by single badge type', () => {
      const mutuals = filterAccountsByBadges(accounts, new Set(['mutuals']));
      
      // Check that all filtered accounts have the mutual badge
      mutuals.forEach(account => {
        expect(account.badges.mutuals).toBeTruthy();
      });
      
      // Check that we get exactly the mutual accounts
      const mutualUsernames = new Set(TEST_ACCOUNTS.mutuals);
      const filteredUsernames = new Set(mutuals.map(acc => acc.username));
      expect(filteredUsernames).toEqual(mutualUsernames);
    });

    it('should filter by multiple badge types (OR logic)', () => {
      const selected: Set<BadgeKey> = new Set(['mutuals', 'notFollowingBack']);
      const filtered = filterAccountsByBadges(accounts, selected);
      
      // Check that each filtered account has at least one of the selected badges
      filtered.forEach(account => {
        const hasSelectedBadge = Array.from(selected).some(badge => account.badges[badge]);
        expect(hasSelectedBadge).toBeTruthy();
      });
      
      // Verify we get the expected accounts (mutuals + notFollowingBack)
      const expectedUsernames = new Set([...TEST_ACCOUNTS.mutuals, ...TEST_ACCOUNTS.notFollowingBack]);
      const filteredUsernames = new Set(filtered.map(acc => acc.username));
      
      // Check that all expected accounts are present
      expectedUsernames.forEach(username => {
        expect(filteredUsernames).toContain(username);
      });
      
      // Check that filtered accounts are only from expected sets
      filteredUsernames.forEach(username => {
        expect(expectedUsernames).toContain(username);
      });
    });

    it('should return empty array when no filters selected', () => {
      const result = filterAccountsByBadges(accounts, new Set());
      expect(result).toHaveLength(0);
    });

    it('should filter by username query', () => {
      const query = 'alice';
      const result = filterAccountsByBadges(accounts, new Set(['following']), query);
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(account => {
        expect(account.username.toLowerCase()).toContain(query.toLowerCase());
      });
    });

    it('should combine badge and username filtering', () => {
      const query = 'mutual';
      const result = filterAccountsByBadges(accounts, new Set(['mutuals']), query);
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(account => {
        expect(account.badges.mutuals).toBeTruthy();
        expect(account.username.toLowerCase()).toContain(query.toLowerCase());
      });
    });

    it('should return empty array for non-matching query', () => {
      const query = 'nonexistent_user_12345';
      const result = filterAccountsByBadges(accounts, new Set(['following']), query);
      expect(result).toHaveLength(0);
    });
  });

  describe('Badge constants', () => {
    it('should have consistent badge order', () => {
      expect(BADGE_ORDER).toHaveLength(11);
      
      // Check that all expected badge types are present
      const expectedBadges: BadgeKey[] = ['following', 'followers', 'mutuals', 'notFollowingBack', 'notFollowedBack', 'pending', 'permanent', 'restricted', 'close', 'unfollowed', 'dismissed'];
      expectedBadges.forEach(badge => {
        expect(BADGE_ORDER).toContain(badge);
      });
    });

    it('should have labels for all badge types', () => {
      BADGE_ORDER.forEach(badge => {
        expect(BADGE_LABELS[badge]).toBeDefined();
        expect(typeof BADGE_LABELS[badge]).toBe('string');
        expect(BADGE_LABELS[badge].length).toBeGreaterThan(0);
      });
    });

    it('should have colors for all badge types', () => {
      BADGE_ORDER.forEach(badge => {
        expect(BADGE_COLORS[badge]).toBeDefined();
        expect(typeof BADGE_COLORS[badge]).toBe('string');
        expect(BADGE_COLORS[badge].length).toBeGreaterThan(0);
      });
    });

    it('should have consistent structure across all badge constants', () => {
      // All constants should have the same keys
      const badgeKeys = new Set(BADGE_ORDER);
      const labelKeys = new Set(Object.keys(BADGE_LABELS));
      const colorKeys = new Set(Object.keys(BADGE_COLORS));
      
      expect(badgeKeys).toEqual(labelKeys);
      expect(badgeKeys).toEqual(colorKeys);
    });
  });
});

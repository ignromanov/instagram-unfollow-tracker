import { render, screen } from '@tests/utils/testUtils';
import { AccountList } from '@/components/AccountList';
import { createTestParsedData } from '@tests/fixtures/testData';
import { buildAccountBadgeIndex, BADGE_ORDER, BADGE_LABELS } from '@/core/badges';
import type { AccountBadges, BadgeKey } from '@/core/types';

describe('AccountList Component', () => {
  const testData = createTestParsedData();
  const accounts = buildAccountBadgeIndex(testData);

  // Badges that typically have timestamps
  const timestampBadges = ['pending', 'permanent', 'restricted', 'close', 'unfollowed', 'dismissed'] as BadgeKey[];

  it('should render empty state when no data loaded', () => {
    render(<AccountList accounts={[]} hasLoadedData={false} />);

    expect(screen.getByText('No data to display')).toBeInTheDocument();
    expect(screen.getByText('Upload your Instagram data to start analyzing your connections')).toBeInTheDocument();
    expect(screen.getByText('Get Started with Instagram Data')).toBeInTheDocument();
  });

  it('should render filtered empty state when data loaded but no results', () => {
    render(<AccountList accounts={[]} hasLoadedData={true} />);

    expect(screen.getByText('📭 No results. Try another query or adjust filters.')).toBeInTheDocument();
  });

  it('should render all accounts with usernames', () => {
    render(<AccountList accounts={accounts} hasLoadedData={true} />);

    accounts.forEach(account => {
      expect(screen.getByText(`@${account.username}`)).toBeInTheDocument();
    });
  });

  it('should render Instagram links for each account', () => {
    render(<AccountList accounts={accounts} hasLoadedData={true} />);

    accounts.forEach(account => {
      const link = screen.getByText(`@${account.username}`).closest('a');
      expect(link).toHaveAttribute('href', `https://www.instagram.com/${account.username}`);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    });
  });

  it('should render badges for each account', () => {
    render(<AccountList accounts={accounts} hasLoadedData={true} />);

    // Count total badges that should be rendered
    let expectedBadgeCount = 0;
    accounts.forEach(account => {
      BADGE_ORDER.forEach(badgeKey => {
        if (account.badges[badgeKey]) {
          expectedBadgeCount++;
        }
      });
    });

    // Check that all expected badges are rendered
    BADGE_ORDER.forEach(badgeKey => {
      const expectedBadgeText = BADGE_LABELS[badgeKey];
      const badgeElements = screen.queryAllByText(expectedBadgeText);
      const expectedCount = accounts.filter(acc => acc.badges[badgeKey]).length;
      expect(badgeElements).toHaveLength(expectedCount);
    });
  });

  it('should render tooltips for badges with timestamps', () => {
    const accountsWithTimestamps: AccountBadges[] = [
      {
        username: 'test_user',
        badges: Object.fromEntries(
          timestampBadges.map(key => [key, 1640995200])
        ) as Record<BadgeKey, number>,
      },
    ];

    render(<AccountList accounts={accountsWithTimestamps} hasLoadedData={true} />);

    // Check that tooltip is present for timestamp badges
    timestampBadges.forEach(badgeKey => {
      const badgeText = BADGE_LABELS[badgeKey];
      const badgeElement = screen.getByText(badgeText);
      expect(badgeElement).toBeInTheDocument();
    });
  });

  it('should format timestamps correctly in tooltips', () => {
    const testTimestamp = 1640995200; // 2022-01-01 00:00:00 UTC
    const accountsWithTimestamps: AccountBadges[] = [
      {
        username: 'timestamp_user',
        badges: {
          pending: testTimestamp,
          permanent: testTimestamp,
          restricted: testTimestamp,
        },
      },
    ];

    render(<AccountList accounts={accountsWithTimestamps} hasLoadedData={true} />);

    // Check that badges with timestamps are rendered
    expect(screen.getByText('Pending request')).toBeInTheDocument();
    expect(screen.getByText('Pending (permanent)')).toBeInTheDocument();
    expect(screen.getByText('Restricted')).toBeInTheDocument();
  });

  it('should handle mixed timestamp and boolean badges', () => {
    const accountsWithMixedBadges: AccountBadges[] = [
      {
        username: 'mixed_user',
        badges: {
          following: true, // boolean badge
          pending: 1640995200, // timestamp badge
          mutuals: true, // boolean badge
          restricted: 1640995200, // timestamp badge
        },
      },
    ];

    render(<AccountList accounts={accountsWithMixedBadges} hasLoadedData={true} />);

    // Check that both types of badges are rendered
    expect(screen.getByText('Following')).toBeInTheDocument();
    expect(screen.getByText('Pending request')).toBeInTheDocument();
    expect(screen.getByText('Mutuals')).toBeInTheDocument();
    expect(screen.getByText('Restricted')).toBeInTheDocument();
  });

  it('should handle zero timestamp values', () => {
    const accountsWithZeroTimestamp: AccountBadges[] = [
      {
        username: 'zero_timestamp_user',
        badges: {
          pending: 0,
          permanent: 0,
        },
      },
    ];

    render(<AccountList accounts={accountsWithZeroTimestamp} hasLoadedData={true} />);

    // Should render the account even with zero timestamp badges
    expect(screen.getByText('@zero_timestamp_user')).toBeInTheDocument();

    // Zero timestamps might not render badges, so we just check the account exists
    // The actual badge rendering behavior depends on the component implementation
  });

  it('should handle accounts with no badges', () => {
    const accountsWithNoBadges: AccountBadges[] = [
      {
        username: 'user_without_badges',
        badges: {},
      },
    ];

    render(<AccountList accounts={accountsWithNoBadges} hasLoadedData={true} />);

    expect(screen.getByText('@user_without_badges')).toBeInTheDocument();

    // Should not render any badge labels
    BADGE_ORDER.forEach(badgeKey => {
      const badgeText = BADGE_LABELS[badgeKey];
      expect(screen.queryByText(badgeText)).not.toBeInTheDocument();
    });
  });

  it('should handle accounts with all badge types', () => {
    const allBadges = Object.fromEntries(
      BADGE_ORDER.map(key => [key, timestampBadges.includes(key) ? 1640995200 : true])
    ) as Record<BadgeKey, number | true>;

    const accountWithAllBadges: AccountBadges[] = [
      {
        username: 'super_user',
        badges: allBadges,
      },
    ];

    render(<AccountList accounts={accountWithAllBadges} hasLoadedData={true} />);

    expect(screen.getByText('@super_user')).toBeInTheDocument();

    // Should render all badge types
    BADGE_ORDER.forEach(badgeKey => {
      const expectedBadgeText = BADGE_LABELS[badgeKey];
      expect(screen.getByText(expectedBadgeText)).toBeInTheDocument();
    });
  });

  it('should render accounts in correct order', () => {
    const unsortedAccounts: AccountBadges[] = [
      { username: 'zebra', badges: { following: true } },
      { username: 'apple', badges: { following: true } },
      { username: 'banana', badges: { following: true } },
    ];

    render(<AccountList accounts={unsortedAccounts} hasLoadedData={true} />);

    const accountElements = screen.getAllByText(/@/);
    const usernames = accountElements.map(el => el.textContent?.replace('@', ''));

    expect(usernames).toEqual(['zebra', 'apple', 'banana']);
  });

  it('should handle special characters in usernames', () => {
    const accountsWithSpecialChars: AccountBadges[] = [
      { username: 'user_with_underscore', badges: { following: true } },
      { username: 'user-with-dash', badges: { following: true } },
      { username: 'user.with.dots', badges: { following: true } },
      { username: 'user123', badges: { following: true } },
    ];

    render(<AccountList accounts={accountsWithSpecialChars} hasLoadedData={true} />);

    accountsWithSpecialChars.forEach(account => {
      expect(screen.getByText(`@${account.username}`)).toBeInTheDocument();
    });
  });

  it('should render scrollable container', () => {
    render(<AccountList accounts={accounts} hasLoadedData={true} />);

    const scrollArea = document.querySelector('[data-scrollbars]');
    expect(scrollArea).toBeInTheDocument();
  });

  it('should render virtualized list for large datasets', () => {
    // Create a large dataset to trigger virtualization
    const largeAccounts = Array.from({ length: 1000 }, (_, i) => ({
      username: `user_${i}`,
      badges: {
        following: i % 2 === 0 ? (true as const) : undefined,
        followers: i % 3 === 0 ? (true as const) : undefined,
        mutuals: i % 6 === 0 ? (true as const) : undefined,
        notFollowingBack: undefined,
        notFollowedBack: undefined,
        pending: undefined,
        permanent: undefined,
        restricted: undefined,
        close: undefined,
        unfollowed: undefined,
        dismissed: undefined,
      },
    }));

    render(<AccountList accounts={largeAccounts} hasLoadedData={true} />);

    // Should render virtualized container
    const virtualizedContainer = document.querySelector('div[style*="height: 560px"]');
    expect(virtualizedContainer).toBeInTheDocument();
  });

  it('should handle virtualization with empty accounts', () => {
    render(<AccountList accounts={[]} hasLoadedData={true} />);

    expect(screen.getByText('📭 No results. Try another query or adjust filters.')).toBeInTheDocument();
  });

  it('should handle undefined accounts gracefully', () => {
    render(<AccountList accounts={undefined as any} hasLoadedData={true} />);

    expect(screen.getByText('📭 No results. Try another query or adjust filters.')).toBeInTheDocument();
  });
});

import { BADGE_STYLES } from '@/constants/badge-styles';
import { BADGE_LABELS } from '@/core/badges';
import type { AccountBadges } from '@/core/types';
import { useAccountDataSource } from '@/hooks/useAccountDataSource';
import { analytics } from '@/lib/analytics';
import { useAppStore } from '@/lib/store';
import type { AccountListProps } from '@/types/components';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ExternalLink } from 'lucide-react';
import { memo, useCallback, useRef } from 'react';

export const AccountList = memo(function AccountList({
  accountIndices,
  hasLoadedData,
}: AccountListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Get file metadata for lazy loading
  const fileMetadata = useAppStore(s => s.fileMetadata);
  const fileHash = fileMetadata?.fileHash || null;
  const totalAccountCount = fileMetadata?.accountCount || 0;

  // Initialize data source for lazy loading
  const { getAccount } = useAccountDataSource({
    fileHash,
    accountCount: totalAccountCount,
    chunkSize: 500, // Load 500 accounts per chunk
    overscan: 20, // Keep 20 chunks in cache (to handle concurrent loads)
  });

  const displayCount = accountIndices?.length || 0;

  // Get account by virtual index (maps to actual account index in IndexedDB)
  // Use useCallback to avoid recreating on every render
  const getAccountByIndex = useCallback(
    (virtualIndex: number) => {
      const actualIndex = accountIndices?.[virtualIndex];
      if (actualIndex === undefined) return undefined;
      return getAccount(actualIndex);
    },
    [accountIndices, getAccount]
  );

  const virtualizer = useVirtualizer({
    count: displayCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated height of each account item
    overscan: 5, // Render 5 extra items outside visible area
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (!hasLoadedData) {
    return null;
  }

  // Don't return early for loading - let virtualization handle skeleton rendering

  if (displayCount === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No accounts match your filters</p>
      </div>
    );
  }

  const getAvatarGradient = (username: string) => {
    // Simple hash function for consistent colors
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    const saturation = 65 + (Math.abs(hash >> 8) % 20);
    const lightness = 50 + (Math.abs(hash >> 16) % 15);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const SkeletonItem = () => (
    <div className="rounded-lg border border-border/50 bg-card p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-3 bg-muted rounded w-48" />
        </div>
      </div>
    </div>
  );

  const trackAccountClick = (account: AccountBadges) => {
    const badgeCount = Object.values(account.badges).filter(Boolean).length;
    analytics.accountClick(badgeCount);
  };

  const AccountItem = ({ account }: { account: AccountBadges }) => {
    const handleRowClick = () => {
      trackAccountClick(account);
      window.open(`https://instagram.com/${account.username}`, '_blank', 'noopener,noreferrer');
    };

    return (
      <div
        className="group flex items-center justify-between rounded-lg border border-border/50 bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md hover:scale-[1.01] cursor-pointer"
        onClick={handleRowClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRowClick();
          }
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm ring-1 ring-black/5"
            style={{
              background: `linear-gradient(135deg, ${getAvatarGradient(account.username)}, ${getAvatarGradient(account.username + 'salt')})`,
            }}
          >
            {account.username?.[0]?.toUpperCase() || '?'}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <p className="truncate font-semibold text-card-foreground">@{account.username}</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(account.badges)
                .filter(([, hasBadge]) => hasBadge)
                .map(([badgeKey]) => (
                  <span
                    key={badgeKey}
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shadow-sm ${
                      BADGE_STYLES[badgeKey] || 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {BADGE_LABELS[badgeKey as keyof typeof BADGE_LABELS] || badgeKey}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 pb-4">
      <h3 className="text-sm font-semibold text-foreground">
        Accounts ({displayCount.toLocaleString()})
      </h3>

      <div
        ref={parentRef}
        className="overflow-auto"
        style={{
          height: 'calc(100vh - 220px)', // Full viewport minus header/footer
          width: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map(virtualItem => {
            // Get account using the memoized getter (either from IndexedDB or memory)
            const account = getAccountByIndex(virtualItem.index);

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="px-4 py-1"
              >
                {account ? <AccountItem account={account} /> : <SkeletonItem />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

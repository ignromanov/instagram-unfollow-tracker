import React, { useRef } from 'react';
import { ScrollArea, Stack, Card, Group, Anchor, Badge, Tooltip, Text, Center } from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { BADGE_ORDER, BADGE_LABELS, BADGE_COLORS } from '@/core/badges';
import { formatUnixHuman } from '@/core/types';
import { DataDownloadInstructions } from './DataDownloadInstructions';
import type { AccountBadges } from '@/core/types';

interface AccountListProps {
  accounts: AccountBadges[];
  hasLoadedData?: boolean;
}

// Memoized account card component for better performance
const AccountCard = React.memo<{ account: AccountBadges }>(({ account }) => (
  <Card withBorder radius="md" shadow="sm" padding="sm">
    <Group justify="space-between" align="center">
      <Anchor
        href={`https://www.instagram.com/${account.username}`}
        target="_blank"
        rel="noreferrer"
      >
        @{account.username}
      </Anchor>
      <Group gap="xs" wrap="wrap">
        {BADGE_ORDER.map((k) =>
          account.badges[k] ? (
            <Tooltip
              key={k}
              label={
                typeof account.badges[k] === 'number'
                  ? (formatUnixHuman(account.badges[k] as number) || '')
                  : undefined
              }
            >
              <Badge color={BADGE_COLORS[k]} variant="light">
                {BADGE_LABELS[k]}
              </Badge>
            </Tooltip>
          ) : null
        )}
      </Group>
    </Group>
  </Card>
));

AccountCard.displayName = 'AccountCard';

export const AccountList: React.FC<AccountListProps> = ({ accounts, hasLoadedData = false }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer configuration
  const rowVirtualizer = useVirtualizer({
    count: accounts?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height of each account card
    overscan: 5, // Render 5 extra items above and below visible area
  });

  // Show empty state only when no data has been loaded at all
  if (!hasLoadedData) {
    return (
      <Center h={400} p="xl">
        <Stack align="center" gap="xl" style={{ maxWidth: '500px' }}>
          <div style={{ textAlign: 'center' }}>
            <Text size="xl" c="dimmed" mb="md" style={{ fontSize: '48px' }}>
              📭
            </Text>
            <Text size="lg" fw={500} c="dimmed" mb="sm">
              No data to display
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Upload your Instagram data to start analyzing your connections
            </Text>
          </div>
          <DataDownloadInstructions variant="alert" showInEmptyState={true} />
        </Stack>
      </Center>
    );
  }

  // Show filtered empty state when data is loaded but filtered results are empty
  if (!accounts || accounts.length === 0) {
    return (
      <Center h={200}>
        <Text size="lg" c="dimmed" ta="center">
          📭 No results. Try another query or adjust filters.
        </Text>
      </Center>
    );
  }

  // Only use virtualization for large lists (50+ items)
  if (!accounts || accounts.length < 50) {
    return (
      <ScrollArea h={560}>
        <Stack gap="sm">
          {accounts.map((acc) => (
            <AccountCard key={acc.username} account={acc} />
          ))}
        </Stack>
      </ScrollArea>
    );
  }

  return (
    <div
      ref={parentRef}
      style={{
        height: '560px',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const account = accounts?.[virtualItem.index];
          if (!account) return null;

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
                paddingBottom: '8px', // Gap between items
              }}
            >
              <AccountCard account={account} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { TextInput, Title, Paper, Stack, Container, Alert, Group, Badge, Text, Button, ActionIcon } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useAppStore } from '@/lib/store';
import { useInstagramData } from '@/hooks/useInstagramData';
import { useFilters } from '@/hooks/useFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { FileUpload } from '@/components/FileUpload';
import { FilterChips } from '@/components/FilterChips';
import { AccountList } from '@/components/AccountList';
import { DataDownloadInstructions } from '@/components/DataDownloadInstructions';
import { DocumentationLink } from '@/components/DocumentationLink';
import { BADGE_ORDER } from '@/core/badges';
import type { BadgeKey } from '@/core/types';


export const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const { uploadState, handleZipUpload, handleClearData } = useInstagramData();

  // Get data directly from store for consistency
  const unified = useAppStore(s => s.unified);
  const filters = useAppStore(s => s.filters);
  const setFilters = useAppStore(s => s.setFilters);

  // Debounce search query for better performance
  const debouncedQuery = useDebounce(query, 300);

  const handleZipUploadWrapper = async (file: File) => {
    try {
      await handleZipUpload(file);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAccounts = useFilters(unified, filters, debouncedQuery);

  // Optimized filterCounts - single pass instead of double loop
  const filterCounts = useMemo(() => {
    const counts = Object.fromEntries(BADGE_ORDER.map(k => [k, 0])) as Record<BadgeKey, number>;

    // Single pass through accounts
    for (const acc of unified) {
      // Only check badges that actually exist for this account
      Object.keys(acc.badges).forEach(key => {
        if (counts[key as BadgeKey] !== undefined) {
          counts[key as BadgeKey]++;
        }
      });
    }

    return counts;
  }, [unified]);

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div>
              <Group gap="sm" align="center" mb="xs">
                <Title order={3}>📊 Instagram Unfollow Tracker</Title>
                <DataDownloadInstructions variant="button" size="xs" />
                <DocumentationLink size="xs" />
              </Group>
              <Text size="sm" c="dimmed" mb="xs">
                Analyze your Instagram connections and find who unfollowed you
              </Text>
              {unified.length > 0 && (
                <Group gap="xs">
                  <Badge color="green" variant="light" size="sm">
                    {unified.length} accounts loaded
                  </Badge>
                  <Badge color="blue" variant="light" size="sm">
                    {filteredAccounts.length} filtered
                  </Badge>
                </Group>
              )}
            </div>
          </div>
          <div style={{ minWidth: '200px' }}>
            <FileUpload
              onZipUpload={handleZipUploadWrapper}
              uploadState={uploadState}
            />

            {/* File Status Panel - under upload button */}
            {uploadState.status === 'success' && uploadState.fileName && (
              <Alert color="green" variant="light" p="xs" mt="xs">
                <Group justify="space-between" align="center" gap="xs">
                  <Group gap="xs" align="center">
                    <Text size="xs" c="green">📁</Text>
                    <Text size="xs" c="dimmed" style={{
                      maxWidth: '180px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {uploadState.fileName.length > 25
                        ? `${uploadState.fileName.substring(0, 12)}...${uploadState.fileName.substring(uploadState.fileName.length - 12)}`
                        : uploadState.fileName}
                    </Text>
                  </Group>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="red"
                    onClick={handleClearData}
                    leftSection={<IconX size={12} />}
                    styles={{ section: { marginRight: 4 } }}
                  >
                    Clear
                  </Button>
                </Group>
              </Alert>
            )}

            {uploadState.status === 'error' && uploadState.error && (
              <Alert color="red" variant="light" p="sm" mt="xs">
                <Group gap="sm" align="center">
                  <Text size="sm" c="red" fw={500}>❌ Upload failed</Text>
                  <Text size="sm" c="red">{uploadState.error}</Text>
                </Group>
              </Alert>
            )}

            {uploadState.fileName && uploadState.status === 'idle' && (
              <Alert color="blue" variant="light" p="sm" mt="xs">
                <Group gap="sm" align="center">
                  <Text size="sm" c="blue" fw={500}>⏳ Processing file...</Text>
                  <Text size="sm" c="dimmed">Please wait while we analyze your data</Text>
                </Group>
              </Alert>
            )}
          </div>
        </div>


        {/* Instructions for empty state */}
        {unified.length === 0 && uploadState.status !== 'idle' && (
          <DataDownloadInstructions variant="alert" showInEmptyState />
        )}

        {/* Main Content */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <FilterChips
              selectedFilters={filters}
              onFiltersChange={setFilters}
              filterCounts={filterCounts}
            />

            <div>
              <TextInput
                placeholder="Search username…"
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                rightSection={
                  query ? (
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      onClick={() => setQuery('')}
                      aria-label="Clear search"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  ) : null
                }
                size="md"
              />
              {query && (
                <Text size="xs" c="dimmed" mt="xs">
                  Found {filteredAccounts.length} result{filteredAccounts.length !== 1 ? 's' : ''} for "{query}"
                </Text>
              )}
            </div>

            <AccountList accounts={filteredAccounts} hasLoadedData={unified.length > 0} />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

import React from 'react';
import { Chip, Group, Button, Text } from '@mantine/core';
import { BADGE_ORDER, BADGE_LABELS, BADGE_COLORS } from '@/core/badges';
import type { BadgeKey } from '@/core/types';

interface FilterChipsProps {
  selectedFilters: Set<BadgeKey>;
  onFiltersChange: (filters: Set<BadgeKey>) => void;
  filterCounts: Record<BadgeKey, number>;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  selectedFilters,
  onFiltersChange,
  filterCounts,
}) => {
  const handleFilterChange = (key: BadgeKey, checked: boolean) => {
    const next = new Set(selectedFilters);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }
    onFiltersChange(next);
  };

  const handleSelectAll = () => {
    const allFilters = new Set(BADGE_ORDER.filter(key => filterCounts[key] > 0));
    onFiltersChange(allFilters);
  };

  const handleClearAll = () => {
    onFiltersChange(new Set());
  };

  const totalSelected = selectedFilters.size;
  const totalAvailable = BADGE_ORDER.filter(key => filterCounts[key] > 0).length;

  return (
    <div>
      <Group justify="space-between" align="center" mb="sm">
        <Text size="sm" fw={500}>
          Filters ({totalSelected}/{totalAvailable} selected)
        </Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            color="blue"
            onClick={handleSelectAll}
            disabled={totalSelected === totalAvailable}
          >
            Select All
          </Button>
          <Button
            size="xs"
            variant="light"
            color="gray"
            onClick={handleClearAll}
            disabled={totalSelected === 0}
          >
            Clear All
          </Button>
        </Group>
      </Group>
      <Group gap="xs" wrap="wrap">
        {BADGE_ORDER.map((key) => (
          <Chip
            key={key}
            color={BADGE_COLORS[key]}
            checked={selectedFilters.has(key)}
            onChange={(checked: boolean) => handleFilterChange(key, checked)}
            variant={selectedFilters.has(key) ? 'filled' : 'light'}
            disabled={filterCounts[key] === 0}
          >
            {BADGE_LABELS[key]} ({filterCounts[key]})
          </Chip>
        ))}
      </Group>
    </div>
  );
};

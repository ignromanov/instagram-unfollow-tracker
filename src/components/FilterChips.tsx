'use client';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import type { BadgeKey } from '@/core/types';
import { BADGE_LABELS } from '@/core/badges';
import type { FilterChipsProps } from '@/types/components';
import { BADGE_CONFIGS } from '@/constants/badge-styles';
import { analytics } from '@/lib/analytics';

export function FilterChips({
  selectedFilters,
  onFiltersChange,
  filterCounts,
  isFiltering = false,
}: FilterChipsProps) {
  const handleFilterToggle = (filter: BadgeKey) => {
    const newFilters = new Set(selectedFilters);
    const action = newFilters.has(filter) ? 'disable' : 'enable';

    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }

    analytics.filterToggle(filter, action, newFilters.size);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    analytics.filterClearAll(selectedFilters.size);
    onFiltersChange(new Set());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 id="filter-heading" className="text-xs sm:text-sm font-semibold text-foreground">
            Filter by badge
          </h3>
          {isFiltering ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Filtering...</span>
            </span>
          ) : selectedFilters.size > 0 ? (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {selectedFilters.size} <span className="hidden sm:inline">active</span>
            </span>
          ) : null}
        </div>
        {selectedFilters.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-9 sm:h-8 text-xs min-h-[36px] sm:min-h-[32px] px-3"
            aria-label={`Clear all ${selectedFilters.size} active filters`}
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-labelledby="filter-heading">
        {Object.entries(BADGE_CONFIGS).map(([key, config]) => {
          const badgeKey = key as BadgeKey;
          const count = filterCounts[badgeKey] || 0;
          const isActive = selectedFilters.has(badgeKey);

          return (
            <button
              key={badgeKey}
              onClick={() => handleFilterToggle(badgeKey)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[44px] sm:min-h-0 ${
                isActive
                  ? `${config.color} shadow-sm ring-1 ring-black/5`
                  : 'border-border bg-background text-muted-foreground hover:bg-accent/90'
              }`}
              aria-label={`${isActive ? 'Remove' : 'Add'} ${BADGE_LABELS[badgeKey]} filter (${count.toLocaleString()} accounts)`}
              aria-pressed={isActive}
            >
              {BADGE_LABELS[badgeKey]}
              <span className="text-xs opacity-75">({count.toLocaleString()})</span>
              {isActive && <X className="ml-0.5 h-3.5 w-3.5 sm:h-3 sm:w-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

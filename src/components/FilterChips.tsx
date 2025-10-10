'use client';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import type { BadgeKey } from '@/core/types';
import { BADGE_LABELS } from '@/core/badges';
import type { FilterChipsProps } from '@/types/components';
import { BADGE_CONFIGS } from '@/constants/badge-styles';

export function FilterChips({
  selectedFilters,
  onFiltersChange,
  filterCounts,
  isFiltering = false,
}: FilterChipsProps) {
  const handleFilterToggle = (filter: BadgeKey) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }

    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    onFiltersChange(new Set());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Filter by badge</h3>
          {isFiltering ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Filtering...
            </span>
          ) : selectedFilters.size > 0 ? (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {selectedFilters.size} active
            </span>
          ) : null}
        </div>
        {selectedFilters.size > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 text-xs">
            Clear all
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(BADGE_CONFIGS).map(([key, config]) => {
          const badgeKey = key as BadgeKey;
          const count = filterCounts[badgeKey] || 0;
          const isActive = selectedFilters.has(badgeKey);

          return (
            <button
              key={badgeKey}
              onClick={() => handleFilterToggle(badgeKey)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                isActive
                  ? `${config.color} shadow-sm ring-1 ring-black/5`
                  : 'border-border bg-background text-muted-foreground hover:bg-accent hover:bg-opacity-90'
              }`}
            >
              {BADGE_LABELS[badgeKey]}
              <span className="text-xs opacity-75">({count.toLocaleString()})</span>
              {isActive && <X className="ml-0.5 h-3 w-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

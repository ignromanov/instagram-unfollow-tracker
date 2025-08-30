'use client';

import type React from 'react';
import { SearchBar } from './SearchBar';
import { FilterChips } from './FilterChips';
import { AccountList } from './AccountList';
import { useAccountFiltering } from '@/hooks/useAccountFiltering';

export function AccountListSection() {
  const {
    query,
    setQuery,
    filteredIndices,
    filters,
    setFilters,
    filterCounts,
    isFiltering,
    processingTime,
    totalCount,
    hasLoadedData,
  } = useAccountFiltering();

  return (
    <div className="mt-8 space-y-6">
      <SearchBar
        value={query}
        onChange={setQuery}
        resultCount={filteredIndices.length}
        totalCount={totalCount}
        isFiltering={isFiltering}
        processingTime={processingTime}
      />

      <FilterChips
        selectedFilters={filters}
        onFiltersChange={setFilters}
        filterCounts={filterCounts}
        isFiltering={isFiltering}
      />

      <AccountList
        accountIndices={filteredIndices}
        hasLoadedData={hasLoadedData}
        isLoading={isFiltering}
      />
    </div>
  );
}

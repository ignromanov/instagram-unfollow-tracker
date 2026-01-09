'use client';

import { Search, Users, UserPlus, XCircle, TrendingDown, ArrowUpDown } from 'lucide-react';
import { FilterChips } from './FilterChips';
import { AccountList } from './AccountList';
import { StatCard } from './StatCard';
import { useAccountFiltering } from '@/hooks/useAccountFiltering';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';

export function AccountListSection() {
  const {
    query,
    setQuery,
    filteredIndices,
    filters,
    setFilters,
    filterCounts,
    isFiltering,
    totalCount,
    hasLoadedData,
  } = useAccountFiltering();

  const fileMetadata = useAppStore(s => s.fileMetadata);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Apply sort order to filtered indices
  const sortedIndices = sortOrder === 'desc' ? [...filteredIndices].reverse() : filteredIndices;

  const handleClearFilters = () => {
    setFilters(new Set());
    setQuery('');
  };

  const handleStatCardClick = (badgeType: string) => {
    const newFilters = new Set(filters);
    if (newFilters.has(badgeType as any)) {
      newFilters.delete(badgeType as any);
    } else {
      newFilters.add(badgeType as any);
    }
    setFilters(newFilters);
  };

  // Calculate stat card values
  const followersCount = filterCounts.followers || 0;
  const followingCount = filterCounts.following || 0;
  const unfollowedCount = filterCounts.unfollowed || 0;
  const notFollowingBackCount = filterCounts.notFollowingBack || 0;

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-16 space-y-6 md:space-y-12 animate-in fade-in duration-500 mb-12 px-4">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mb-2 tracking-tight">
            Analysis Results
          </h1>
          <p className="text-zinc-500 text-[10px] md:text-sm font-bold uppercase tracking-widest">
            {fileMetadata?.name} • {totalCount.toLocaleString()} Total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search usernames..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-card focus:ring-2 focus:ring-primary outline-none transition-all font-semibold text-sm shadow-sm"
            />
          </div>
          <button
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            className={`cursor-pointer p-3.5 rounded-2xl border transition-all shadow-sm shrink-0 ${
              sortOrder === 'desc'
                ? 'bg-primary text-white border-primary'
                : 'bg-card border-border text-zinc-500 hover:text-primary'
            }`}
            title={sortOrder === 'asc' ? 'Sort Z→A' : 'Sort A→Z'}
          >
            <ArrowUpDown size={20} />
          </button>
        </div>
      </div>

      {/* Top Cards - Priority View */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          icon={<UserPlus size={24} />}
          label="Followers"
          value={followersCount}
          colorClass="bg-emerald-500/10 text-emerald-500"
          badgeType="followers"
          activeFilters={filters}
          onClick={handleStatCardClick}
        />
        <StatCard
          icon={<Users size={24} />}
          label="Following"
          value={followingCount}
          colorClass="bg-blue-500/10 text-blue-500"
          badgeType="following"
          activeFilters={filters}
          onClick={handleStatCardClick}
        />
        <StatCard
          icon={<XCircle size={24} />}
          label="Unfollowed"
          value={unfollowedCount}
          colorClass="bg-rose-500/10 text-rose-500"
          badgeType="unfollowed"
          activeFilters={filters}
          onClick={handleStatCardClick}
        />
        <StatCard
          icon={<TrendingDown size={24} />}
          label="Not Following"
          value={notFollowingBackCount}
          colorClass="bg-amber-500/10 text-amber-500"
          badgeType="notFollowingBack"
          activeFilters={filters}
          onClick={handleStatCardClick}
        />
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-12">
        {/* Filters Sidebar */}
        <div className="lg:w-80 shrink-0 space-y-6">
          <FilterChips
            selectedFilters={filters}
            onFiltersChange={setFilters}
            filterCounts={filterCounts}
            isFiltering={isFiltering}
          />
        </div>

        {/* Account List */}
        <AccountList
          accountIndices={sortedIndices}
          hasLoadedData={hasLoadedData}
          isLoading={isFiltering}
          onClearFilters={handleClearFilters}
        />
      </div>
    </div>
  );
}

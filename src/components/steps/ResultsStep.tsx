'use client';

import type React from 'react';
import { Users, TrendingDown, FileArchive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { AccountList } from '@/components/AccountList';
import { useAccountFiltering } from '@/hooks/useAccountFiltering';
import { useHeaderData } from '@/hooks/useHeaderData';
import type { StatCardProps } from '@/types/components';

export function ResultsStep() {
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

  const { fileName, fileSize, uploadDate, stats, onClearData } = useHeaderData();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with file info and stats */}
      <div className="space-y-4 sm:space-y-6">
        {/* File information */}
        {fileName && fileSize && uploadDate && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 px-2 sm:px-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
              <FileArchive className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium truncate max-w-[120px] sm:max-w-none">{fileName}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{formatFileSize(fileSize)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Uploaded {formatRelativeTime(uploadDate)}</span>
              <span className="sm:hidden text-xs">
                {formatFileSize(fileSize)} · {formatRelativeTime(uploadDate)}
              </span>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5 min-h-[40px] w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all loaded Instagram data and return you to the file upload
                    screen. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 px-2 sm:px-0">
          <StatCard
            label="Following"
            mobileLabel="Following"
            value={stats.following}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Followers"
            mobileLabel="Followers"
            value={stats.followers}
            icon={Users}
            color="green"
          />
          <StatCard
            label="Mutuals"
            mobileLabel="Mutuals"
            value={stats.mutuals}
            icon={Users}
            color="purple"
          />
          <StatCard
            label="Not Following Back"
            mobileLabel="Not Back"
            value={stats.notFollowingBack}
            icon={TrendingDown}
            color="red"
          />
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
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
      </div>

      {/* Account list */}
      <AccountList
        accountIndices={filteredIndices}
        hasLoadedData={hasLoadedData}
        isLoading={isFiltering}
      />
    </div>
  );
}

function StatCard({ label, mobileLabel, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md cursor-default">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            <span className="sm:hidden">{mobileLabel || label}</span>
            <span className="hidden sm:inline">{label}</span>
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`rounded-full p-2 sm:p-3 flex-shrink-0 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </div>
  );
}

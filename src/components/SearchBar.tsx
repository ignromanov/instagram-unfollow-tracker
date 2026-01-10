'use client';

import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
  isFiltering?: boolean;
  processingTime?: number;
}

export function SearchBar({
  value,
  onChange,
  resultCount,
  totalCount,
  isFiltering = false,
  processingTime,
}: SearchBarProps) {
  const { t } = useTranslation('results');
  return (
    <div className="space-y-2">
      <form role="search" onSubmit={e => e.preventDefault()}>
        <div className="relative">
          {isFiltering ? (
            <Loader2 className="absolute left-3 sm:left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground animate-spin" />
          ) : (
            <Search
              className="absolute left-3 sm:left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <Input
            id="account-search"
            type="text"
            placeholder={t('search.placeholder')}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="pl-10 pr-12 sm:pr-10 text-base h-12 sm:h-10"
            aria-label={t('search.ariaLabel')}
          />
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
              className="absolute right-1 top-1/2 h-10 w-10 sm:h-7 sm:w-7 -translate-y-1/2 p-0"
              aria-label={t('search.clearAriaLabel')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
        <p>
          {t('search.resultsCount', {
            result: resultCount.toLocaleString(),
            total: totalCount.toLocaleString(),
          })}
          <span className="hidden sm:inline"> {t('search.accounts')}</span>
        </p>
        {processingTime !== undefined && processingTime > 0 && !isFiltering && (
          <p className="text-xs">
            {t('search.time', { time: processingTime < 1 ? '<1' : Math.round(processingTime) })}
          </p>
        )}
      </div>
    </div>
  );
}

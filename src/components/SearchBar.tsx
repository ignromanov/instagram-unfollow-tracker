'use client';

import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="space-y-2">
      <div className="relative">
        {isFiltering ? (
          <Loader2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          type="text"
          placeholder="Search accounts..."
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pl-10 pr-10 text-base"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {resultCount.toLocaleString()} of {totalCount.toLocaleString()} accounts
        </p>
        {processingTime !== undefined && processingTime > 0 && !isFiltering && (
          <p className="text-xs">{processingTime < 1 ? '<1' : Math.round(processingTime)}ms</p>
        )}
      </div>
    </div>
  );
}

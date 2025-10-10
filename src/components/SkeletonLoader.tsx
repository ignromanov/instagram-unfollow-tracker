export function AccountListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" data-testid="account-list-skeleton">
      <div className="h-5 w-32 animate-pulse rounded bg-muted/60" />
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4 shadow-sm"
          >
            <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gradient-to-br from-muted to-muted/60" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
              <div className="flex gap-1.5">
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted/60" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted/60" />
                <div className="h-5 w-14 animate-pulse rounded-full bg-muted/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FilterChipsSkeleton() {
  return (
    <div className="space-y-3" data-testid="filter-chips-skeleton">
      <div className="h-5 w-32 animate-pulse rounded bg-muted/60" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-full border border-border/50 bg-muted/60 shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}

# Filtering Architecture

## Overview

This module provides a flexible, testable filtering system for Instagram account data. The architecture separates the pure filtering logic from the execution context, allowing for both high-performance Web Worker-based filtering and synchronous filtering for testing.

## Architecture Components

### 1. Pure Filtering Logic (`runFilter.ts`)

The core filtering algorithm is implemented as a pure function with no side effects:

```typescript
runFilter(accounts, searchQuery, activeFilters): AccountBadges[]
```

**Features:**

- Single-pass filtering for optimal performance
- Pre-compiled regex for search queries
- AND logic for multiple badge filters
- Comprehensive input validation
- Handles invalid account structures gracefully

**Testing:** Can be tested directly with unit tests, no mocking required.

### 2. FilterEngine Interface (`engine.ts`)

Abstract interface that defines the contract for filtering implementations:

```typescript
interface FilterEngine {
  filter(accounts, searchQuery, activeFilters): Promise<FilterEngineResult>;
  dispose(): void;
  getType(): 'worker' | 'sync';
}
```

This abstraction allows consumers to depend on the interface rather than specific implementations.

### 3. Synchronous Engine (`SyncFilterEngine.ts`)

Runs filtering on the main thread using the pure `runFilter` function.

**Use Cases:**

- Unit tests (no worker mocking needed)
- Small datasets (< 1000 accounts)
- Environments where workers are unavailable (SSR, some test environments)
- Development and debugging

**Advantages:**

- Simple, predictable behavior
- Easy to debug
- No worker overhead

### 4. Worker Engine (`WorkerFilterEngine.ts`)

Offloads filtering to a Web Worker for large datasets.

**Use Cases:**

- Large datasets (10,000+ accounts)
- Production environment with influencer accounts
- Maintaining UI responsiveness during heavy filtering

**Features:**

- Background thread execution
- Filter result caching
- Automatic fallback to main thread if worker fails
- Request coalescing to prevent duplicate work

### 5. Hook Integration (`useFilterEngine.ts`)

React hook that manages engine lifecycle and provides filtering functionality.

**Configuration:**

```typescript
const { filterAccounts } = useFilterEngine({
  mode: 'auto', // 'worker' | 'sync' | 'auto'
  autoThreshold: 1000, // Switch to worker for datasets >= this size
});
```

**Modes:**

- `'worker'`: Always use Web Worker
- `'sync'`: Always use synchronous filtering
- `'auto'`: Automatically choose based on dataset size (default)

## Usage Examples

### Basic Usage (Auto Mode)

```typescript
import { useFilterEngine } from '@/hooks/useFilterEngine';

function MyComponent() {
  const { filterAccounts } = useFilterEngine(); // Auto mode by default

  const results = await filterAccounts(accounts, 'search', ['following']);
}
```

### Testing with Synchronous Engine

```typescript
import { SyncFilterEngine } from '@/lib/filtering';

describe('MyComponent', () => {
  it('should filter accounts', async () => {
    const engine = new SyncFilterEngine();
    const result = await engine.filter(mockAccounts, 'test', []);
    expect(result.filteredAccounts).toHaveLength(1);
  });
});
```

### Direct Pure Function Testing

```typescript
import { runFilter } from '@/lib/filtering';

describe('runFilter', () => {
  it('should filter by username', () => {
    const result = runFilter(accounts, 'john', []);
    expect(result).toHaveLength(1);
  });
});
```

## Performance Characteristics

### runFilter (Pure Function)

- **Small datasets** (< 100): < 1ms
- **Medium datasets** (1,000): ~ 5-10ms
- **Large datasets** (10,000): ~ 50-100ms
- **Very large datasets** (100,000): ~ 500-1000ms

### SyncFilterEngine

- Same as `runFilter` + minimal async overhead (< 1ms)

### WorkerFilterEngine

- **Small datasets**: Higher overhead due to worker communication (~ 5-10ms)
- **Large datasets**: Frees main thread, UI remains responsive
- **With caching**: Near-instant for repeated queries (< 1ms)

## Testing Strategy

### Unit Tests

- **runFilter.ts**: Test pure filtering logic with various inputs
- **SyncFilterEngine.ts**: Test engine interface implementation
- **WorkerFilterEngine.ts**: Test with worker mocks or integration tests

### Integration Tests

- **useFilterEngine.ts**: Test hook lifecycle and mode switching
- **useAccountFiltering.ts**: Test full filtering flow with real data

### Performance Tests

- Benchmark with datasets of varying sizes
- Verify auto-mode threshold behavior
- Test caching effectiveness

## Migration Guide

### From Old useFilterWorker

**Before:**

```typescript
import { useFilterWorker } from './useFilterWorker';

const { filterAccounts, terminateWorker } = useFilterWorker();
```

**After:**

```typescript
import { useFilterEngine } from './useFilterEngine';

const { filterAccounts, terminateEngine } = useFilterEngine();
```

The API is almost identical, just rename `terminateWorker` → `terminateEngine`.

## Future Optimizations

Potential enhancements that can be added without changing the public API:

1. **Chunked Filtering**: Process large datasets in chunks to show progressive results
2. **Indexed Search**: Pre-build search indexes for even faster queries
3. **WASM Filtering**: Use WebAssembly for maximum performance
4. **Worker Pool**: Use multiple workers for parallel filtering
5. **Smart Caching**: LRU cache with memory-aware eviction

All these can be implemented as new `FilterEngine` implementations.

## Troubleshooting

### Worker Not Initializing

**Symptom:** Filtering falls back to main thread even with large datasets

**Solutions:**

- Check browser console for worker initialization errors
- Verify Web Worker support in the browser
- Check Content Security Policy (CSP) settings
- Try explicit `mode: 'sync'` to test if issue is worker-specific

### Slow Filtering Performance

**Symptom:** UI freezes during filtering

**Solutions:**

- Verify `mode: 'auto'` or `mode: 'worker'` is used
- Check dataset size and consider increasing `autoThreshold`
- Profile with browser DevTools to identify bottlenecks
- Verify caching is working (check cache hit logs)

### Test Failures

**Symptom:** Tests timeout or fail intermittently

**Solutions:**

- Use `SyncFilterEngine` in tests for deterministic behavior
- Reset filter state with `resetFilterState()` before each test
- Mock `useFilterEngine` to return synchronous engine
- Increase test timeouts for integration tests

## Performance Metrics

The filtering system tracks processing time for all operations:

```typescript
const result = await engine.filter(accounts, query, filters);
console.log(`Filtering took ${result.processingTime}ms`);
```

Use this to monitor and optimize performance in production.

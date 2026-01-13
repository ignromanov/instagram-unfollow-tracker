# Sample Data Feature

## Overview

The sample data feature allows users to try the app with realistic mock Instagram data without uploading their own files. This is useful for:

- New users exploring features
- Testing the app
- Demonstrations
- Screenshots/marketing

## Architecture

### Data Generation

**File**: `src/lib/sample-data.ts`

The sample data generator creates realistic Instagram accounts with various badge types:

- 500 following accounts
- 450 follower accounts
- 200 mutual connections
- 150 non-mutual follows
- 100 fans (they follow you, you don't follow back)
- 80 unfollowed accounts
- 30 pending requests
- 25 close friends
- 20 restricted accounts
- 15 permanently rejected requests
- 10 dismissed suggestions

**Total**: ~1,180 accounts (varies due to badge overlap)

### Storage

Sample data is stored in IndexedDB using the exact same flow as real uploads:

- File hash: `sample-demo-data-v1` (consistent identifier)
- Columnar storage (usernames, display names)
- Bitset-based badges (1-bit per account per badge)
- Cached for instant subsequent loads

### Username Generation

Usernames are generated using realistic patterns:

- `user123`, `dev456`, `photo789`
- `tech_unfollowed_42`, `art_pending_57`
- `music_official99`, `travel_pro_100`

All usernames are unique and sorted alphabetically.

## Integration

### Hook: useSampleData

**File**: `src/hooks/useSampleData.ts`

```typescript
const { handleLoadSample, handleClearSample, isGenerating } = useSampleData();

// Load sample data
await handleLoadSample();

// Clear sample data (optional)
await handleClearSample();
```

### UI Integration

**File**: `src/components/steps/HeroStep.tsx`

The "Try with Sample" button is prominently displayed on the hero section alongside "Get Started".

When clicked:

1. Shows loading state
2. Generates/loads sample data from IndexedDB
3. Sets default filters (unfollowed, notFollowingBack, mutuals)
4. Navigates to results page
5. Tracks analytics event

## Performance

| Operation            | Time                       |
| -------------------- | -------------------------- |
| **First generation** | ~50-100ms                  |
| **Subsequent loads** | ~10ms (cached)             |
| **Storage size**     | ~30KB (columnar + bitsets) |
| **Memory usage**     | <500KB                     |

## Analytics

Sample data loads are tracked with:

- `fileUploadStart(hash, size=0)` - marked as 0MB
- `fileUploadSuccess(hash, count, time, fromCache=true)` - marked as cached

This allows distinguishing sample loads from real uploads in analytics.

## Testing

**Files**:

- `src/__tests__/lib/sample-data.test.ts` - Data generation logic
- `src/__tests__/hooks/useSampleData.test.ts` - Hook behavior

Run tests:

```bash
npm run test -- sample-data
```

## Utilities

### Check if sample data exists

```typescript
import { hasSampleData } from '@/lib/sample-data';

const exists = await hasSampleData();
```

### Get sample file hash

```typescript
import { getSampleFileHash } from '@/lib/sample-data';

const hash = getSampleFileHash(); // 'sample-demo-data-v1'
```

### Clear sample data

```typescript
import { clearSampleData } from '@/lib/sample-data';

await clearSampleData(); // Removes from IndexedDB
```

## Future Enhancements

Potential improvements:

- Multiple sample datasets (small, medium, large)
- Configurable distributions
- Localized usernames (different languages)
- Sample data with historical context (multiple exports over time)
- Pre-computed search indexes for instant load

## Notes

- Sample data is clearly labeled as "Sample Data (Demo)" in UI
- Sample data can coexist with real user data (different file hashes)
- Clearing user data does NOT clear sample data (separate operation)
- Sample data uses production code paths (same as real uploads)

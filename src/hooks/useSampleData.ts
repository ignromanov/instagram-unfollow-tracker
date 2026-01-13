/**
 * Sample Data Hook - Clean Data Loader
 *
 * Responsibilities:
 * - Load sample data into IndexedDB
 * - Provide loading/error state
 * - Return sample metadata for use in router
 *
 * NOT responsible for:
 * - Navigation (router's job)
 * - Setting filters (caller's choice)
 * - Updating user's fileMetadata in store (sample is separate)
 */

import { useCallback, useState } from 'react';
import { generateAndStoreSampleData, clearSampleData } from '@/lib/sample-data';
import { analytics } from '@/lib/analytics';

export interface SampleDataResult {
  fileHash: string;
  accountCount: number;
}

type SampleDataState = 'idle' | 'loading' | 'success' | 'error';

export interface UseSampleDataReturn {
  // Actions
  load: () => Promise<SampleDataResult>;
  clear: () => Promise<void>;

  // State
  state: SampleDataState;
  error: string | null;

  // Result (available after success)
  data: SampleDataResult | null;
}

export function useSampleData(): UseSampleDataReturn {
  const [state, setState] = useState<SampleDataState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SampleDataResult | null>(null);

  const load = useCallback(async (): Promise<SampleDataResult> => {
    setState('loading');
    setError(null);
    const startTime = performance.now();

    try {
      const result = await generateAndStoreSampleData();
      const loadTimeMs = performance.now() - startTime;

      analytics.sampleDataLoad(result.accountCount, loadTimeMs);

      setState('success');
      setData(result);
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load sample data';
      setState('error');
      setError(message);
      throw e;
    }
  }, []);

  const clear = useCallback(async () => {
    try {
      await clearSampleData();
      setState('idle');
      setData(null);
      setError(null);
    } catch (e) {
      console.error('[useSampleData] Failed to clear sample data:', e);
    }
  }, []);

  return { load, clear, state, error, data };
}

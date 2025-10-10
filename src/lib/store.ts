import type { BadgeKey, FileMetadata } from '@/core/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  filters: Set<BadgeKey>;
  currentFileName: string | null;
  uploadStatus: 'idle' | 'loading' | 'success' | 'error';
  uploadError: string | null;
  fileMetadata: FileMetadata | null;
  _hasHydrated: boolean;
  setFilters: (filters: Set<BadgeKey>) => void;
  setUploadInfo: (info: {
    currentFileName?: string | null;
    uploadStatus?: 'idle' | 'loading' | 'success' | 'error';
    uploadError?: string | null;
    fileSize?: number;
    uploadDate?: Date;
    fileHash?: string;
    accountCount?: number;
  }) => void;
  clearData: () => void;
}

// Helper to serialize Set for persist
function serializeSet<T>(set: Set<T>): T[] {
  return Array.from(set.values());
}
function deserializeSet<T>(arr: T[] | undefined): Set<T> {
  return new Set(arr ?? []);
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      filters: new Set<BadgeKey>(),
      currentFileName: null,
      uploadStatus: 'idle',
      uploadError: null,
      fileMetadata: null,
      _hasHydrated: false,
      setFilters: filters => set({ filters: new Set(filters) }),
      setUploadInfo: info =>
        set(state => {
          const newState: Partial<AppState> = {
            currentFileName: info.currentFileName ?? state.currentFileName,
            uploadStatus: info.uploadStatus ?? state.uploadStatus,
            uploadError: info.uploadError ?? state.uploadError,
          };

          // Update fileMetadata when we have file info and success status
          if (info.currentFileName && info.uploadStatus === 'success') {
            newState.fileMetadata = {
              name: info.currentFileName,
              size: info.fileSize || 0,
              uploadDate: info.uploadDate || new Date(),
              fileHash: info.fileHash,
              accountCount: info.accountCount,
            };
          }

          // Clear fileMetadata on error
          if (info.uploadStatus === 'error') {
            newState.fileMetadata = null;
          }

          return newState;
        }),
      clearData: () =>
        set({
          currentFileName: null,
          uploadStatus: 'idle',
          uploadError: null,
          fileMetadata: null,
          filters: new Set<BadgeKey>(),
        }),
    }),
    {
      name: 'unfollow-radar-store',
      version: 2, // Increment version to clear old data
      migrate: (persistedState: any, version: number) => {
        // If version is 1 or older, clear all data and start fresh
        if (version <= 1) {
          return {
            filters: new Set<BadgeKey>(),
            currentFileName: null,
            uploadStatus: 'idle' as const,
            uploadError: null,
            fileMetadata: null,
            _hasHydrated: false,
          };
        }

        // For future versions, return the persisted state as-is
        return persistedState;
      },
      partialize: state =>
        ({
          filters: serializeSet(state.filters),
          currentFileName: state.currentFileName,
          uploadStatus: state.uploadStatus,
          uploadError: state.uploadError,
          fileMetadata: state.fileMetadata,
        }) as unknown as Partial<AppState>,
      onRehydrateStorage: () => state => {
        if (state) {
          state._hasHydrated = true;
        }
      },
      storage: {
        getItem: name => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const json = JSON.parse(str);
          if (Array.isArray(json.state?.filters)) {
            json.state.filters = deserializeSet(json.state.filters);
          }
          return json;
        },
        setItem: (name, value) => {
          const val = { ...value } as any;
          if (val.state?.filters instanceof Set) {
            val.state.filters = serializeSet(val.state.filters);
          }
          localStorage.setItem(name, JSON.stringify(val));
        },
        removeItem: name => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

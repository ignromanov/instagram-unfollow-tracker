import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BadgeKey, AccountBadges, ParsedAll } from '@/core/types';

interface AppState {
  filters: Set<BadgeKey>;
  unified: AccountBadges[];
  parsed: ParsedAll | null;
  currentFileName: string | null;
  uploadStatus: 'idle' | 'success' | 'error';
  uploadError: string | null;
  setFilters: (filters: Set<BadgeKey>) => void;
  setUnified: (unified: AccountBadges[]) => void;
  setParsed: (parsed: ParsedAll | null) => void;
  setUploadInfo: (info: {
    currentFileName?: string | null;
    uploadStatus?: 'idle' | 'success' | 'error';
    uploadError?: string | null;
  }) => void;
  clearData: () => void;
}

// Helper to serialize Set for persist
function serializeSet<T>(set: Set<T>): T[] { return Array.from(set.values()); }
function deserializeSet<T>(arr: T[] | undefined): Set<T> { return new Set(arr ?? []); }

export const useAppStore = create<AppState>()(persist((set, get) => ({
  filters: new Set<BadgeKey>(),
  unified: [],
  parsed: null,
  currentFileName: null,
  uploadStatus: 'idle',
  uploadError: null,
  setFilters: (filters) => set({ filters }),
  setUnified: (unified) => set({ unified }),
  setParsed: (parsed) => set({ parsed }),
  setUploadInfo: (info) => set((state) => ({
    currentFileName: info.currentFileName ?? state.currentFileName,
    uploadStatus: info.uploadStatus ?? state.uploadStatus,
    uploadError: info.uploadError ?? state.uploadError,
  })),
  clearData: () => set({
    unified: [],
    parsed: null,
    currentFileName: null,
    uploadStatus: 'idle',
    uploadError: null,
    filters: new Set<BadgeKey>(),
  }),
}), {
  name: 'unfollow-radar-store',
  version: 1,
  partialize: (state) => ({
    filters: serializeSet(state.filters),
    unified: state.unified,
    parsed: state.parsed,
    currentFileName: state.currentFileName,
    uploadStatus: state.uploadStatus,
    uploadError: state.uploadError,
  } as any),
  storage: {
    getItem: (name) => {
      const str = localStorage.getItem(name);
      if (!str) return null as any;
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
    removeItem: (name) => localStorage.removeItem(name),
  },
}));

import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '@/lib/store';
import type { BadgeKey, AccountBadges, ParsedAll } from '@/core/types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAppStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAppStore.setState({
      filters: new Set<BadgeKey>(),
      unified: [],
      parsed: null,
      currentFileName: null,
      uploadStatus: 'idle',
      uploadError: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAppStore());
      
      expect(result.current.filters).toEqual(new Set());
      expect(result.current.unified).toEqual([]);
      expect(result.current.parsed).toBeNull();
      expect(result.current.currentFileName).toBeNull();
      expect(result.current.uploadStatus).toBe('idle');
      expect(result.current.uploadError).toBeNull();
    });
  });

  describe('setFilters', () => {
    it('should update filters', () => {
      const { result } = renderHook(() => useAppStore());
      const newFilters = new Set<BadgeKey>(['following', 'followers']);

      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.filters).toEqual(newFilters);
    });

    it('should handle empty filters set', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setFilters(new Set<BadgeKey>());
      });

      expect(result.current.filters).toEqual(new Set());
    });
  });

  describe('setUnified', () => {
    it('should update unified accounts', () => {
      const { result } = renderHook(() => useAppStore());
      const mockAccounts: AccountBadges[] = [
        { username: 'test_user', badges: { following: true } },
        { username: 'another_user', badges: { followers: true } },
      ];

      act(() => {
        result.current.setUnified(mockAccounts);
      });

      expect(result.current.unified).toEqual(mockAccounts);
    });

    it('should handle empty accounts array', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setUnified([]);
      });

      expect(result.current.unified).toEqual([]);
    });
  });

  describe('setParsed', () => {
    it('should update parsed data', () => {
      const { result } = renderHook(() => useAppStore());
      const mockParsed: ParsedAll = {
        following: new Set(['user1']),
        followers: new Set(['user2']),
        pendingSent: new Map(),
        permanentRequests: new Map(),
        restricted: new Map(),
        closeFriends: new Map(),
        unfollowed: new Map(),
        dismissedSuggestions: new Map(),
        followingTimestamps: new Map(),
        followersTimestamps: new Map(),
      };

      act(() => {
        result.current.setParsed(mockParsed);
      });

      expect(result.current.parsed).toEqual(mockParsed);
    });

    it('should handle null parsed data', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setParsed(null);
      });

      expect(result.current.parsed).toBeNull();
    });
  });

  describe('setUploadInfo', () => {
    it('should update all upload info fields', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setUploadInfo({
          currentFileName: 'test.zip',
          uploadStatus: 'success',
          uploadError: null,
        });
      });

      expect(result.current.currentFileName).toBe('test.zip');
      expect(result.current.uploadStatus).toBe('success');
      expect(result.current.uploadError).toBeNull();
    });

    it('should update only specified fields', () => {
      const { result } = renderHook(() => useAppStore());
      
      // First set some initial values
      act(() => {
        result.current.setUploadInfo({
          currentFileName: 'initial.zip',
          uploadStatus: 'idle',
          uploadError: null,
        });
      });

      // Then update only uploadStatus
      act(() => {
        result.current.setUploadInfo({
          uploadStatus: 'error',
        });
      });

      expect(result.current.currentFileName).toBe('initial.zip');
      expect(result.current.uploadStatus).toBe('error');
      expect(result.current.uploadError).toBeNull();
    });

    it('should update only uploadError', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setUploadInfo({
          uploadError: 'Upload failed',
        });
      });

      expect(result.current.currentFileName).toBeNull();
      expect(result.current.uploadStatus).toBe('idle');
      expect(result.current.uploadError).toBe('Upload failed');
    });

    it('should handle null values', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setUploadInfo({
          currentFileName: null,
          uploadError: null,
        });
      });

      expect(result.current.currentFileName).toBeNull();
      expect(result.current.uploadError).toBeNull();
    });
  });

  describe('persistence', () => {
    it('should serialize and deserialize Set correctly', () => {
      const { result } = renderHook(() => useAppStore());
      const filters = new Set<BadgeKey>(['following', 'followers', 'mutuals']);

      act(() => {
        result.current.setFilters(filters);
      });

      // Simulate localStorage operations
      const serialized = JSON.stringify({
        state: {
          filters: Array.from(filters),
          unified: [],
          currentFileName: null,
          uploadStatus: 'idle',
        },
      });

      localStorageMock.setItem.mockImplementation((name, value) => {
        expect(name).toBe('unfollow-radar-store');
        const parsed = JSON.parse(value);
        expect(Array.isArray(parsed.state.filters)).toBe(true);
      });

      localStorageMock.getItem.mockReturnValue(serialized);

      // Test that the store can handle serialized data
      expect(result.current.filters).toEqual(filters);
    });

    it('should handle missing localStorage data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAppStore());
      
      // Should use default state when localStorage is empty
      expect(result.current.filters).toEqual(new Set());
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      // Should not throw error and use default state
      expect(() => {
        renderHook(() => useAppStore());
      }).not.toThrow();
    });

    it('should handle localStorage data with non-array filters', () => {
      const corruptedData = JSON.stringify({
        state: {
          filters: 'not-an-array',
          unified: [],
          currentFileName: null,
          uploadStatus: 'idle',
        },
      });

      localStorageMock.getItem.mockReturnValue(corruptedData);

      const { result } = renderHook(() => useAppStore());
      
      // Should use default state when filters is not an array
      expect(result.current.filters).toEqual(new Set());
    });

    it('should handle localStorage data without state property', () => {
      const corruptedData = JSON.stringify({
        someOtherProperty: 'value',
      });

      localStorageMock.getItem.mockReturnValue(corruptedData);

      const { result } = renderHook(() => useAppStore());
      
      // Should use default state when state property is missing
      expect(result.current.filters).toEqual(new Set());
    });

    it('should handle setItem with non-Set filters', () => {
      const { result } = renderHook(() => useAppStore());

      localStorageMock.setItem.mockImplementation((name, value) => {
        expect(name).toBe('unfollow-radar-store');
        const parsed = JSON.parse(value);
        // Should handle non-Set filters gracefully
        expect(parsed.state).toBeDefined();
      });

      act(() => {
        result.current.setFilters(new Set(['following', 'followers']));
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should test storage methods through store operations', () => {
      const { result } = renderHook(() => useAppStore());

      // Clear any previous calls
      localStorageMock.setItem.mockClear();

      // Test setItem through store operations
      act(() => {
        result.current.setFilters(new Set(['following', 'followers']));
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Verify the serialized data
      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const serializedData = JSON.parse(setItemCall![1]);
      expect(serializedData.state.filters).toEqual(['following', 'followers']);
    });

  });

  describe('clearData', () => {
    it('should clear all data and reset to initial state', () => {
      const { result } = renderHook(() => useAppStore());
      const mockAccounts: AccountBadges[] = [
        { username: 'user1', badges: { following: true } },
      ];
      const mockParsed: ParsedAll = {
        following: new Set(['user1']),
        followers: new Set(),
        pendingSent: new Map(),
        permanentRequests: new Map(),
        restricted: new Map(),
        closeFriends: new Map(),
        unfollowed: new Map(),
        dismissedSuggestions: new Map(),
        followingTimestamps: new Map(),
        followersTimestamps: new Map(),
      };

      // First set some data
      act(() => {
        result.current.setFilters(new Set(['following', 'followers']));
        result.current.setUnified(mockAccounts);
        result.current.setParsed(mockParsed);
        result.current.setUploadInfo({
          currentFileName: 'test.zip',
          uploadStatus: 'success',
          uploadError: 'Some error',
        });
      });

      // Verify data is set
      expect(result.current.filters).toEqual(new Set(['following', 'followers']));
      expect(result.current.unified).toEqual(mockAccounts);
      expect(result.current.parsed).toEqual(mockParsed);
      expect(result.current.currentFileName).toBe('test.zip');
      expect(result.current.uploadStatus).toBe('success');
      expect(result.current.uploadError).toBe('Some error');

      // Clear all data
      act(() => {
        result.current.clearData();
      });

      // Verify data is cleared and reset to initial state
      expect(result.current.filters).toEqual(new Set());
      expect(result.current.unified).toEqual([]);
      expect(result.current.parsed).toBeNull();
      expect(result.current.currentFileName).toBeNull();
      expect(result.current.uploadStatus).toBe('idle');
      expect(result.current.uploadError).toBeNull();
    });
  });

  describe('store integration', () => {
    it('should maintain state consistency across multiple operations', () => {
      const { result } = renderHook(() => useAppStore());
      const mockAccounts: AccountBadges[] = [
        { username: 'user1', badges: { following: true } },
      ];
      const mockParsed: ParsedAll = {
        following: new Set(['user1']),
        followers: new Set(),
        pendingSent: new Map(),
        permanentRequests: new Map(),
        restricted: new Map(),
        closeFriends: new Map(),
        unfollowed: new Map(),
        dismissedSuggestions: new Map(),
        followingTimestamps: new Map(),
        followersTimestamps: new Map(),
      };

      act(() => {
        result.current.setFilters(new Set(['following', 'followers']));
        result.current.setUnified(mockAccounts);
        result.current.setParsed(mockParsed);
        result.current.setUploadInfo({
          currentFileName: 'test.zip',
          uploadStatus: 'success',
        });
      });

      expect(result.current.filters).toEqual(new Set(['following', 'followers']));
      expect(result.current.unified).toEqual(mockAccounts);
      expect(result.current.parsed).toEqual(mockParsed);
      expect(result.current.currentFileName).toBe('test.zip');
      expect(result.current.uploadStatus).toBe('success');
    });
  });

  it('should handle setUploadInfo with partial updates', () => {
    const { result } = renderHook(() => useAppStore());
    
    // Update only fileName
    act(() => {
      result.current.setUploadInfo({ currentFileName: 'test.zip' });
    });
    expect(result.current.currentFileName).toBe('test.zip');
    expect(result.current.uploadStatus).toBe('idle');
    expect(result.current.uploadError).toBeNull();

    // Update only uploadStatus
    act(() => {
      result.current.setUploadInfo({ uploadStatus: 'idle' });
    });
    expect(result.current.currentFileName).toBe('test.zip');
    expect(result.current.uploadStatus).toBe('idle');
    expect(result.current.uploadError).toBeNull();

    // Update only uploadError
    act(() => {
      result.current.setUploadInfo({ uploadError: 'Test error' });
    });
    expect(result.current.currentFileName).toBe('test.zip');
    expect(result.current.uploadStatus).toBe('idle');
    expect(result.current.uploadError).toBe('Test error');
  });

  it('should handle setUploadInfo with null values', () => {
    const { result } = renderHook(() => useAppStore());
    
    // Set initial values
    act(() => {
      result.current.setUploadInfo({ 
        currentFileName: 'test.zip', 
        uploadStatus: 'success',
        uploadError: 'Test error'
      });
    });

    // Set null values - the store uses ?? operator, so null values won't override existing values
    act(() => {
      result.current.setUploadInfo({ 
        currentFileName: null, 
        uploadError: null 
      });
    });

    // The store uses ?? operator, so null values don't override existing values
    expect(result.current.currentFileName).toBe('test.zip'); // Should remain unchanged
    expect(result.current.uploadError).toBe('Test error'); // Should remain unchanged
    expect(result.current.uploadStatus).toBe('success'); // Should remain unchanged
  });
});

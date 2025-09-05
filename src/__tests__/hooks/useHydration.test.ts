import { useHydration } from '@/hooks/useHydration';
import { useAppStore } from '@/lib/store';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the store
vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn(),
}));

const mockUseAppStore = vi.mocked(useAppStore);

describe('useHydration', () => {
  let mockSubscribe: ReturnType<typeof vi.fn>;
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUnsubscribe = vi.fn();
    mockSubscribe = vi.fn().mockReturnValue(mockUnsubscribe);

    // Mock the store subscription
    (useAppStore as any).subscribe = mockSubscribe;
  });

  it('should return true immediately when store is already hydrated', () => {
    // Mock store state as already hydrated
    mockUseAppStore.mockReturnValue(true);

    const { result } = renderHook(() => useHydration());

    expect(result.current).toBe(true);
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('should return false initially when store is not hydrated', () => {
    // Mock store state as not hydrated
    mockUseAppStore.mockReturnValue(false);

    const { result } = renderHook(() => useHydration());

    expect(result.current).toBe(false);
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('should subscribe to store changes when not hydrated', () => {
    mockUseAppStore.mockReturnValue(false);

    renderHook(() => useHydration());

    expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should update to true when store becomes hydrated', () => {
    mockUseAppStore.mockReturnValue(false);

    const { result } = renderHook(() => useHydration());

    expect(result.current).toBe(false);

    // Simulate store becoming hydrated
    act(() => {
      const subscribeCallback = mockSubscribe.mock.calls[0][0];
      subscribeCallback({ _hasHydrated: true });
    });

    expect(result.current).toBe(true);
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should unsubscribe when store becomes hydrated', () => {
    mockUseAppStore.mockReturnValue(false);

    renderHook(() => useHydration());

    // Simulate store becoming hydrated
    act(() => {
      const subscribeCallback = mockSubscribe.mock.calls[0][0];
      subscribeCallback({ _hasHydrated: true });
    });

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle multiple state changes correctly', () => {
    mockUseAppStore.mockReturnValue(false);

    const { result } = renderHook(() => useHydration());

    expect(result.current).toBe(false);

    // Simulate store still not hydrated
    act(() => {
      const subscribeCallback = mockSubscribe.mock.calls[0][0];
      subscribeCallback({ _hasHydrated: false });
    });

    expect(result.current).toBe(false);

    // Simulate store becoming hydrated
    act(() => {
      const subscribeCallback = mockSubscribe.mock.calls[0][0];
      subscribeCallback({ _hasHydrated: true });
    });

    expect(result.current).toBe(true);
  });

  it('should cleanup subscription on unmount', () => {
    mockUseAppStore.mockReturnValue(false);

    const { unmount } = renderHook(() => useHydration());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle store subscription errors gracefully', () => {
    mockUseAppStore.mockReturnValue(false);
    mockSubscribe.mockImplementation(() => {
      throw new Error('Subscription failed');
    });

    // The hook should handle the error gracefully by not crashing
    const { result } = renderHook(() => useHydration());

    // When subscription fails, the hook should fallback to hydrated=true
    expect(result.current).toBe(true);
  });

  it('should handle rapid state changes', () => {
    mockUseAppStore.mockReturnValue(false);

    const { result } = renderHook(() => useHydration());

    // Simulate rapid state changes
    act(() => {
      const subscribeCallback = mockSubscribe.mock.calls[0][0];
      subscribeCallback({ _hasHydrated: false });
      subscribeCallback({ _hasHydrated: true });
      subscribeCallback({ _hasHydrated: false });
      subscribeCallback({ _hasHydrated: true });
    });

    // Should end up hydrated
    expect(result.current).toBe(true);
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle dependency changes correctly', () => {
    // Start with not hydrated
    mockUseAppStore.mockReturnValue(false);

    const { result, rerender } = renderHook(() => useHydration());

    expect(result.current).toBe(false);

    // Change to hydrated
    mockUseAppStore.mockReturnValue(true);
    rerender();

    expect(result.current).toBe(true);
  });
});

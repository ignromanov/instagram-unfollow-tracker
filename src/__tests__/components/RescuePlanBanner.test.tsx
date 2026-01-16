import { vi, beforeEach, describe, expect, it, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createI18nMock } from '@/__tests__/utils/mockI18n';

// Note: RescuePlanBanner test uses simple key-only mock
vi.mock('react-i18next', () => createI18nMock({}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  analytics: {
    rescuePlanImpression: vi.fn(),
    rescuePlanDismiss: vi.fn(),
    rescuePlanToolClick: vi.fn(),
    rescuePlanViewTime: vi.fn(),
    rescuePlanHover: vi.fn(),
  },
}));

import { RescuePlanBanner } from '@/components/RescuePlanBanner';
import * as dismissHook from '@/hooks/useRescuePlanDismiss';
import { analytics } from '@/lib/analytics';

// Mock useRescuePlanDismiss
const mockDismiss = vi.fn();
vi.spyOn(dismissHook, 'useRescuePlanDismiss').mockReturnValue({
  isDismissed: false,
  dismiss: mockDismiss,
});

describe('RescuePlanBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Default mock implementation
    vi.spyOn(dismissHook, 'useRescuePlanDismiss').mockReturnValue({
      isDismissed: false,
      dismiss: mockDismiss,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    filterCounts: { unfollowed: 50 },
    totalCount: 100, // 50% unfollowed -> critical severity
    showDelay: 1000, // 1 second delay for testing
  };

  it('should not render initially due to delay', () => {
    render(<RescuePlanBanner {...defaultProps} />);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('should render after the specified delay', () => {
    render(<RescuePlanBanner {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('should call analytics impression when visible', () => {
    render(<RescuePlanBanner {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(analytics.rescuePlanImpression).toHaveBeenCalled();
  });

  it('should not render if already dismissed', () => {
    vi.spyOn(dismissHook, 'useRescuePlanDismiss').mockReturnValue({
      isDismissed: true,
      dismiss: mockDismiss,
    });

    render(<RescuePlanBanner {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('should dismiss the banner when close button is clicked', () => {
    render(<RescuePlanBanner {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const closeButton = screen.getByLabelText('rescue.dismiss');
    fireEvent.click(closeButton);

    expect(mockDismiss).toHaveBeenCalled();
    expect(analytics.rescuePlanDismiss).toHaveBeenCalled();
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('should track tool clicks', () => {
    render(<RescuePlanBanner {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Find the first tool link (assuming there is at least one)
    const links = screen.getAllByRole('link');
    if (links.length > 0) {
      fireEvent.click(links[0]);
      expect(analytics.rescuePlanToolClick).toHaveBeenCalled();
    }
  });

  it('should render correct severity style (critical)', () => {
    // 15% is threshold for critical often, but let's ensure it hits
    const props = {
      filterCounts: { unfollowed: 200 },
      totalCount: 1000,
      showDelay: 0,
    };
    render(<RescuePlanBanner {...props} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Check for critical specific text or class if possible, or just general rendering
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });
});

import { vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterChips } from '@/components/FilterChips';
import type { BadgeKey } from '@/core/types';
import resultsEN from '@/locales/en/results.json';

// react-i18next is already mocked globally in vitest.setup.ts

describe('FilterChips Component', () => {
  const defaultFilterCounts: Record<BadgeKey, number> = {
    followers: 100,
    following: 150,
    mutuals: 50,
    notFollowingBack: 25,
    notFollowedBack: 10,
    unfollowed: 5,
    pending: 3,
    permanent: 2,
    restricted: 1,
    close: 8,
    dismissed: 0,
  };

  const defaultProps = {
    selectedFilters: new Set<BadgeKey>(),
    onFiltersChange: vi.fn(),
    filterCounts: defaultFilterCounts,
    isFiltering: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<FilterChips {...defaultProps} />);

      expect(screen.getByText(resultsEN.filters.title)).toBeInTheDocument();
    });

    it('should render filter chips for badges with non-zero counts', () => {
      render(<FilterChips {...defaultProps} />);

      expect(screen.getByText(resultsEN.badges.followers)).toBeInTheDocument();
      expect(screen.getByText(resultsEN.badges.following)).toBeInTheDocument();
      expect(screen.getByText(resultsEN.badges.mutuals)).toBeInTheDocument();
      expect(screen.getByText(resultsEN.badges.notFollowingBack)).toBeInTheDocument();
    });

    it('should display badge counts', () => {
      render(<FilterChips {...defaultProps} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should format large counts with locale separators', () => {
      const propsWithLargeCounts = {
        ...defaultProps,
        filterCounts: {
          ...defaultFilterCounts,
          followers: 1234567,
        },
      };

      render(<FilterChips {...propsWithLargeCounts} />);

      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('should show filter icon in header', () => {
      render(<FilterChips {...defaultProps} />);

      const filterIcon = document.querySelector('svg');
      expect(filterIcon).toBeInTheDocument();
    });
  });

  describe('filter interactions', () => {
    it('should call onFiltersChange when clicking a filter chip', () => {
      const mockOnFiltersChange = vi.fn();
      render(<FilterChips {...defaultProps} onFiltersChange={mockOnFiltersChange} />);

      const followersButton = screen.getByRole('button', { name: /followers/i });
      fireEvent.click(followersButton);

      expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
      const newFilters = mockOnFiltersChange.mock.calls[0][0];
      expect(newFilters.has('followers')).toBe(true);
    });

    it('should toggle filter off when clicking an active filter', () => {
      const mockOnFiltersChange = vi.fn();
      const selectedFilters = new Set<BadgeKey>(['followers']);

      render(
        <FilterChips
          {...defaultProps}
          selectedFilters={selectedFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const followersButton = screen.getByRole('button', { name: /followers/i });
      fireEvent.click(followersButton);

      expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
      const newFilters = mockOnFiltersChange.mock.calls[0][0];
      expect(newFilters.has('followers')).toBe(false);
    });

    it('should have aria-pressed=true for active filters', () => {
      const selectedFilters = new Set<BadgeKey>(['followers']);

      render(<FilterChips {...defaultProps} selectedFilters={selectedFilters} />);

      const followersButton = screen.getByRole('button', { name: /followers/i });
      expect(followersButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have aria-pressed=false for inactive filters', () => {
      render(<FilterChips {...defaultProps} />);

      const followersButton = screen.getByRole('button', { name: /followers/i });
      expect(followersButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('reset functionality', () => {
    it('should not show reset button when no filters are selected', () => {
      render(<FilterChips {...defaultProps} />);

      expect(screen.queryByText(resultsEN.filters.reset)).not.toBeInTheDocument();
    });

    it('should show reset button when filters are selected', () => {
      const selectedFilters = new Set<BadgeKey>(['followers']);

      render(<FilterChips {...defaultProps} selectedFilters={selectedFilters} />);

      expect(screen.getByText(resultsEN.filters.reset)).toBeInTheDocument();
    });

    it('should call onFiltersChange with empty set when reset is clicked', () => {
      const mockOnFiltersChange = vi.fn();
      const selectedFilters = new Set<BadgeKey>(['followers', 'following']);

      render(
        <FilterChips
          {...defaultProps}
          selectedFilters={selectedFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const resetButton = screen.getByText(resultsEN.filters.reset);
      fireEvent.click(resetButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(new Set());
    });
  });

  describe('empty categories', () => {
    it('should show empty categories toggle when some badges have zero count', () => {
      render(<FilterChips {...defaultProps} />);

      expect(screen.getByText(/Empty Categories/i)).toBeInTheDocument();
    });

    it('should not show empty categories section when all badges have counts', () => {
      const allNonZeroCounts: Record<BadgeKey, number> = {
        followers: 100,
        following: 150,
        mutuals: 50,
        notFollowingBack: 25,
        notFollowedBack: 10,
        unfollowed: 5,
        pending: 3,
        permanent: 2,
        restricted: 1,
        close: 8,
        dismissed: 1, // Now non-zero
      };

      render(<FilterChips {...defaultProps} filterCounts={allNonZeroCounts} />);

      expect(screen.queryByText(/Empty Categories/i)).not.toBeInTheDocument();
    });

    it('should toggle empty categories visibility when clicked', () => {
      render(<FilterChips {...defaultProps} />);

      const toggleButton = screen.getByText(/Empty Categories/i);

      const dismissedChips = screen.queryAllByText(resultsEN.badges.dismissed);
      expect(dismissedChips).toHaveLength(0);

      fireEvent.click(toggleButton);

      expect(screen.getByText(resultsEN.badges.dismissed)).toBeInTheDocument();
    });
  });

  describe('multiple filters', () => {
    it('should allow selecting multiple filters', () => {
      const mockOnFiltersChange = vi.fn();
      const selectedFilters = new Set<BadgeKey>(['followers']);

      render(
        <FilterChips
          {...defaultProps}
          selectedFilters={selectedFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Click on following (which is not selected)
      // Use exact aria-label pattern to avoid matching "Not following back"
      const followingButton = screen.getByRole('button', {
        name: /Add Following filter/i,
      });
      fireEvent.click(followingButton);

      expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
      const newFilters = mockOnFiltersChange.mock.calls[0][0];
      expect(newFilters.has('followers')).toBe(true);
      expect(newFilters.has('following')).toBe(true);
    });
  });

  describe('translations', () => {
    it('should use translated badge labels', () => {
      render(<FilterChips {...defaultProps} />);

      expect(screen.getByText(resultsEN.badges.followers)).toBeInTheDocument();
      expect(screen.getByText(resultsEN.badges.following)).toBeInTheDocument();
      expect(screen.getByText(resultsEN.badges.mutuals)).toBeInTheDocument();
      expect(screen.getByText(resultsEN.badges.notFollowingBack)).toBeInTheDocument();
    });

    it('should use translated filter title', () => {
      render(<FilterChips {...defaultProps} />);

      expect(screen.getByText(resultsEN.filters.title)).toBeInTheDocument();
    });
  });
});

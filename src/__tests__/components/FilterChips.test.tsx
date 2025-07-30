import { vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@tests/utils/testUtils';
import { FilterChips } from '@/components/FilterChips';
import { BADGE_ORDER, BADGE_LABELS } from '@/core/badges';
import type { BadgeKey } from '@/core/types';

describe('FilterChips Component', () => {
  const mockOnFiltersChange = vi.fn();

  const defaultFilterCounts = Object.fromEntries(
    BADGE_ORDER.map(key => [key, Math.floor(Math.random() * 10) + 1])
  ) as Record<BadgeKey, number>;

  const defaultProps = {
    selectedFilters: new Set<BadgeKey>(),
    onFiltersChange: mockOnFiltersChange,
    filterCounts: defaultFilterCounts,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all filter chips', () => {
    render(<FilterChips {...defaultProps} />);

    BADGE_ORDER.forEach(badge => {
      const expectedText = `${BADGE_LABELS[badge]} (${defaultFilterCounts[badge]})`;
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });
  });

  it('should display correct counts for each badge', () => {
    render(<FilterChips {...defaultProps} />);

    BADGE_ORDER.forEach(badge => {
      const expectedText = `${BADGE_LABELS[badge]} (${defaultFilterCounts[badge]})`;
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });
  });

  it('should show selected filters as checked', () => {
    const selectedBadges: BadgeKey[] = ['following', 'mutuals'];
    const props = {
      ...defaultProps,
      selectedFilters: new Set(selectedBadges),
    };

    render(<FilterChips {...props} />);

    selectedBadges.forEach(badge => {
      const expectedText = `${BADGE_LABELS[badge]} (${defaultFilterCounts[badge]})`;
      const chip = screen.getByRole('checkbox', { name: expectedText });
      expect(chip).toBeChecked();
    });
  });

  it('should show unselected filters as unchecked', () => {
    const selectedBadges: BadgeKey[] = ['following'];
    const unselectedBadges = BADGE_ORDER.filter(badge => !selectedBadges.includes(badge));

    const props = {
      ...defaultProps,
      selectedFilters: new Set(selectedBadges),
    };

    render(<FilterChips {...props} />);

    unselectedBadges.forEach(badge => {
      const expectedText = `${BADGE_LABELS[badge]} (${defaultFilterCounts[badge]})`;
      const chip = screen.getByRole('checkbox', { name: expectedText });
      expect(chip).not.toBeChecked();
    });
  });

  it('should call onFiltersChange when chip is clicked', () => {
    render(<FilterChips {...defaultProps} />);

    const followingText = `${BADGE_LABELS.following} (${defaultFilterCounts.following})`;
    const followingChip = screen.getByText(followingText);
    fireEvent.click(followingChip);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(new Set(['following']));
  });

  it('should add filter when unselected chip is clicked', () => {
    const props = {
      ...defaultProps,
      selectedFilters: new Set(['following'] as BadgeKey[]),
    };

    render(<FilterChips {...props} />);

    const mutualsText = `${BADGE_LABELS.mutuals} (${defaultFilterCounts.mutuals})`;
    const mutualsChip = screen.getByText(mutualsText);
    fireEvent.click(mutualsChip);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      new Set(['following', 'mutuals'])
    );
  });

  it('should remove filter when selected chip is clicked', () => {
    const props = {
      ...defaultProps,
      selectedFilters: new Set(['following', 'mutuals'] as BadgeKey[]),
    };

    render(<FilterChips {...props} />);

    const followingText = `${BADGE_LABELS.following} (${defaultFilterCounts.following})`;
    const followingChip = screen.getByText(followingText);
    fireEvent.click(followingChip);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(new Set(['mutuals']));
  });

  it('should handle zero counts correctly', () => {
    const zeroCounts = {
      ...defaultFilterCounts,
      permanent: 0,
      dismissed: 0,
    };

    const props = {
      ...defaultProps,
      filterCounts: zeroCounts,
    };

    render(<FilterChips {...props} />);

    expect(screen.getByText(`${BADGE_LABELS.permanent} (0)`)).toBeInTheDocument();
    expect(screen.getByText(`${BADGE_LABELS.dismissed} (0)`)).toBeInTheDocument();
  });

  it('should handle all filters selected', () => {
    const props = {
      ...defaultProps,
      selectedFilters: new Set([...BADGE_ORDER]),
    };

    render(<FilterChips {...props} />);

    BADGE_ORDER.forEach(badge => {
      const expectedText = `${BADGE_LABELS[badge]} (${defaultFilterCounts[badge]})`;
      const chip = screen.getByRole('checkbox', { name: expectedText });
      expect(chip).toBeChecked();
    });
  });

  it('should handle no filters selected', () => {
    render(<FilterChips {...defaultProps} />);

    BADGE_ORDER.forEach(badge => {
      const expectedText = `${BADGE_LABELS[badge]} (${defaultFilterCounts[badge]})`;
      const chip = screen.getByRole('checkbox', { name: expectedText });
      expect(chip).not.toBeChecked();
    });
  });

  it('should show filter count in header', () => {
    const props = {
      ...defaultProps,
      selectedFilters: new Set<BadgeKey>(['following', 'followers']),
    };

    render(<FilterChips {...props} />);

    expect(screen.getByText('Filters (2/11 selected)')).toBeInTheDocument();
  });

  it('should handle Select All button', () => {
    render(<FilterChips {...defaultProps} />);

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      new Set(BADGE_ORDER.filter(key => defaultFilterCounts[key] > 0))
    );
  });

  it('should handle Clear All button', () => {
    const props = {
      ...defaultProps,
      selectedFilters: new Set<BadgeKey>(['following', 'followers']),
    };

    render(<FilterChips {...props} />);

    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(new Set());
  });

  it('should disable Select All when all filters are selected', () => {
    const allFilters = new Set(BADGE_ORDER.filter(key => defaultFilterCounts[key] > 0));
    const props = {
      ...defaultProps,
      selectedFilters: allFilters,
    };

    render(<FilterChips {...props} />);

    const selectAllButton = screen.getByRole('button', { name: 'Select All' });
    expect(selectAllButton).toBeDisabled();
  });

  it('should disable Clear All when no filters are selected', () => {
    render(<FilterChips {...defaultProps} />);

    const clearAllButton = screen.getByRole('button', { name: 'Clear All' });
    expect(clearAllButton).toBeDisabled();
  });
});

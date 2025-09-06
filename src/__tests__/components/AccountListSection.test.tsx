import { AccountListSection } from '@/components/AccountListSection';
import type { BadgeKey } from '@/core/types';
import { useAccountFiltering } from '@/hooks/useAccountFiltering';
import { fireEvent, render, screen } from '@tests/utils/testUtils';
import { beforeEach, vi } from 'vitest';

// Mock the useAccountFiltering hook
vi.mock('@/hooks/useAccountFiltering');

const mockUseAccountFiltering = vi.mocked(useAccountFiltering);

describe('AccountListSection', () => {
  const mockSetQuery = vi.fn();
  const mockSetFilters = vi.fn();
  const mockClearFilters = vi.fn();

  // Default filter counts for most tests
  const defaultFilterCounts = {
    following: 10,
    followers: 15,
    mutuals: 5,
    notFollowingBack: 3,
    notFollowedBack: 2,
    pending: 1,
    permanent: 0,
    restricted: 0,
    close: 2,
    unfollowed: 4,
    dismissed: 1,
  };

  // Helper function to create mock return value
  const createMockReturnValue = (overrides = {}) => ({
    query: '',
    setQuery: mockSetQuery,
    filteredIndices: Array.from({ length: 21 }, (_, i) => i), // 21 indices
    filters: new Set<BadgeKey>(),
    setFilters: mockSetFilters,
    filterCounts: defaultFilterCounts,
    isFiltering: false,
    clearFilters: mockClearFilters,
    totalCount: 21,
    hasLoadedData: true,
    processingTime: 0,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAccountFiltering.mockReturnValue(createMockReturnValue());
  });

  it('should render all components', () => {
    render(<AccountListSection />);

    expect(screen.getByPlaceholderText('Search accounts...')).toBeInTheDocument();
    expect(screen.getByText('Filter by badge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Following (10)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Followers (15)' })).toBeInTheDocument();
  });

  it('should pass correct props to SearchBar', () => {
    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        query: 'alice',
        filteredIndices: [0, 1], // 2 indices
      })
    );

    render(<AccountListSection />);

    // Check that at least one search input has the correct value
    const searchInputs = screen.getAllByPlaceholderText('Search accounts...');
    expect(searchInputs.length).toBeGreaterThan(0);

    // Find the input with the correct value
    const inputWithValue = searchInputs.find(
      input => (input as HTMLInputElement).value === 'alice'
    );
    expect(inputWithValue).toBeTruthy();
    expect(screen.getByText('Showing 2 of 21 accounts')).toBeInTheDocument();
  });

  it('should pass correct props to FilterChips', () => {
    const selectedFilters = new Set<BadgeKey>(['following', 'followers']);

    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        filters: selectedFilters,
        isFiltering: true,
      })
    );

    render(<AccountListSection />);

    // Check that filters are passed correctly (there might be multiple instances)
    const followingButtons = screen.getAllByRole('button', { name: 'Following (10)' });
    const followersButtons = screen.getAllByRole('button', { name: 'Followers (15)' });
    expect(followingButtons.length).toBeGreaterThan(0);
    expect(followersButtons.length).toBeGreaterThan(0);

    // Check that isFiltering is passed (should show loading spinner)
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('should pass correct props to AccountList', () => {
    const filteredIndices = [0, 1, 2]; // 3 indices

    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        filteredIndices,
      })
    );

    render(<AccountListSection />);

    // Check that filtered accounts are passed to AccountList
    expect(screen.getByText('Accounts (3)')).toBeInTheDocument();
  });

  it('should handle search input changes', () => {
    render(<AccountListSection />);

    const searchInput = screen.getByPlaceholderText('Search accounts...');
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    expect(mockSetQuery).toHaveBeenCalledWith('alice');
  });

  it('should handle filter changes', () => {
    render(<AccountListSection />);

    const followingChip = screen.getByRole('button', { name: 'Following (10)' });
    fireEvent.click(followingChip);

    expect(mockSetFilters).toHaveBeenCalled();
  });

  it('should show loading state when filtering', () => {
    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        isFiltering: true,
      })
    );

    render(<AccountListSection />);

    // Should show loading spinner in FilterChips
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();

    // Should pass isLoading=true to AccountList
    expect(screen.getByText('Accounts (21)')).toBeInTheDocument();
  });

  it('should handle empty filtered results', () => {
    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        query: 'nonexistent',
        filteredIndices: [],
      })
    );

    render(<AccountListSection />);

    expect(screen.getByText('Showing 0 of 21 accounts')).toBeInTheDocument();
    expect(screen.getByText('No accounts match your filters')).toBeInTheDocument();
  });

  it('should handle no loaded data', () => {
    const emptyFilterCounts = {
      following: 0,
      followers: 0,
      mutuals: 0,
      notFollowingBack: 0,
      notFollowedBack: 0,
      pending: 0,
      permanent: 0,
      restricted: 0,
      close: 0,
      unfollowed: 0,
      dismissed: 0,
    };

    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        filteredIndices: [],
        filterCounts: emptyFilterCounts,
        totalCount: 0,
      })
    );

    render(<AccountListSection />);

    expect(screen.getByText('Showing 0 of 0 accounts')).toBeInTheDocument();
    expect(screen.getByText('No accounts match your filters')).toBeInTheDocument();
  });

  it('should display correct result count', () => {
    const filteredIndices = [0, 1, 2, 3, 4]; // 5 indices

    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        query: 'test',
        filteredIndices,
      })
    );

    render(<AccountListSection />);

    expect(screen.getByText('Showing 5 of 21 accounts')).toBeInTheDocument();
  });
});

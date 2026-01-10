import { AccountListSection } from '@/components/AccountListSection';
import type { BadgeKey } from '@/core/types';
import { useAccountFiltering } from '@/hooks/useAccountFiltering';
import { fireEvent, render, screen } from '@tests/utils/testUtils';
import { beforeEach, vi } from 'vitest';

// Mock the useAccountFiltering hook
vi.mock('@/hooks/useAccountFiltering');

// Mock child components
vi.mock('@/components/FilterChips', () => ({
  FilterChips: ({
    selectedFilters,
    onFiltersChange,
  }: {
    selectedFilters: Set<BadgeKey>;
    onFiltersChange: (filters: Set<BadgeKey>) => void;
  }) => (
    <div data-testid="filter-chips">
      <p>Active filters: {selectedFilters.size}</p>
      <button onClick={() => onFiltersChange(new Set(['following']))}>Toggle Following</button>
    </div>
  ),
}));

vi.mock('@/components/AccountList', () => ({
  AccountList: ({ accountIndices }: { accountIndices: number[] }) => (
    <div data-testid="account-list">
      <p>Accounts ({accountIndices.length})</p>
      {accountIndices.length === 0 && <p>No accounts match your filters</p>}
    </div>
  ),
}));

vi.mock('@/components/StatCard', () => ({
  StatCard: ({ label, value }: { label: string; value: number }) => (
    <div data-testid={`stat-card-${label.toLowerCase()}`}>
      {label}: {value}
    </div>
  ),
}));

const mockUseAccountFiltering = vi.mocked(useAccountFiltering);

describe('AccountListSection', () => {
  const mockSetQuery = vi.fn();
  const mockSetFilters = vi.fn();

  const defaultProps = {
    fileHash: 'test-hash-123',
    accountCount: 21,
    filename: 'test.zip',
    isSample: false,
  };

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
    totalCount: 21,
    hasLoadedData: true,
    processingTime: 0,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAccountFiltering.mockReturnValue(createMockReturnValue());
  });

  it('should render all main components', () => {
    render(<AccountListSection {...defaultProps} />);

    expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search usernames...')).toBeInTheDocument();
    expect(screen.getByTestId('filter-chips')).toBeInTheDocument();
    expect(screen.getByTestId('account-list')).toBeInTheDocument();
  });

  it('should render stat cards with correct values', () => {
    render(<AccountListSection {...defaultProps} />);

    expect(screen.getByTestId('stat-card-followers')).toHaveTextContent('Followers: 15');
    expect(screen.getByTestId('stat-card-following')).toHaveTextContent('Following: 10');
    expect(screen.getByTestId('stat-card-unfollowed')).toHaveTextContent('Unfollowed: 4');
    expect(screen.getByTestId('stat-card-not following')).toHaveTextContent('Not Following: 3');
  });

  it('should display filename and total count', () => {
    render(<AccountListSection {...defaultProps} />);

    expect(screen.getByText(/test\.zip/)).toBeInTheDocument();
    expect(screen.getByText(/21 Total/)).toBeInTheDocument();
  });

  it('should show sample data banner when isSample is true', () => {
    render(<AccountListSection {...defaultProps} isSample={true} />);

    expect(screen.getByText('Viewing Sample Data')).toBeInTheDocument();
    expect(screen.getByText(/This is demo data/)).toBeInTheDocument();
  });

  it('should not show sample data banner when isSample is false', () => {
    render(<AccountListSection {...defaultProps} isSample={false} />);

    expect(screen.queryByText('Viewing Sample Data')).not.toBeInTheDocument();
  });

  it('should handle search input changes', () => {
    render(<AccountListSection {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search usernames...');
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    expect(mockSetQuery).toHaveBeenCalledWith('alice');
  });

  it('should update search input value from hook', () => {
    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        query: 'alice',
        filteredIndices: [0, 1], // 2 indices
      })
    );

    render(<AccountListSection {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search usernames...') as HTMLInputElement;
    expect(searchInput.value).toBe('alice');
  });

  it('should pass filters to FilterChips', () => {
    const selectedFilters = new Set<BadgeKey>(['following', 'followers']);

    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        filters: selectedFilters,
      })
    );

    render(<AccountListSection {...defaultProps} />);

    expect(screen.getByText('Active filters: 2')).toBeInTheDocument();
  });

  it('should handle filter changes from FilterChips', () => {
    render(<AccountListSection {...defaultProps} />);

    const toggleButton = screen.getByText('Toggle Following');
    fireEvent.click(toggleButton);

    expect(mockSetFilters).toHaveBeenCalled();
  });

  it('should pass filtered indices to AccountList', () => {
    const filteredIndices = [0, 1, 2]; // 3 indices

    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        filteredIndices,
      })
    );

    render(<AccountListSection {...defaultProps} />);

    // AccountList should show correct count
    expect(screen.getByText('Accounts (3)')).toBeInTheDocument();
  });

  it('should handle empty filtered results', () => {
    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        query: 'nonexistent',
        filteredIndices: [],
      })
    );

    render(<AccountListSection {...defaultProps} />);

    expect(screen.getByText('Accounts (0)')).toBeInTheDocument();
    expect(screen.getByText('No accounts match your filters')).toBeInTheDocument();
  });

  it('should handle sort order toggle', () => {
    const filteredIndices = [0, 1, 2, 3, 4];

    mockUseAccountFiltering.mockReturnValue(
      createMockReturnValue({
        filteredIndices,
      })
    );

    render(<AccountListSection {...defaultProps} />);

    const sortButton = screen.getByTitle('Sort Z→A');
    expect(sortButton).toBeInTheDocument();

    fireEvent.click(sortButton);

    // After click, should show "Sort A→Z"
    expect(screen.getByTitle('Sort A→Z')).toBeInTheDocument();
  });

  it('should call useAccountFiltering with correct options', () => {
    render(<AccountListSection {...defaultProps} />);

    expect(mockUseAccountFiltering).toHaveBeenCalledWith({
      fileHash: 'test-hash-123',
      accountCount: 21,
    });
  });

  it('should handle zero filter counts', () => {
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

    render(<AccountListSection {...defaultProps} accountCount={0} />);

    expect(screen.getByTestId('stat-card-followers')).toHaveTextContent('Followers: 0');
    expect(screen.getByTestId('stat-card-following')).toHaveTextContent('Following: 0');
  });
});

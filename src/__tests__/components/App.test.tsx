import { render, screen, fireEvent, waitFor } from '@tests/utils/testUtils';
import { App } from '@/ui/App';
import { useInstagramData } from '@/hooks/useInstagramData';
import { useFilters } from '@/hooks/useFilters';
import { useAppStore } from '@/lib/store';
import { createTestParsedData } from '@tests/fixtures/testData';
import { buildAccountBadgeIndex } from '@/core/badges';
import type { AccountBadges, BadgeKey } from '@/core/types';

// Mock hooks
vi.mock('@/hooks/useInstagramData');
vi.mock('@/hooks/useFilters', () => ({
  useFilters: vi.fn((accounts) => accounts || []), // Return accounts or empty array for testing
}));

// Mock store
vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn((selector) => {
    // Default mock state
    const defaultState = {
      filters: new Set([]),
      unified: [],
      parsed: null,
      currentFileName: null,
      uploadStatus: 'idle' as const,
      uploadError: null,
      setFilters: vi.fn(),
      setUnified: vi.fn(),
      setParsed: vi.fn(),
      setUploadInfo: vi.fn(),
      clearData: vi.fn(),
    };
    return selector ? selector(defaultState) : defaultState;
  }),
}));

const mockUseInstagramData = vi.mocked(useInstagramData);
const mockUseFilters = vi.mocked(useFilters);
const mockUseAppStore = vi.mocked(useAppStore);

describe('App Component', () => {
  const testData = createTestParsedData();
  const accounts = buildAccountBadgeIndex(testData);

  // Helper function to create default mock state
  const createMockState = (overrides = {}) => ({
    filters: new Set([] as BadgeKey[]),
    unified: accounts,
    parsed: testData,
    currentFileName: null,
    uploadStatus: 'idle' as const,
    uploadError: null,
    setFilters: vi.fn(),
    setUnified: vi.fn(),
    setParsed: vi.fn(),
    setUploadInfo: vi.fn(),
    clearData: vi.fn(),
    ...overrides,
  });

  const createMockInstagramData = (overrides = {}) => ({
    meta: testData,
    unified: accounts,
    uploadState: { status: 'idle' as const, error: null, fileName: null },
    handleZipUpload: vi.fn(),
    handleClearData: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseInstagramData.mockReturnValue(createMockInstagramData());
    mockUseFilters.mockImplementation((accounts) => accounts || []);
    mockUseAppStore.mockImplementation((selector) => selector(createMockState()));
  });

  it('should render main components', () => {
    render(<App />);

    expect(screen.getByText('📊 Instagram Unfollow Tracker')).toBeInTheDocument();
    expect(screen.getByText('Analyze your Instagram connections and find who unfollowed you')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search username…')).toBeInTheDocument();
  });

  it('should display filter chips', () => {
    render(<App />);

    // Check that filter chips are rendered (using more specific selectors)
    expect(screen.getByRole('checkbox', { name: /Following \(\d+\)/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Followers \(\d+\)/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Mutuals \(\d+\)/ })).toBeInTheDocument();
  });

  it('should display account list', () => {
    render(<App />);

    // Check that some accounts are displayed
    expect(screen.getByText('@alice_mutual')).toBeInTheDocument();
    expect(screen.getByText('@bob_mutual')).toBeInTheDocument();
  });

  it('should handle search input changes', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search username…');
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    expect(searchInput).toHaveValue('alice');
  });

  it('should handle file upload', async () => {
    const mockHandleZipUpload = vi.fn();
    mockUseInstagramData.mockReturnValue(createMockInstagramData({
      handleZipUpload: mockHandleZipUpload,
    }));

    render(<App />);

    const file = new File(['test'], 'test.zip', { type: 'application/zip' });
    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput!, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockHandleZipUpload).toHaveBeenCalledWith(file);
    });
  });

  it('should display upload success', () => {
    mockUseInstagramData.mockReturnValue(createMockInstagramData({
      uploadState: { status: 'success', error: null, fileName: 'test.zip' },
    }));

    render(<App />);

    expect(screen.getByText('test.zip')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should display shortened filename for long names', () => {
    const longFileName = 'very_long_instagram_data_file_name_2024.zip';
    mockUseInstagramData.mockReturnValue(createMockInstagramData({
      uploadState: { status: 'success', error: null, fileName: longFileName },
    }));

    render(<App />);

    // Should show beginning and end of filename
    expect(screen.getByText('very_long_in...ame_2024.zip')).toBeInTheDocument();
  });

  it('should display upload error', () => {
    mockUseInstagramData.mockReturnValue(createMockInstagramData({
      uploadState: { status: 'error', error: 'Upload failed', fileName: null },
    }));

    render(<App />);

    expect(screen.getByText('❌ Upload failed')).toBeInTheDocument();
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should handle filter changes', () => {
    const mockSetFilters = vi.fn();
    mockUseAppStore.mockImplementation((selector) =>
      selector(createMockState({ setFilters: mockSetFilters }))
    );

    render(<App />);

    const followersChip = screen.getByRole('checkbox', { name: /Followers \(\d+\)/ });
    fireEvent.click(followersChip);

    expect(mockSetFilters).toHaveBeenCalled();
  });


  it('should handle empty account list', () => {
    mockUseInstagramData.mockReturnValue(createMockInstagramData({
      meta: null,
      unified: [],
    }));

    // Mock useFilters to return empty array for empty state
    mockUseFilters.mockReturnValue([]);

    render(<App />);

    expect(screen.getByText('📭 No results. Try another query or adjust filters.')).toBeInTheDocument();
  });

  it('should render help button in header', () => {
    mockUseInstagramData.mockReturnValue(createMockInstagramData());
    mockUseAppStore.mockImplementation((selector) => selector(createMockState({
      unified: accounts || [], // Ensure unified is an array
    })));

    render(<App />);

    expect(screen.getByText('❓ Help')).toBeInTheDocument();
  });

  it('should show instructions alert in empty state', () => {
    mockUseInstagramData.mockReturnValue(createMockInstagramData({
      meta: null,
      unified: [],
    }));
    mockUseAppStore.mockImplementation((selector) => selector(createMockState({
      unified: [], // Ensure unified is an array
    })));

    render(<App />);

    expect(screen.getByText('Get Started with Instagram Data')).toBeInTheDocument();
    expect(screen.getByText('📖 View Step-by-Step Guide')).toBeInTheDocument();
  });

  it('should open instructions modal when help button is clicked', async () => {
    mockUseInstagramData.mockReturnValue(createMockInstagramData());
    mockUseAppStore.mockImplementation((selector) => selector(createMockState({
      unified: accounts || [], // Ensure unified is an array
    })));

    render(<App />);

    fireEvent.click(screen.getByText('❓ Help'));

    await waitFor(() => {
      expect(screen.getByText('📥 How to Download Your Instagram Data')).toBeInTheDocument();
    });
  });

  it('should clear search when clear button is clicked', () => {
    mockUseInstagramData.mockReturnValue(createMockInstagramData());
    mockUseAppStore.mockImplementation((selector) => selector(createMockState({
      unified: accounts || [],
    })));

    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search username…');

    // Type something in search
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput).toHaveValue('test');

    // Click clear button
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    // Search should be cleared
    expect(searchInput).toHaveValue('');
  });


  it('should handle multiple filter selection', () => {
    mockUseAppStore.mockImplementation((selector) =>
      selector(createMockState({
        filters: new Set(['following', 'followers'] as BadgeKey[]),
      }))
    );

    render(<App />);

    expect(screen.getByRole('checkbox', { name: /Following \(\d+\)/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Followers \(\d+\)/ })).toBeInTheDocument();
  });

  it('should handle no filters selected', () => {
    mockUseAppStore.mockImplementation((selector) =>
      selector(createMockState({ filters: new Set<BadgeKey>() }))
    );

    // Mock useFilters to return empty array when no filters are selected
    mockUseFilters.mockReturnValue([]);

    render(<App />);

    expect(screen.getByText('📭 No results. Try another query or adjust filters.')).toBeInTheDocument();
  });

  it('should display Instagram links correctly', () => {
    render(<App />);

    const aliceLink = screen.getByText('@alice_mutual').closest('a');
    expect(aliceLink).toHaveAttribute('href', 'https://www.instagram.com/alice_mutual');
    expect(aliceLink).toHaveAttribute('target', '_blank');
    expect(aliceLink).toHaveAttribute('rel', 'noreferrer');
  });

  it('should handle file upload errors gracefully', async () => {
    const mockHandleZipUpload = vi.fn().mockRejectedValue(new Error('Upload failed'));
    mockUseInstagramData.mockReturnValue(createMockInstagramData({
      handleZipUpload: mockHandleZipUpload,
    }));

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<App />);

    const file = new File(['test'], 'test.zip', { type: 'application/zip' });
    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput!, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockHandleZipUpload).toHaveBeenCalledWith(file);
    });

    // Should not crash the app
    expect(screen.getByText('📊 Instagram Unfollow Tracker')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

});

import { render, screen, fireEvent } from '@tests/utils/testUtils';
import { Header } from '@/components/Header';
import { useHeaderData } from '@/hooks/useHeaderData';
import { useAppStore } from '@/lib/store';

// Mock the useHeaderData hook
vi.mock('@/hooks/useHeaderData');

describe('Header Component', () => {
  const mockUseHeaderData = vi.mocked(useHeaderData);
  const mockOnHelpClick = vi.fn();
  const mockOnClearData = vi.fn();

  // Default stats for most tests
  const defaultStats = {
    following: 50,
    followers: 60,
    mutuals: 40,
    notFollowingBack: 10,
  };

  // Helper function to create mock return value
  const createMockReturnValue = (overrides = {}) => ({
    hasData: false,
    fileName: undefined,
    fileSize: undefined,
    uploadDate: undefined,
    stats: defaultStats,
    onClearData: mockOnClearData,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAppStore.setState({
      unified: [],
      parsed: null,
    });
  });

  it('should render when no data is loaded', () => {
    mockUseHeaderData.mockReturnValue(
      createMockReturnValue({
        stats: {
          following: 0,
          followers: 0,
          mutuals: 0,
          notFollowingBack: 0,
        },
      })
    );

    render(<Header onHelpClick={mockOnHelpClick} />);

    expect(screen.getByText('Instagram Unfollow Tracker')).toBeInTheDocument();
    expect(
      screen.getByText('Analyze your Instagram connections privately in your browser')
    ).toBeInTheDocument();
  });

  it('should render file metadata when data is loaded', () => {
    mockUseHeaderData.mockReturnValue(
      createMockReturnValue({
        hasData: true,
        fileName: 'instagram-data.zip',
        fileSize: 1024000,
        uploadDate: new Date('2023-01-01T00:00:00Z'),
      })
    );

    render(<Header onHelpClick={mockOnHelpClick} />);

    expect(screen.getByText('instagram-data.zip')).toBeInTheDocument();
    expect(screen.getByText('1000.0 KB')).toBeInTheDocument();
    expect(screen.getByText(/\d+ days ago/)).toBeInTheDocument();
  });

  it('should render stats cards when data is loaded', () => {
    mockUseHeaderData.mockReturnValue(
      createMockReturnValue({
        hasData: true,
        fileName: 'test.zip',
        fileSize: 500000,
        uploadDate: new Date('2023-01-01T00:00:00Z'),
      })
    );

    render(<Header onHelpClick={mockOnHelpClick} />);

    expect(screen.getByText('50')).toBeInTheDocument(); // Following
    expect(screen.getByText('60')).toBeInTheDocument(); // Followers
    expect(screen.getByText('40')).toBeInTheDocument(); // Mutuals
    expect(screen.getByText('10')).toBeInTheDocument(); // Not following back
  });

  it('should render Clear Data button when data is loaded', () => {
    const testMockOnClearData = vi.fn();
    mockUseHeaderData.mockReturnValue(
      createMockReturnValue({
        hasData: true,
        shouldShowClearButton: true,
        fileName: 'test.zip',
        fileSize: 500000,
        uploadDate: new Date('2023-01-01T00:00:00Z'),
        uploadStatus: 'success',
        onClearData: testMockOnClearData,
      })
    );

    render(<Header onHelpClick={mockOnHelpClick} />);

    // Find the trigger button
    const clearButton = screen.getByText('Clear Data');
    expect(clearButton).toBeInTheDocument();

    // Click to open the dialog
    fireEvent.click(clearButton);

    // Find the actual clear button in the dialog (the one with destructive styling)
    const confirmButton = screen.getByRole('button', { name: 'Clear Data' });
    expect(confirmButton).toBeInTheDocument();

    // Click the confirm button
    fireEvent.click(confirmButton);
    expect(testMockOnClearData).toHaveBeenCalled();
  });

  it('should render Cancel Upload button when loading', () => {
    const testMockOnClearData = vi.fn();
    mockUseHeaderData.mockReturnValue(
      createMockReturnValue({
        hasData: false,
        shouldShowClearButton: true,
        fileName: 'test.zip',
        fileSize: 500000,
        uploadDate: new Date('2023-01-01T00:00:00Z'),
        uploadStatus: 'loading',
        onClearData: testMockOnClearData,
      })
    );

    render(<Header onHelpClick={mockOnHelpClick} />);

    // Find the trigger button
    const cancelButton = screen.getByText('Cancel Upload');
    expect(cancelButton).toBeInTheDocument();

    // Click to open the dialog
    fireEvent.click(cancelButton);

    // Find the actual cancel button in the dialog
    const confirmButton = screen.getByRole('button', { name: 'Cancel & Clear' });
    expect(confirmButton).toBeInTheDocument();

    // Click the confirm button
    fireEvent.click(confirmButton);
    expect(testMockOnClearData).toHaveBeenCalled();
  });

  it('should render help button and call onHelpClick', () => {
    mockUseHeaderData.mockReturnValue(
      createMockReturnValue({
        stats: {
          following: 0,
          followers: 0,
          mutuals: 0,
          notFollowingBack: 0,
        },
      })
    );

    render(<Header onHelpClick={mockOnHelpClick} />);

    const helpButton = screen.getByText('Help');
    expect(helpButton).toBeInTheDocument();

    fireEvent.click(helpButton);
    expect(mockOnHelpClick).toHaveBeenCalled();
  });

  it('should render badges with correct counts', () => {
    mockUseHeaderData.mockReturnValue(
      createMockReturnValue({
        hasData: true,
        fileName: 'test.zip',
        fileSize: 500000,
        uploadDate: new Date('2023-01-01T00:00:00Z'),
      })
    );

    render(<Header onHelpClick={mockOnHelpClick} />);

    // Check that stats are rendered with correct counts
    expect(screen.getByText('50')).toBeInTheDocument(); // Following
    expect(screen.getByText('60')).toBeInTheDocument(); // Followers
    expect(screen.getByText('40')).toBeInTheDocument(); // Mutuals
    expect(screen.getByText('10')).toBeInTheDocument(); // Not following back
  });

  it('should handle zero counts correctly', () => {
    const zeroStats = {
      following: 0,
      followers: 0,
      mutuals: 0,
      notFollowingBack: 0,
    };

    mockUseHeaderData.mockReturnValue(
      createMockReturnValue({
        hasData: true,
        fileName: 'test.zip',
        fileSize: 500000,
        uploadDate: new Date('2023-01-01T00:00:00Z'),
        stats: zeroStats,
      })
    );

    render(<Header onHelpClick={mockOnHelpClick} />);

    expect(screen.getAllByText('0')).toHaveLength(4); // All 4 stats should be 0
  });

  it('should format large file sizes in MB', () => {
    mockUseHeaderData.mockReturnValue(
      createMockReturnValue({
        hasData: true,
        fileName: 'large-file.zip',
        fileSize: 2.5 * 1024 * 1024, // 2.5 MB
        uploadDate: new Date('2023-01-01T00:00:00Z'),
        stats: defaultStats,
      })
    );

    render(<Header onHelpClick={mockOnHelpClick} />);

    // Should display file size in MB
    expect(screen.getByText('2.5 MB')).toBeInTheDocument();
  });
});

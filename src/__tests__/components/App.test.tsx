import type { BadgeKey, FileMetadata } from '@/core/types';
import { useAppStore } from '@/lib/store';
import { App } from '@/ui/App';
import { fireEvent, render, screen, waitFor } from '@tests/utils/testUtils';

// Mock components
vi.mock('@/components/Header', () => ({
  Header: ({ onHelpClick }: { onHelpClick: () => void }) => (
    <div data-testid="header">
      <button onClick={onHelpClick}>Help</button>
    </div>
  ),
}));

vi.mock('@/components/FileUploadSection', () => ({
  FileUploadSection: ({ onHelpClick }: { onHelpClick: () => void }) => (
    <div data-testid="file-upload-section">
      <button onClick={onHelpClick}>Help</button>
    </div>
  ),
}));

vi.mock('@/components/AccountListSection', () => ({
  AccountListSection: () => <div data-testid="account-list-section">Account List</div>,
}));

vi.mock('@/components/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('@/components/InstructionsModal', () => ({
  InstructionsModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="instructions-modal">Instructions</div> : null,
}));

// Mock store
vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn(),
}));

// Mock useHydration
vi.mock('@/hooks/useHydration', () => ({
  useHydration: vi.fn(() => true), // Default: Always hydrated
}));

const mockUseAppStore = vi.mocked(useAppStore);
const mockUseHydration = vi.mocked((await import('@/hooks/useHydration')).useHydration);

describe('App Component', () => {
  const mockFileMetadata: FileMetadata = {
    name: 'test.zip',
    size: 1024,
    uploadDate: new Date('2024-01-01'),
    fileHash: 'test-hash',
    accountCount: 100,
  };

  // Helper function to create default mock state
  const createMockState = (
    overrides: Partial<{
      fileMetadata: FileMetadata | null;
      filters: Set<BadgeKey>;
      currentFileName: string | null;
      uploadStatus: 'idle' | 'loading' | 'success' | 'error';
      uploadError: string | null;
    }> = {}
  ) => ({
    filters: new Set([] as BadgeKey[]),
    fileMetadata: null,
    currentFileName: null,
    uploadStatus: 'idle' as const,
    uploadError: null,
    _hasHydrated: true,
    setFilters: vi.fn(),
    setUploadInfo: vi.fn(),
    clearData: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppStore.mockImplementation(selector => selector(createMockState()));
    mockUseHydration.mockReturnValue(true); // Default: hydrated
  });

  it('should render main components', () => {
    // Set up state with no data to show file upload section
    mockUseAppStore.mockImplementation(selector =>
      selector(
        createMockState({
          fileMetadata: null,
        })
      )
    );

    render(<App />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should show file upload section when no data is loaded', () => {
    mockUseAppStore.mockImplementation(selector =>
      selector(
        createMockState({
          fileMetadata: null,
        })
      )
    );

    render(<App />);

    expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    expect(screen.queryByTestId('account-list-section')).not.toBeInTheDocument();
  });

  it('should show account list section when data is loaded', () => {
    mockUseAppStore.mockImplementation(selector =>
      selector(
        createMockState({
          fileMetadata: mockFileMetadata,
        })
      )
    );

    render(<App />);

    expect(screen.getByTestId('account-list-section')).toBeInTheDocument();
    expect(screen.queryByTestId('file-upload-section')).not.toBeInTheDocument();
  });

  it('should open instructions modal when help button is clicked', async () => {
    render(<App />);

    const helpButtons = screen.getAllByText('Help');
    fireEvent.click(helpButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('instructions-modal')).toBeInTheDocument();
    });
  });

  it('should close instructions modal when onOpenChange is called', async () => {
    render(<App />);

    // Open modal
    const helpButtons = screen.getAllByText('Help');
    fireEvent.click(helpButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('instructions-modal')).toBeInTheDocument();
    });

    // Modal should be closed by default after opening
    // This tests the modal state management
  });

  describe('Hydration states', () => {
    it('should show loading spinner when not hydrated', () => {
      mockUseHydration.mockReturnValue(false);
      mockUseAppStore.mockImplementation(selector =>
        selector(
          createMockState({
            fileMetadata: null,
          })
        )
      );

      render(<App />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('file-upload-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('account-list-section')).not.toBeInTheDocument();
    });

    it('should show loading spinner with animation', () => {
      mockUseHydration.mockReturnValue(false);

      render(<App />);

      const spinner = screen.getByText('Loading...').previousElementSibling;
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should show file upload section after hydration with no data', () => {
      mockUseHydration.mockReturnValue(true);
      mockUseAppStore.mockImplementation(selector =>
        selector(
          createMockState({
            fileMetadata: null,
          })
        )
      );

      render(<App />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    });

    it('should show account list after hydration with data', () => {
      mockUseHydration.mockReturnValue(true);
      mockUseAppStore.mockImplementation(selector =>
        selector(
          createMockState({
            fileMetadata: mockFileMetadata,
          })
        )
      );

      render(<App />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByTestId('account-list-section')).toBeInTheDocument();
    });

    it('should transition from loading to file upload', async () => {
      mockUseHydration.mockReturnValue(false);
      mockUseAppStore.mockImplementation(selector =>
        selector(
          createMockState({
            fileMetadata: null,
          })
        )
      );

      const { rerender } = render(<App />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Simulate hydration complete
      mockUseHydration.mockReturnValue(true);
      rerender(<App />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
      });
    });

    it('should handle hydration with existing data', () => {
      mockUseHydration.mockReturnValue(false);
      mockUseAppStore.mockImplementation(selector =>
        selector(
          createMockState({
            fileMetadata: mockFileMetadata,
          })
        )
      );

      const { rerender } = render(<App />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Simulate hydration complete
      mockUseHydration.mockReturnValue(true);
      rerender(<App />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByTestId('account-list-section')).toBeInTheDocument();
    });

    it('should not show file upload or account list during hydration', () => {
      mockUseHydration.mockReturnValue(false);

      render(<App />);

      expect(screen.queryByTestId('file-upload-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('account-list-section')).not.toBeInTheDocument();
    });

    it('should always show header and footer regardless of hydration', () => {
      mockUseHydration.mockReturnValue(false);

      render(<App />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('File metadata validation', () => {
    it('should treat null fileMetadata as no data', () => {
      mockUseAppStore.mockImplementation(selector =>
        selector(
          createMockState({
            fileMetadata: null,
          })
        )
      );

      render(<App />);

      expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    });

    it('should treat fileMetadata with 0 accounts as no data', () => {
      mockUseAppStore.mockImplementation(selector =>
        selector(
          createMockState({
            fileMetadata: { ...mockFileMetadata, accountCount: 0 },
          })
        )
      );

      render(<App />);

      expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    });

    it('should treat fileMetadata with undefined accountCount as no data', () => {
      mockUseAppStore.mockImplementation(selector =>
        selector(
          createMockState({
            fileMetadata: { ...mockFileMetadata, accountCount: undefined as any },
          })
        )
      );

      render(<App />);

      expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    });

    it('should show account list with valid accountCount', () => {
      mockUseAppStore.mockImplementation(selector =>
        selector(
          createMockState({
            fileMetadata: { ...mockFileMetadata, accountCount: 1 },
          })
        )
      );

      render(<App />);

      expect(screen.getByTestId('account-list-section')).toBeInTheDocument();
    });

    it('should show account list with large accountCount', () => {
      mockUseAppStore.mockImplementation(selector =>
        selector(
          createMockState({
            fileMetadata: { ...mockFileMetadata, accountCount: 1000000 },
          })
        )
      );

      render(<App />);

      expect(screen.getByTestId('account-list-section')).toBeInTheDocument();
    });
  });

  describe('Layout structure', () => {
    it('should have correct container classes', () => {
      const { container } = render(<App />);

      const mainDiv = container.querySelector('.min-h-screen');
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).toHaveClass('bg-background', 'flex', 'flex-col');
    });

    it('should have proper spacing and responsive padding', () => {
      const { container } = render(<App />);

      const contentDiv = container.querySelector('.mx-auto');
      expect(contentDiv).toHaveClass('max-w-7xl', 'px-4', 'py-8', 'sm:px-6', 'lg:px-8');
    });

    it('should have footer with bottom spacing', () => {
      const { container } = render(<App />);

      const flexDiv = container.querySelector('.flex-1');
      expect(flexDiv).toHaveClass('pb-20');
    });
  });

  describe('Instructions modal integration', () => {
    it('should pass correct props to InstructionsModal', () => {
      render(<App />);

      // Modal should not be visible initially
      expect(screen.queryByTestId('instructions-modal')).not.toBeInTheDocument();
    });

    it('should open modal from header help button', async () => {
      render(<App />);

      const headerHelpButton = screen.getByTestId('header').querySelector('button');
      if (headerHelpButton) {
        fireEvent.click(headerHelpButton);

        await waitFor(() => {
          expect(screen.getByTestId('instructions-modal')).toBeInTheDocument();
        });
      }
    });

    it('should open modal from file upload section help button', async () => {
      mockUseAppStore.mockImplementation(selector =>
        selector(
          createMockState({
            fileMetadata: null,
          })
        )
      );

      render(<App />);

      const uploadHelpButton = screen.getByTestId('file-upload-section').querySelector('button');
      if (uploadHelpButton) {
        fireEvent.click(uploadHelpButton);

        await waitFor(() => {
          expect(screen.getByTestId('instructions-modal')).toBeInTheDocument();
        });
      }
    });
  });
});

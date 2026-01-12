import { render, screen } from '@tests/utils/testUtils';

// Mock store - useAppStore uses selector pattern, so return function result based on selector
vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn((selector: (state: unknown) => unknown) => {
    const mockState = {
      advanceJourney: vi.fn(),
      journey: {
        completedHowToSubSteps: new Set<string>(),
      },
      toggleHowToSubStep: vi.fn(),
    };
    return selector(mockState);
  }),
}));

// Mock hooks
vi.mock('@/hooks/useSampleData', () => ({
  useSampleData: vi.fn(() => ({
    load: vi.fn(),
    state: 'idle',
  })),
}));

vi.mock('@/hooks/useInstagramData', () => ({
  useInstagramData: vi.fn(() => ({
    uploadState: { status: 'idle', error: null },
    handleZipUpload: vi.fn(),
    fileMetadata: null,
  })),
}));

vi.mock('@/hooks/useAccountFiltering', () => ({
  useAccountFiltering: vi.fn(() => ({
    query: '',
    setQuery: vi.fn(),
    filteredIndices: [],
    filters: new Set(),
    setFilters: vi.fn(),
    filterCounts: {},
    isFiltering: false,
    processingTime: 0,
    totalCount: 0,
    hasLoadedData: false,
  })),
}));

vi.mock('@/hooks/useHeaderData', () => ({
  useHeaderData: vi.fn(() => ({
    fileName: null,
    fileSize: null,
    uploadDate: null,
    stats: { following: 0, followers: 0, mutuals: 0, notFollowingBack: 0 },
    onClearData: vi.fn(),
  })),
}));

// Mock child components for ResultsStep
vi.mock('@/components/SearchBar', () => ({
  SearchBar: () => <div data-testid="search-bar">SearchBar</div>,
}));

vi.mock('@/components/FilterChips', () => ({
  FilterChips: () => <div data-testid="filter-chips">FilterChips</div>,
}));

vi.mock('@/components/AccountList', () => ({
  AccountList: () => <div data-testid="account-list">AccountList</div>,
}));

vi.mock('@/components/ParseResultDisplay', () => ({
  ParseResultDisplay: () => <div data-testid="parse-result-display">ParseResultDisplay</div>,
}));

// Import components after mocks
import { HeroStep } from '@/components/steps/HeroStep';
import { HowToStep } from '@/components/steps/HowToStep';
import { UploadStep } from '@/components/steps/UploadStep';
import { ResultsStep } from '@/components/steps/ResultsStep';

describe('Step Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HeroStep', () => {
    it('should render without crashing', () => {
      render(<HeroStep />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should show main heading', () => {
      render(<HeroStep />);

      // The heading contains "See Who Unfollowed You" - use role selector to avoid matching description paragraph
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(/See Who Unfollowed You/i);
    });

    it('should show feature badges', () => {
      render(<HeroStep />);

      expect(screen.getByText('100% Private')).toBeInTheDocument();
      expect(screen.getByText('Open Source')).toBeInTheDocument();
      // "No Login Required" appears as a badge - use getAllByText since it also appears in heading
      expect(screen.getAllByText(/No Login Required/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Local Processing')).toBeInTheDocument();
    });

    it('should show CTA buttons', () => {
      render(<HeroStep />);

      expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try with Sample/i })).toBeInTheDocument();
    });

    it('should show skip link for users with existing ZIP', () => {
      render(<HeroStep />);

      expect(screen.getByText(/I already have my ZIP file/i)).toBeInTheDocument();
    });

    it('should show value proposition text', () => {
      render(<HeroStep />);

      expect(
        screen.getByText(/The only Instagram unfollow tracker that works 100% locally/i)
      ).toBeInTheDocument();
    });
  });

  describe('HowToStep', () => {
    it('should render without crashing', () => {
      render(<HowToStep />);

      expect(
        screen.getByRole('heading', { name: /How to Get Your Instagram Data/i })
      ).toBeInTheDocument();
    });

    it('should show introduction text', () => {
      render(<HowToStep />);

      expect(screen.getByText(/Follow these simple steps/i)).toBeInTheDocument();
    });

    it('should show progress indicator', () => {
      render(<HowToStep />);

      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('should show primary CTA to open Instagram settings', () => {
      render(<HowToStep />);

      expect(screen.getByText(/Ready to Start/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Open.*Settings/i })).toHaveAttribute(
        'href',
        'https://accountscenter.instagram.com'
      );
    });

    it('should show step groups', () => {
      render(<HowToStep />);

      expect(screen.getByText('Opening Settings')).toBeInTheDocument();
      expect(screen.getByText('Selecting Data')).toBeInTheDocument();
      expect(screen.getByText('Downloading')).toBeInTheDocument();
      expect(screen.getByText('Uploading & Analyzing')).toBeInTheDocument();
    });

    it('should show time estimate', () => {
      render(<HowToStep />);

      expect(screen.getByText(/Total time: ~5 minutes/i)).toBeInTheDocument();
    });

    it('should show sticky CTA for users with data', () => {
      render(<HowToStep />);

      expect(screen.getByText(/Already have your data/i)).toBeInTheDocument();
    });
  });

  describe('UploadStep', () => {
    it('should render without crashing', () => {
      render(<UploadStep />);

      expect(
        screen.getByRole('heading', { name: /Upload Your Instagram Data/i })
      ).toBeInTheDocument();
    });

    it('should show privacy message', () => {
      render(<UploadStep />);

      expect(screen.getByText(/All processing happens locally/i)).toBeInTheDocument();
    });

    it('should show JSON format notice', () => {
      render(<UploadStep />);

      expect(screen.getByText('JSON format required')).toBeInTheDocument();
    });

    it('should show upload zone with drag and drop hint', () => {
      render(<UploadStep />);

      expect(screen.getByText(/Drop your Instagram data here/i)).toBeInTheDocument();
      expect(screen.getByText(/or click to browse/i)).toBeInTheDocument();
    });

    it('should show file input for ZIP files', () => {
      render(<UploadStep />);

      const input = screen.getByLabelText(/Upload Instagram data ZIP file/i);
      expect(input).toHaveAttribute('accept', '.zip');
    });

    it('should show help section', () => {
      render(<UploadStep />);

      expect(screen.getByText('Need help?')).toBeInTheDocument();
      expect(screen.getByText(/Common issue:/i)).toBeInTheDocument();
    });
  });

  describe('ResultsStep', () => {
    it('should render without crashing', () => {
      render(<ResultsStep />);

      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('filter-chips')).toBeInTheDocument();
      expect(screen.getByTestId('account-list')).toBeInTheDocument();
    });

    it('should show stat cards', () => {
      render(<ResultsStep />);

      // Stat cards have mobile and desktop labels, so use getAllByText
      expect(screen.getAllByText('Following').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Followers').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Mutuals').length).toBeGreaterThanOrEqual(1);
    });
  });
});

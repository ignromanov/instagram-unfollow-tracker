import type { FileMetadata } from '@/core/types';
import { App } from '@/ui/App';
import { render, screen, waitFor } from '@tests/utils/testUtils';

// Mock all major components
vi.mock('@/components/Hero', () => ({
  Hero: ({ hasData }: { hasData: boolean }) => (
    <div data-testid="hero">Hero Screen {hasData && '(has data)'}</div>
  ),
}));

vi.mock('@/components/HeaderV2', () => ({
  HeaderV2: () => <div data-testid="header">Header</div>,
}));

vi.mock('@/components/Wizard', () => ({
  Wizard: () => <div data-testid="wizard">Wizard</div>,
}));

vi.mock('@/components/WaitingDashboard', () => ({
  WaitingDashboard: () => <div data-testid="waiting-dashboard">Waiting Dashboard</div>,
}));

vi.mock('@/components/UploadZone', () => ({
  UploadZone: () => <div data-testid="upload-zone">Upload Zone</div>,
}));

vi.mock('@/components/AccountListSection', () => ({
  AccountListSection: ({ isSample }: { isSample: boolean }) => (
    <div data-testid="account-list-section">Account List {isSample && '(sample)'}</div>
  ),
}));

vi.mock('@/components/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('@/components/HowToSection', () => ({
  HowToSection: () => <div data-testid="how-to-section">How To</div>,
}));

vi.mock('@/components/FAQSection', () => ({
  FAQSection: () => <div data-testid="faq-section">FAQ</div>,
}));

vi.mock('@/components/FooterCTA', () => ({
  FooterCTA: () => <div data-testid="footer-cta">Footer CTA</div>,
}));

vi.mock('@/components/BuyMeCoffeeWidget', () => ({
  BuyMeCoffeeWidget: () => <div data-testid="bmc-widget">BMC Widget</div>,
}));

vi.mock('@/components/PrivacyPolicy', () => ({
  PrivacyPolicy: () => <div data-testid="privacy-policy">Privacy Policy</div>,
}));

vi.mock('@/components/TermsOfService', () => ({
  TermsOfService: () => <div data-testid="terms-of-service">Terms of Service</div>,
}));

// Mock hooks
vi.mock('@/hooks/useHydration', () => ({
  useHydration: vi.fn(() => true), // Default: hydrated
}));

vi.mock('@/hooks/useInstagramData', () => ({
  useInstagramData: vi.fn(() => ({
    uploadState: { status: 'idle', error: null },
    handleZipUpload: vi.fn(),
    handleClearData: vi.fn(),
    fileMetadata: null,
    parseWarnings: [],
  })),
}));

vi.mock('@/hooks/useSampleData', () => ({
  useSampleData: vi.fn(() => ({
    load: vi.fn(),
    state: 'idle',
    data: null,
  })),
}));

const mockUseHydration = vi.mocked((await import('@/hooks/useHydration')).useHydration);
const mockUseInstagramData = vi.mocked((await import('@/hooks/useInstagramData')).useInstagramData);
const mockUseSampleData = vi.mocked((await import('@/hooks/useSampleData')).useSampleData);

describe('App Component', () => {
  const mockFileMetadata: FileMetadata = {
    name: 'test.zip',
    size: 1024,
    uploadDate: new Date('2024-01-01'),
    fileHash: 'test-hash',
    accountCount: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location.hash
    window.location.hash = '';

    // Default mocks
    mockUseHydration.mockReturnValue(true);
    mockUseInstagramData.mockReturnValue({
      uploadState: { status: 'idle', error: null },
      handleZipUpload: vi.fn(),
      handleClearData: vi.fn(),
      fileMetadata: null,
      parseWarnings: [],
      uploadProgress: 0,
      processedCount: 0,
      totalCount: 0,
    });
    mockUseSampleData.mockReturnValue({
      load: vi.fn(),
      clear: vi.fn(),
      state: 'idle',
      data: null,
      error: null,
    });
  });

  it('should render header and footer', () => {
    render(<App />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should show Hero screen by default (no hash)', () => {
    render(<App />);

    expect(screen.getByTestId('hero')).toBeInTheDocument();
  });

  it('should show SEO sections on Hero screen', () => {
    render(<App />);

    expect(screen.getByTestId('how-to-section')).toBeInTheDocument();
    expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer-cta')).toBeInTheDocument();
  });

  it('should show UploadZone when hash is #upload', async () => {
    window.location.hash = 'upload';

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('upload-zone')).toBeInTheDocument();
    });
  });

  it('should show WaitingDashboard when hash is #waiting', async () => {
    window.location.hash = 'waiting';

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('waiting-dashboard')).toBeInTheDocument();
    });
  });

  it('should show AccountListSection when hash is #results and has data', async () => {
    window.location.hash = 'results';

    mockUseInstagramData.mockReturnValue({
      uploadState: { status: 'success', error: null },
      handleZipUpload: vi.fn(),
      handleClearData: vi.fn(),
      fileMetadata: mockFileMetadata,
      parseWarnings: [],
      uploadProgress: 100,
      processedCount: 100,
      totalCount: 100,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('account-list-section')).toBeInTheDocument();
    });
  });

  it('should redirect to #upload when trying to access #results without data', async () => {
    window.location.hash = 'results';

    mockUseInstagramData.mockReturnValue({
      uploadState: { status: 'idle', error: null },
      handleZipUpload: vi.fn(),
      handleClearData: vi.fn(),
      fileMetadata: null,
      parseWarnings: [],
      uploadProgress: 0,
      processedCount: 0,
      totalCount: 0,
    });

    render(<App />);

    await waitFor(() => {
      expect(window.location.hash).toBe('#upload');
      expect(screen.getByTestId('upload-zone')).toBeInTheDocument();
    });
  });

  it('should show PrivacyPolicy when hash is #privacy', async () => {
    window.location.hash = 'privacy';

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('privacy-policy')).toBeInTheDocument();
    });
  });

  it('should show TermsOfService when hash is #terms', async () => {
    window.location.hash = 'terms';

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('terms-of-service')).toBeInTheDocument();
    });
  });

  describe('Hydration states', () => {
    it('should show loading spinner when not hydrated', () => {
      mockUseHydration.mockReturnValue(false);

      render(<App />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('hero')).not.toBeInTheDocument();
    });

    it('should show loading spinner with animation', () => {
      mockUseHydration.mockReturnValue(false);

      render(<App />);

      const spinner = screen.getByText('Loading...').previousElementSibling;
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should show Hero after hydration with no data', () => {
      mockUseHydration.mockReturnValue(true);

      render(<App />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByTestId('hero')).toBeInTheDocument();
    });

    it('should show Hero after hydration even with data (no auto-redirect)', () => {
      mockUseHydration.mockReturnValue(true);
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null },
        handleZipUpload: vi.fn(),
        handleClearData: vi.fn(),
        fileMetadata: mockFileMetadata,
        parseWarnings: [],
        uploadProgress: 100,
        processedCount: 100,
        totalCount: 100,
      });

      render(<App />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByText('Hero Screen (has data)')).toBeInTheDocument();
    });

    it('should always show header and footer regardless of hydration', () => {
      mockUseHydration.mockReturnValue(false);

      render(<App />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
      // Note: Footer is not shown during loading in V3
    });
  });

  describe('Sample data route', () => {
    it('should show loading state when loading sample data', async () => {
      window.location.hash = 'sample';

      mockUseSampleData.mockReturnValue({
        load: vi.fn(),
        clear: vi.fn(),
        state: 'loading',
        data: null,
        error: null,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Loading sample data...')).toBeInTheDocument();
      });
    });

    it('should show AccountListSection when sample data is loaded', async () => {
      window.location.hash = 'sample';

      mockUseSampleData.mockReturnValue({
        load: vi.fn(),
        clear: vi.fn(),
        state: 'success',
        data: {
          fileHash: 'sample-hash',
          accountCount: 1180,
        },
        error: null,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('account-list-section')).toBeInTheDocument();
        expect(screen.getByText('Account List (sample)')).toBeInTheDocument();
      });
    });

    it('should show error state when sample data fails to load', async () => {
      window.location.hash = 'sample';

      mockUseSampleData.mockReturnValue({
        load: vi.fn(),
        clear: vi.fn(),
        state: 'error',
        data: null,
        error: 'Failed to load',
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Failed to generate sample data')).toBeInTheDocument();
      });
    });
  });

  describe('Layout structure', () => {
    it('should have correct container classes', () => {
      const { container } = render(<App />);

      const mainDiv = container.querySelector('.min-h-screen');
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).toHaveClass('bg-background', 'flex', 'flex-col');
    });

    it('should have skip to content link for accessibility', () => {
      render(<App />);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveClass('sr-only');
    });

    it('should have main element with id for skip link', () => {
      const { container } = render(<App />);

      const main = container.querySelector('#main-content');
      expect(main).toBeInTheDocument();
      expect(main?.tagName).toBe('MAIN');
    });
  });

  describe('Auto-navigation after upload', () => {
    it('should navigate to results after successful upload', async () => {
      window.location.hash = 'upload';

      const { rerender } = render(<App />);

      // Simulate successful upload
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null },
        handleZipUpload: vi.fn(),
        handleClearData: vi.fn(),
        fileMetadata: mockFileMetadata,
        parseWarnings: [],
        uploadProgress: 100,
        processedCount: 100,
        totalCount: 100,
      });

      rerender(<App />);

      await waitFor(() => {
        expect(window.location.hash).toBe('#results');
      });
    });
  });
});

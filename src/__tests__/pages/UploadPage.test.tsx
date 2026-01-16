import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component as UploadPage } from '@/pages/UploadPage';
import uploadEN from '@/locales/en/upload.json';
import commonEN from '@/locales/en/common.json';

// Mock child components
vi.mock('@/components/UploadZone', () => ({
  UploadZone: ({
    onUploadStart,
    onBack,
    onOpenWizard,
    isProcessing,
    error,
    parseWarnings,
  }: {
    onUploadStart: (file: File) => void;
    onBack: () => void;
    onOpenWizard: () => void;
    isProcessing: boolean;
    error: string | null;
    parseWarnings: string[];
  }) => (
    <div data-testid="upload-zone">
      <button onClick={() => onUploadStart(new File([], 'test.zip'))}>
        {commonEN.buttons.uploadFile}
      </button>
      <button onClick={onBack}>{uploadEN.zone.back}</button>
      <button onClick={onOpenWizard}>Open Wizard</button>
      <div data-testid="is-processing">{String(isProcessing)}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="warnings">{parseWarnings.join(', ') || 'no-warnings'}</div>
    </div>
  ),
}));

vi.mock('@/components/HowToSection', () => ({
  HowToSection: ({ onStart }: { onStart: () => void }) => (
    <div data-testid="how-to-section">
      <button onClick={onStart}>How To Start</button>
    </div>
  ),
}));

vi.mock('@/components/FAQSection', () => ({
  FAQSection: () => <div data-testid="faq-section">FAQ</div>,
}));

vi.mock('@/components/FooterCTA', () => ({
  FooterCTA: ({ onStart, onSample }: { onStart: () => void; onSample: () => void }) => (
    <div data-testid="footer-cta">
      <button onClick={onStart}>{commonEN.cta.getStarted}</button>
      <button onClick={onSample}>{commonEN.cta.trySample}</button>
    </div>
  ),
}));

vi.mock('@/components/PageLoader', () => ({
  PageLoader: () => <div data-testid="page-loader">Loading...</div>,
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock hooks with vi.fn() for dynamic returns
const mockUseLanguagePrefix = vi.fn(() => '');
vi.mock('@/hooks/useLanguagePrefix', () => ({
  useLanguagePrefix: () => mockUseLanguagePrefix(),
}));

const mockHandleZipUpload = vi.fn();
const mockUseInstagramData = vi.fn(() => ({
  uploadState: { status: 'idle', error: null, fileName: null },
  handleZipUpload: mockHandleZipUpload,
  parseWarnings: [],
}));
vi.mock('@/hooks/useInstagramData', () => ({
  useInstagramData: () => mockUseInstagramData(),
}));

describe('UploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLanguagePrefix.mockReturnValue('');
    mockUseInstagramData.mockReturnValue({
      uploadState: { status: 'idle', error: null, fileName: null },
      handleZipUpload: mockHandleZipUpload,
      parseWarnings: [],
    });
  });

  describe('rendering - idle state', () => {
    it('should render without crashing', () => {
      render(<UploadPage />);

      expect(screen.getByTestId('upload-zone')).toBeInTheDocument();
    });

    it('should render all sections', () => {
      render(<UploadPage />);

      expect(screen.getByTestId('upload-zone')).toBeInTheDocument();
      expect(screen.getByTestId('how-to-section')).toBeInTheDocument();
      expect(screen.getByTestId('faq-section')).toBeInTheDocument();
      expect(screen.getByTestId('footer-cta')).toBeInTheDocument();
    });

    it('should not show loader in idle state', () => {
      render(<UploadPage />);

      expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
    });

    it('should pass isProcessing as false in idle state', () => {
      render(<UploadPage />);

      expect(screen.getByTestId('is-processing')).toHaveTextContent('false');
    });
  });

  describe('rendering - loading state', () => {
    it('should pass isProcessing as true when uploading', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'loading', error: null, fileName: 'test.zip' },
        handleZipUpload: mockHandleZipUpload,
        parseWarnings: [],
      });

      render(<UploadPage />);

      expect(screen.getByTestId('is-processing')).toHaveTextContent('true');
    });

    it('should not show loader during loading state', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'loading', error: null, fileName: 'test.zip' },
        handleZipUpload: mockHandleZipUpload,
        parseWarnings: [],
      });

      render(<UploadPage />);

      expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
    });
  });

  describe('rendering - error state', () => {
    it('should pass error to UploadZone', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'error', error: 'Invalid ZIP file', fileName: null },
        handleZipUpload: mockHandleZipUpload,
        parseWarnings: [],
      });

      render(<UploadPage />);

      expect(screen.getByTestId('error')).toHaveTextContent('Invalid ZIP file');
    });

    it('should pass parseWarnings to UploadZone', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'idle', error: null, fileName: null },
        handleZipUpload: mockHandleZipUpload,
        parseWarnings: ['Missing followers.json', 'Corrupted data'],
      });

      render(<UploadPage />);

      expect(screen.getByTestId('warnings')).toHaveTextContent(
        'Missing followers.json, Corrupted data'
      );
    });
  });

  describe('rendering - success state with redirect', () => {
    it('should show PageLoader when upload is successful', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        handleZipUpload: mockHandleZipUpload,
        parseWarnings: [],
      });

      render(<UploadPage />);

      expect(screen.getByTestId('page-loader')).toBeInTheDocument();
    });

    it('should not render UploadZone when successful', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        handleZipUpload: mockHandleZipUpload,
        parseWarnings: [],
      });

      render(<UploadPage />);

      expect(screen.queryByTestId('upload-zone')).not.toBeInTheDocument();
    });

    it('should auto-navigate to results on success', async () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        handleZipUpload: mockHandleZipUpload,
        parseWarnings: [],
      });

      render(<UploadPage />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/results', { replace: true });
      });
    });

    it('should use replace mode for navigation to prevent back button issues', async () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        handleZipUpload: mockHandleZipUpload,
        parseWarnings: [],
      });

      render(<UploadPage />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/results', { replace: true });
      });
    });
  });

  describe('upload handling', () => {
    it('should call handleZipUpload when file is uploaded', async () => {
      const user = userEvent.setup();
      render(<UploadPage />);

      await user.click(screen.getByText(commonEN.buttons.uploadFile));

      expect(mockHandleZipUpload).toHaveBeenCalledTimes(1);
      expect(mockHandleZipUpload).toHaveBeenCalledWith(expect.any(File));
    });
  });

  describe('navigation - UploadZone handlers', () => {
    it('should navigate to wizard page when Back is clicked', async () => {
      const user = userEvent.setup();
      render(<UploadPage />);

      await user.click(screen.getByText(uploadEN.zone.back));

      expect(mockNavigate).toHaveBeenCalledWith('/wizard');
    });

    it('should navigate to wizard when Open Wizard is clicked', async () => {
      const user = userEvent.setup();
      render(<UploadPage />);

      await user.click(screen.getByText('Open Wizard'));

      expect(mockNavigate).toHaveBeenCalledWith('/wizard/step/6');
    });
  });

  describe('navigation - section handlers', () => {
    it('should navigate to wizard from HowToSection', async () => {
      const user = userEvent.setup();
      render(<UploadPage />);

      await user.click(screen.getByText('How To Start'));

      expect(mockNavigate).toHaveBeenCalledWith('/wizard');
    });

    it('should navigate to wizard from FooterCTA', async () => {
      const user = userEvent.setup();
      render(<UploadPage />);

      await user.click(screen.getByText(commonEN.cta.getStarted));

      expect(mockNavigate).toHaveBeenCalledWith('/wizard');
    });

    it('should navigate to sample from FooterCTA', async () => {
      const user = userEvent.setup();
      render(<UploadPage />);

      await user.click(screen.getByText(commonEN.cta.trySample));

      expect(mockNavigate).toHaveBeenCalledWith('/sample');
    });
  });

  describe('language prefix support', () => {
    it('should use language prefix in navigation', async () => {
      mockUseLanguagePrefix.mockReturnValue('/es');

      const user = userEvent.setup();
      render(<UploadPage />);

      await user.click(screen.getByText('Open Wizard'));

      expect(mockNavigate).toHaveBeenCalledWith('/es/wizard/step/6');
    });

    it('should use language prefix in auto-navigation to results', async () => {
      mockUseLanguagePrefix.mockReturnValue('/ru');
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        handleZipUpload: mockHandleZipUpload,
        parseWarnings: [],
      });

      render(<UploadPage />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/ru/results', { replace: true });
      });
    });
  });

  describe('sections animation', () => {
    it('should wrap sections in animated container', () => {
      const { container } = render(<UploadPage />);

      const animatedDiv = container.querySelector('.animate-in.fade-in');
      expect(animatedDiv).toBeInTheDocument();
      expect(animatedDiv).toContainElement(screen.getByTestId('how-to-section'));
      expect(animatedDiv).toContainElement(screen.getByTestId('faq-section'));
      expect(animatedDiv).toContainElement(screen.getByTestId('footer-cta'));
    });
  });
});

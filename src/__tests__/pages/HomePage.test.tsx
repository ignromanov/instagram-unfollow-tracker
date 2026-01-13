import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component as HomePage } from '@/pages/HomePage';

// Mock child components
vi.mock('@/components/Hero', () => ({
  Hero: ({
    onStartGuide,
    onLoadSample,
    onUploadDirect,
    hasData,
    onContinue,
  }: {
    onStartGuide: (stepIndex?: number) => void;
    onLoadSample: () => void;
    onUploadDirect: () => void;
    hasData?: boolean;
    onContinue?: () => void;
  }) => (
    <div data-testid="hero">
      <button onClick={() => onStartGuide(0)}>Start Guide</button>
      <button onClick={onLoadSample}>Load Sample</button>
      <button onClick={onUploadDirect}>Upload Direct</button>
      {hasData && onContinue && <button onClick={onContinue}>Continue</button>}
      <span data-testid="has-data">{String(hasData)}</span>
    </div>
  ),
}));

vi.mock('@/components/HowToSection', () => ({
  HowToSection: ({ onStart }: { onStart: (stepIndex?: number) => void }) => (
    <div data-testid="how-to-section">
      <button onClick={() => onStart(2)}>How To Start</button>
    </div>
  ),
}));

vi.mock('@/components/FAQSection', () => ({
  FAQSection: () => <div data-testid="faq-section">FAQ Section</div>,
}));

vi.mock('@/components/FooterCTA', () => ({
  FooterCTA: ({
    onStart,
    onSample,
  }: {
    onStart: (stepIndex?: number) => void;
    onSample: () => void;
  }) => (
    <div data-testid="footer-cta">
      <button onClick={() => onStart()}>CTA Start</button>
      <button onClick={onSample}>CTA Sample</button>
    </div>
  ),
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

const mockUseInstagramData = vi.fn(() => ({
  uploadState: { status: 'idle', error: null, fileName: null },
  fileMetadata: null,
}));
vi.mock('@/hooks/useInstagramData', () => ({
  useInstagramData: () => mockUseInstagramData(),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLanguagePrefix.mockReturnValue('');
    mockUseInstagramData.mockReturnValue({
      uploadState: { status: 'idle', error: null, fileName: null },
      fileMetadata: null,
    });
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<HomePage />);

      expect(screen.getByTestId('hero')).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(<HomePage />);

      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByTestId('how-to-section')).toBeInTheDocument();
      expect(screen.getByTestId('faq-section')).toBeInTheDocument();
      expect(screen.getByTestId('footer-cta')).toBeInTheDocument();
    });

    it('should pass hasData as false when no upload data', () => {
      render(<HomePage />);

      expect(screen.getByTestId('has-data')).toHaveTextContent('false');
    });

    it('should pass hasData as true when upload is successful', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        fileMetadata: { fileHash: 'abc123', accountCount: 100, name: 'test.zip' },
      });

      render(<HomePage />);

      expect(screen.getByTestId('has-data')).toHaveTextContent('true');
    });
  });

  describe('navigation - Hero handlers', () => {
    it('should navigate to wizard step 1 when Start Guide is clicked', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await user.click(screen.getByText('Start Guide'));

      expect(mockNavigate).toHaveBeenCalledWith('/wizard/step/1');
    });

    it('should navigate to sample page when Load Sample is clicked', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await user.click(screen.getByText('Load Sample'));

      expect(mockNavigate).toHaveBeenCalledWith('/sample');
    });

    it('should navigate to upload page when Upload Direct is clicked', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await user.click(screen.getByText('Upload Direct'));

      expect(mockNavigate).toHaveBeenCalledWith('/upload');
    });

    it('should navigate to results when Continue is clicked', async () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        fileMetadata: { fileHash: 'abc123', accountCount: 100, name: 'test.zip' },
      });

      const user = userEvent.setup();
      render(<HomePage />);

      await user.click(screen.getByText('Continue'));

      expect(mockNavigate).toHaveBeenCalledWith('/results');
    });
  });

  describe('navigation - HowToSection handlers', () => {
    it('should navigate to wizard with step index from HowTo section', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await user.click(screen.getByText('How To Start'));

      expect(mockNavigate).toHaveBeenCalledWith('/wizard/step/3');
    });
  });

  describe('navigation - FooterCTA handlers', () => {
    it('should navigate to wizard step 1 from FooterCTA', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await user.click(screen.getByText('CTA Start'));

      expect(mockNavigate).toHaveBeenCalledWith('/wizard/step/1');
    });

    it('should navigate to sample from FooterCTA', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await user.click(screen.getByText('CTA Sample'));

      expect(mockNavigate).toHaveBeenCalledWith('/sample');
    });
  });

  describe('language prefix support', () => {
    it('should use language prefix in navigation when set', async () => {
      mockUseLanguagePrefix.mockReturnValue('/es');

      const user = userEvent.setup();
      render(<HomePage />);

      await user.click(screen.getByText('Start Guide'));

      expect(mockNavigate).toHaveBeenCalledWith('/es/wizard/step/1');
    });
  });

  describe('sections animation', () => {
    it('should wrap sections in animated container', () => {
      const { container } = render(<HomePage />);

      const animatedDiv = container.querySelector('.animate-in.fade-in');
      expect(animatedDiv).toBeInTheDocument();
      expect(animatedDiv).toContainElement(screen.getByTestId('how-to-section'));
      expect(animatedDiv).toContainElement(screen.getByTestId('faq-section'));
      expect(animatedDiv).toContainElement(screen.getByTestId('footer-cta'));
    });
  });
});

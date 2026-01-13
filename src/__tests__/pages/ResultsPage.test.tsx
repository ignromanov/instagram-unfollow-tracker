import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component as ResultsPage } from '@/pages/ResultsPage';
import heroEN from '@/locales/en/hero.json';

// Mock child components
vi.mock('@/components/AccountListSection', () => ({
  AccountListSection: ({
    fileHash,
    accountCount,
    filename,
    isSample,
  }: {
    fileHash: string;
    accountCount: number;
    filename: string;
    isSample: boolean;
  }) => (
    <div data-testid="account-list-section">
      <div data-testid="file-hash">{fileHash}</div>
      <div data-testid="account-count">{accountCount}</div>
      <div data-testid="filename">{filename}</div>
      <div data-testid="is-sample">{String(isSample)}</div>
    </div>
  ),
}));

vi.mock('@/components/Hero', () => ({
  Hero: ({
    onStartGuide,
    onLoadSample,
    onUploadDirect,
    hasData,
  }: {
    onStartGuide: () => void;
    onLoadSample: () => void;
    onUploadDirect: () => void;
    hasData: boolean;
  }) => (
    <div data-testid="hero-fallback">
      <button onClick={onStartGuide}>{heroEN.buttons.getGuide}</button>
      <button onClick={onLoadSample}>{heroEN.buttons.trySample}</button>
      <button onClick={onUploadDirect}>{heroEN.buttons.haveFile}</button>
      <span data-testid="has-data">{String(hasData)}</span>
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

describe('ResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLanguagePrefix.mockReturnValue('');
    mockUseInstagramData.mockReturnValue({
      uploadState: { status: 'idle', error: null, fileName: null },
      fileMetadata: null,
    });
  });

  describe('rendering with data', () => {
    it('should render AccountListSection when data is available', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        fileMetadata: {
          fileHash: 'abc123',
          accountCount: 1500,
          name: 'instagram_export.zip',
        },
      });

      render(<ResultsPage />);

      expect(screen.getByTestId('account-list-section')).toBeInTheDocument();
      expect(screen.queryByTestId('hero-fallback')).not.toBeInTheDocument();
    });

    it('should pass correct props to AccountListSection', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        fileMetadata: {
          fileHash: 'def456',
          accountCount: 2500,
          name: 'my_data.zip',
        },
      });

      render(<ResultsPage />);

      expect(screen.getByTestId('file-hash')).toHaveTextContent('def456');
      expect(screen.getByTestId('account-count')).toHaveTextContent('2500');
      expect(screen.getByTestId('filename')).toHaveTextContent('my_data.zip');
      expect(screen.getByTestId('is-sample')).toHaveTextContent('false');
    });

    it('should handle large account counts', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'large.zip' },
        fileMetadata: {
          fileHash: 'large123',
          accountCount: 1000000,
          name: 'large_export.zip',
        },
      });

      render(<ResultsPage />);

      expect(screen.getByTestId('account-count')).toHaveTextContent('1000000');
    });
  });

  describe('rendering without data (fallback)', () => {
    it('should render Hero fallback when no data is available', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'idle', error: null, fileName: null },
        fileMetadata: null,
      });

      render(<ResultsPage />);

      expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('account-list-section')).not.toBeInTheDocument();
    });

    it('should render Hero when upload status is error', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'error', error: 'Failed to parse', fileName: null },
        fileMetadata: null,
      });

      render(<ResultsPage />);

      expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
    });

    it('should render Hero when upload status is loading', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'loading', error: null, fileName: 'processing.zip' },
        fileMetadata: null,
      });

      render(<ResultsPage />);

      expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
    });

    it('should pass hasData as false to Hero fallback', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'idle', error: null, fileName: null },
        fileMetadata: null,
      });

      render(<ResultsPage />);

      expect(screen.getByTestId('has-data')).toHaveTextContent('false');
    });
  });

  describe('navigation - fallback Hero handlers', () => {
    beforeEach(() => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'idle', error: null, fileName: null },
        fileMetadata: null,
      });
    });

    it('should navigate to wizard when Start Guide is clicked', async () => {
      const user = userEvent.setup();
      render(<ResultsPage />);

      await user.click(screen.getByText(heroEN.buttons.getGuide));

      expect(mockNavigate).toHaveBeenCalledWith('/wizard');
    });

    it('should navigate to sample page when Load Sample is clicked', async () => {
      const user = userEvent.setup();
      render(<ResultsPage />);

      await user.click(screen.getByText(heroEN.buttons.trySample));

      expect(mockNavigate).toHaveBeenCalledWith('/sample');
    });

    it('should navigate to upload page when Upload Direct is clicked', async () => {
      const user = userEvent.setup();
      render(<ResultsPage />);

      await user.click(screen.getByText(heroEN.buttons.haveFile));

      expect(mockNavigate).toHaveBeenCalledWith('/upload');
    });
  });

  describe('language prefix support', () => {
    it('should use language prefix in navigation', async () => {
      mockUseLanguagePrefix.mockReturnValue('/es');
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'idle', error: null, fileName: null },
        fileMetadata: null,
      });

      const user = userEvent.setup();
      render(<ResultsPage />);

      await user.click(screen.getByText(heroEN.buttons.getGuide));

      expect(mockNavigate).toHaveBeenCalledWith('/es/wizard');
    });
  });

  describe('conditional rendering logic', () => {
    it('should show results when fileMetadata exists with fileHash', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        fileMetadata: {
          fileHash: 'valid-hash',
          accountCount: 100,
          name: 'test.zip',
        },
      });

      render(<ResultsPage />);

      expect(screen.getByTestId('account-list-section')).toBeInTheDocument();
    });

    it('should show Hero when fileMetadata is missing fileHash', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        fileMetadata: {
          fileHash: null,
          accountCount: 100,
          name: 'test.zip',
        },
      });

      render(<ResultsPage />);

      expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
    });

    it('should show Hero when fileMetadata is missing accountCount', () => {
      mockUseInstagramData.mockReturnValue({
        uploadState: { status: 'success', error: null, fileName: 'test.zip' },
        fileMetadata: {
          fileHash: 'valid-hash',
          accountCount: null,
          name: 'test.zip',
        },
      });

      render(<ResultsPage />);

      expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
    });
  });
});

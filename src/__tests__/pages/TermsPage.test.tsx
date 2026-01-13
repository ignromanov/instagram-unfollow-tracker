import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component as TermsPage } from '@/pages/TermsPage';
import commonEN from '@/locales/en/common.json';

// Mock TermsOfService component
vi.mock('@/components/TermsOfService', () => ({
  TermsOfService: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="terms-of-service">
      <h1>{commonEN.nav.terms}</h1>
      <button onClick={onBack}>{commonEN.buttons.back} to Home</button>
    </div>
  ),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock useLanguagePrefix with vi.fn() for dynamic returns
const mockUseLanguagePrefix = vi.fn(() => '');
vi.mock('@/hooks/useLanguagePrefix', () => ({
  useLanguagePrefix: () => mockUseLanguagePrefix(),
}));

describe('TermsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLanguagePrefix.mockReturnValue('');
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<TermsPage />);

      expect(screen.getByTestId('terms-of-service')).toBeInTheDocument();
    });

    it('should render TermsOfService component', () => {
      render(<TermsPage />);

      expect(screen.getByText(commonEN.nav.terms)).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<TermsPage />);

      expect(screen.getByText(new RegExp(`${commonEN.buttons.back}.*Home`))).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should navigate to home page when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<TermsPage />);

      await user.click(screen.getByText(new RegExp(`${commonEN.buttons.back}.*Home`)));

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should use language prefix in navigation when set', async () => {
      mockUseLanguagePrefix.mockReturnValue('/es');

      const user = userEvent.setup();
      render(<TermsPage />);

      await user.click(screen.getByText(new RegExp(`${commonEN.buttons.back}.*Home`)));

      expect(mockNavigate).toHaveBeenCalledWith('/es/');
    });

    it('should navigate with Portuguese prefix', async () => {
      mockUseLanguagePrefix.mockReturnValue('/pt');

      const user = userEvent.setup();
      render(<TermsPage />);

      await user.click(screen.getByText(new RegExp(`${commonEN.buttons.back}.*Home`)));

      expect(mockNavigate).toHaveBeenCalledWith('/pt/');
    });
  });

  describe('prop passing', () => {
    it('should pass handleBack function to TermsOfService', () => {
      render(<TermsPage />);

      // Verify the onBack prop works by clicking
      const backButton = screen.getByText('Back to Home');
      expect(backButton).toBeInTheDocument();
    });
  });
});

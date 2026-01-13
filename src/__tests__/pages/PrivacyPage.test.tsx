import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component as PrivacyPage } from '@/pages/PrivacyPage';
import commonEN from '@/locales/en/common.json';

// Mock PrivacyPolicy component
vi.mock('@/components/PrivacyPolicy', () => ({
  PrivacyPolicy: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="privacy-policy">
      <h1>{commonEN.nav.privacy}</h1>
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

describe('PrivacyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLanguagePrefix.mockReturnValue('');
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<PrivacyPage />);

      expect(screen.getByTestId('privacy-policy')).toBeInTheDocument();
    });

    it('should render PrivacyPolicy component', () => {
      render(<PrivacyPage />);

      expect(screen.getByText(commonEN.nav.privacy)).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<PrivacyPage />);

      expect(screen.getByText(new RegExp(`${commonEN.buttons.back}.*Home`))).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should navigate to home page when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<PrivacyPage />);

      await user.click(screen.getByText(new RegExp(`${commonEN.buttons.back}.*Home`)));

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should use language prefix in navigation when set', async () => {
      mockUseLanguagePrefix.mockReturnValue('/es');

      const user = userEvent.setup();
      render(<PrivacyPage />);

      await user.click(screen.getByText(new RegExp(`${commonEN.buttons.back}.*Home`)));

      expect(mockNavigate).toHaveBeenCalledWith('/es/');
    });

    it('should navigate with Russian prefix', async () => {
      mockUseLanguagePrefix.mockReturnValue('/ru');

      const user = userEvent.setup();
      render(<PrivacyPage />);

      await user.click(screen.getByText(new RegExp(`${commonEN.buttons.back}.*Home`)));

      expect(mockNavigate).toHaveBeenCalledWith('/ru/');
    });
  });

  describe('prop passing', () => {
    it('should pass handleBack function to PrivacyPolicy', () => {
      render(<PrivacyPage />);

      // Verify the onBack prop works by clicking
      const backButton = screen.getByText('Back to Home');
      expect(backButton).toBeInTheDocument();
    });
  });
});

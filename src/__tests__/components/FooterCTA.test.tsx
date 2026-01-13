import { vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import commonEN from '@/locales/en/common.json';
import { createI18nMock } from '@/__tests__/utils/mockI18n';

vi.mock('react-i18next', () => createI18nMock(commonEN));

import { FooterCTA } from '@/components/FooterCTA';

describe('FooterCTA Component', () => {
  const defaultProps = {
    onStart: vi.fn(),
    onSample: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should render CTA title', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(screen.getByText(commonEN.cta.title)).toBeInTheDocument();
    });

    it('should render CTA subtitle', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(screen.getByText(commonEN.cta.subtitle)).toBeInTheDocument();
    });

    it('should render tagline', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(screen.getByText(commonEN.cta.tagline)).toBeInTheDocument();
    });

    it('should render Logo component', () => {
      render(<FooterCTA {...defaultProps} />);

      // Logo renders as an img element
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('CTA buttons', () => {
    it('should render Get Started button', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
    });

    it('should render Try Sample button', () => {
      render(<FooterCTA {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Try Sample/i })).toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    it('should call onStart when Get Started button is clicked', async () => {
      const user = userEvent.setup();
      render(<FooterCTA {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Get Started/i }));

      expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
    });

    it('should call onSample when Try Sample button is clicked', async () => {
      const user = userEvent.setup();
      render(<FooterCTA {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Try Sample/i }));

      expect(defaultProps.onSample).toHaveBeenCalledTimes(1);
    });

    it('should not call onSample when Get Started is clicked', async () => {
      const user = userEvent.setup();
      render(<FooterCTA {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Get Started/i }));

      expect(defaultProps.onSample).not.toHaveBeenCalled();
    });

    it('should not call onStart when Try Sample is clicked', async () => {
      const user = userEvent.setup();
      render(<FooterCTA {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Try Sample/i }));

      expect(defaultProps.onStart).not.toHaveBeenCalled();
    });
  });
});

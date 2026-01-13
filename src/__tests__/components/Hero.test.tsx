import { vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import translation before mocking
import heroEN from '@/locales/en/hero.json';
import { createI18nMock } from '@/__tests__/utils/mockI18n';

vi.mock('react-i18next', () => createI18nMock(heroEN));

import { Hero } from '@/components/Hero';

describe('Hero Component', () => {
  const defaultProps = {
    onStartGuide: vi.fn(),
    onLoadSample: vi.fn(),
    onUploadDirect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render main headline with translated text', () => {
      render(<Hero {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(heroEN.headline.prefix);
      expect(heading).toHaveTextContent(heroEN.headline.highlight);
      expect(heading).toHaveTextContent(heroEN.headline.suffix);
    });

    it('should render subheadline', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByText(heroEN.subheadline)).toBeInTheDocument();
    });

    it('should render version badge', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByText(heroEN.version)).toBeInTheDocument();
    });
  });

  describe('CTA buttons', () => {
    it('should render primary CTA button when no data', () => {
      render(<Hero {...defaultProps} hasData={false} />);

      expect(
        screen.getByRole('button', { name: new RegExp(heroEN.buttons.getGuide, 'i') })
      ).toBeInTheDocument();
    });

    it('should render "View Results" button when hasData is true', () => {
      render(<Hero {...defaultProps} hasData={true} onContinue={vi.fn()} />);

      expect(
        screen.getByRole('button', { name: new RegExp(heroEN.buttons.viewResults, 'i') })
      ).toBeInTheDocument();
    });

    it('should render sample data button', () => {
      render(<Hero {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: new RegExp(heroEN.buttons.trySample, 'i') })
      ).toBeInTheDocument();
    });

    it('should render "I already have my ZIP file" link when no data', () => {
      render(<Hero {...defaultProps} hasData={false} />);

      expect(
        screen.getByRole('button', { name: new RegExp(heroEN.buttons.haveFile, 'i') })
      ).toBeInTheDocument();
    });

    it('should not render "I already have my ZIP file" link when hasData is true', () => {
      render(<Hero {...defaultProps} hasData={true} />);

      expect(
        screen.queryByRole('button', { name: new RegExp(heroEN.buttons.haveFile, 'i') })
      ).not.toBeInTheDocument();
    });
  });

  describe('trust badges', () => {
    it('should render trust badges', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByText(heroEN.trust.free)).toBeInTheDocument();
      expect(screen.getByText(heroEN.trust.noPassword)).toBeInTheDocument();
      expect(screen.getByText(heroEN.trust.privacy)).toBeInTheDocument();
    });
  });

  describe('feature cards', () => {
    it('should render all four feature cards', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByText(heroEN.features.local.title)).toBeInTheDocument();
      expect(screen.getByText(heroEN.features.noLogin.title)).toBeInTheDocument();
      expect(screen.getByText(heroEN.features.scale.title)).toBeInTheDocument();
      expect(screen.getByText(heroEN.features.openSource.title)).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByText(heroEN.features.local.description)).toBeInTheDocument();
      expect(screen.getByText(heroEN.features.noLogin.description)).toBeInTheDocument();
      expect(screen.getByText(heroEN.features.scale.description)).toBeInTheDocument();
      expect(screen.getByText(heroEN.features.openSource.description)).toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    it('should call onStartGuide when primary CTA is clicked', async () => {
      const user = userEvent.setup();
      render(<Hero {...defaultProps} />);

      await user.click(
        screen.getByRole('button', { name: new RegExp(heroEN.buttons.getGuide, 'i') })
      );

      expect(defaultProps.onStartGuide).toHaveBeenCalledTimes(1);
    });

    it('should call onLoadSample when sample button is clicked', async () => {
      const user = userEvent.setup();
      render(<Hero {...defaultProps} />);

      await user.click(
        screen.getByRole('button', { name: new RegExp(heroEN.buttons.trySample, 'i') })
      );

      expect(defaultProps.onLoadSample).toHaveBeenCalledTimes(1);
    });

    it('should call onUploadDirect when "I already have my ZIP file" is clicked', async () => {
      const user = userEvent.setup();
      render(<Hero {...defaultProps} />);

      await user.click(
        screen.getByRole('button', { name: new RegExp(heroEN.buttons.haveFile, 'i') })
      );

      expect(defaultProps.onUploadDirect).toHaveBeenCalledTimes(1);
    });

    it('should call onContinue when "View Results" is clicked', async () => {
      const user = userEvent.setup();
      const onContinue = vi.fn();
      render(<Hero {...defaultProps} hasData={true} onContinue={onContinue} />);

      await user.click(
        screen.getByRole('button', { name: new RegExp(heroEN.buttons.viewResults, 'i') })
      );

      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });
});
